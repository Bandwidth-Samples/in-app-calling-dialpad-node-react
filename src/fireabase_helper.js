// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDO2hjQ9Zy4xlGtsG4KGb361Ahn2YGlUZU",
    authDomain: "notification-dispatcher-be56d.firebaseapp.com",
    projectId: "notification-dispatcher-be56d",
    storageBucket: "notification-dispatcher-be56d.appspot.com",
    messagingSenderId: "394288358610",
    appId: "1:394288358610:web:401e55d2464231f4a6790b"
};
// Initialize Firebase
var app;
try {
    app = initializeApp(firebaseConfig);
    console.log('Initializing complete');
} catch (e) {
    console.error('Error initializing app: ', e);
}
// Export firestore database
// It will be imported into your react app whenever it is needed
const db = getFirestore(app);
// Setup for FCM
const messaging = getMessaging(app);
const setupNotifications = async (callback, onMsg) => {
    try {
        // Request permission for notifications
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // Get the FCM token
            const token = await getToken(messaging);
            callback(token);
            console.log('FCM Token:', token);
        } else {
            console.log('Notification permission denied.');
            callback(null);
        }
        // Handle foreground notifications
        onMessage(messaging, (payload) => {
            onMsg(payload);
            console.log('Foreground Message:', payload);
            // Handle the notification or update your UI
        });
    } catch (error) {
        console.error('Error setting up notifications:', error);
        callback(null);
    }
};

export { db, messaging, setupNotifications };