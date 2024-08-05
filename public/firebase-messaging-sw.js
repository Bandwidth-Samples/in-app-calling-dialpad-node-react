// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDO2hjQ9Zy4xlGtsG4KGb361Ahn2YGlUZU",
  authDomain: "notification-dispatcher-be56d.firebaseapp.com",
  projectId: "notification-dispatcher-be56d",
  storageBucket: "notification-dispatcher-be56d.appspot.com",
  messagingSenderId: "394288358610",
  appId: "1:394288358610:web:401e55d2464231f4a6790b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
// Customize background notification handling here
messaging.onBackgroundMessage((payload) => {
  console.log('Background Message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
  // firebase.firestore()
  //   .collection("agents")
  //   .doc(agentId)
  //   .set({ 'callInBackground': payload.data },
  //     { merge: true });
});