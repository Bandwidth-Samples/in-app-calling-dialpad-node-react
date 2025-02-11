// Store token and expiry in localStorage
const TOKEN_STORAGE_KEY = 'auth_token';
const EXPIRY_STORAGE_KEY = 'token_expiry';

// Your API details
const AUTH_URL = process.env.REACT_APP_AUTH_URL;
const header = process.env.REACT_APP_AUTH_CREDENTIALS;
const BASIC_AUTH_CREDENTIALS = btoa(header); // Base64 encoding for Basic Auth
const REFRESH_INTERVAL = 60 * 1000; // Check every 60 seconds

// Function to fetch new token
const fetchAuthToken = async () => {
    try {
        var headers = {
            'Authorization': 'Basic ' + BASIC_AUTH_CREDENTIALS,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        };
        const response = await fetch(`${AUTH_URL}`, {
            method: 'post',
            headers: headers,
            body: 'grant_type=client_credentials'
        },);

        const data = await response.json();

        console.log("Data: " + data);

        const { access_token, expires_in } = data;

        // Store token and expiry time
        localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
        localStorage.setItem(EXPIRY_STORAGE_KEY, Date.now() + expires_in * 1000);
        return access_token;
    } catch (error) {
        console.error("Error fetching auth token", error);
        return null;
    }
};

// Function to check and refresh token periodically
const startTokenRefreshLoop = () => {
    setInterval(async () => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const expiryTime = localStorage.getItem(EXPIRY_STORAGE_KEY);

        if (!token || !expiryTime) {
            console.log("[oAuth Service] No token found, fetching a new one...");
            await fetchAuthToken();
            return;
        }

        const timeLeft = expiryTime - Date.now();
        console.log(`[oAuth Service] Token expires in ${Math.floor(timeLeft / 1000)} seconds`);

        // Refresh token if it will expire in less than 2 minutes
        if (timeLeft < 2 * 60 * 1000) {
            console.log("[oAuth Service] Refreshing token before expiry...");
            await fetchAuthToken();
        }
    }, REFRESH_INTERVAL);
};


// Function to check token validity and refresh if needed
const getAuthToken = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiryTime = parseInt(localStorage.getItem(EXPIRY_STORAGE_KEY), 10);

    if (token && expiryTime && Date.now() < expiryTime - 60000) { // Refresh 1 min before expiry
        return token;
    }

    return await fetchAuthToken();
};

// Initialize authentication flow
const initAuth = async () => {
    await fetchAuthToken(); // Get initial token
    startTokenRefreshLoop(); // Start background refresh
};

export { initAuth, TOKEN_STORAGE_KEY };
