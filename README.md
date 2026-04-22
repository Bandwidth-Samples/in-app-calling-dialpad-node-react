# In-App Calling Dialpad

A minimal sample showing how to migrate from the v1 WebRTC SDK to v2. The key change: instead of baking an auth token into your app, fetch it server-side via OAuth client credentials.

# Prerequisites

Your account must have In-App Calling enabled. See [Account Credentials](https://dev.bandwidth.com/docs/account/credentials) for API setup.

# Setup

```sh
cp .env.example .env
```

Edit `.env`:

```sh
# React (baked into bundle)
REACT_APP_ACCOUNT_ID=<your-account-id>
REACT_APP_ACCOUNT_USERNAME=<source-phone-number>

# Express backend
BW_ID_CLIENT_ID=<your-client-id>
BW_ID_CLIENT_SECRET=<your-client-secret>
```

# Running

```sh
npm install
npm start
# → Backend on http://localhost:3000
# → React on http://localhost:3001
```

# What Changed

**v1 (old):** Auth token passed via environment variable.

**v2 (new):** Backend's `GET /access-token` endpoint mints a short-lived token using client credentials. DialPad fetches it on mount and hands it to `setOAuthToken()`. Client secret never leaves the server.

# Minimal Migration Example

See `src/components/DialPad.js` for the key pattern:

```js
// Fetch OAuth token from backend on mount
const fetchAuthToken = async () => {
  const res = await fetch('/access-token');
  const { access_token } = await res.json();
  return access_token;
};

// Initialize SDK (same v1 API, v2 SDK)
const phone = new BandwidthUA({
  accountId: accountId,
  gatewayUrl: process.env.REACT_APP_GATEWAY_URL,
  httpBaseUrl: process.env.REACT_APP_HTTP_BASE_URL,
  eventCallbackUrl: process.env.REACT_APP_EVENT_CALLBACK_URL,
});

phone.setAccount(sourceNumber, 'In-App Calling Sample', '');
const token = await fetchAuthToken();
phone.setOAuthToken(token);
await phone.init();
```

And in `server/index.ts`:

```js
// Backend endpoint: mint OAuth token (client credentials → access_token)
app.get('/access-token', async (_req, res) => {
  const token = await getAuthToken();
  res.json({ access_token: token });
});

// getAuthToken() does the client-credentials exchange with Bandwidth's IDP
async function getAuthToken() {
  const response = await fetch(`${BW_ID_HOSTNAME}/api/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${BW_ID_CLIENT_ID}:${BW_ID_CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });
  const data = await response.json();
  return data.access_token;
}
```

That's it. Copy this pattern into your own app.
