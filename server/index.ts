import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Required environment variables
const BW_ID_CLIENT_ID = process.env.BW_ID_CLIENT_ID;
const BW_ID_CLIENT_SECRET = process.env.BW_ID_CLIENT_SECRET;
const BW_ID_HOSTNAME = process.env.BW_ID_HOSTNAME || 'https://api.bandwidth.com';
const PORT = parseInt(process.env.PORT || '3000', 10);

if (!BW_ID_CLIENT_ID || !BW_ID_CLIENT_SECRET) {
    throw new Error('Missing required environment variables: BW_ID_CLIENT_ID, BW_ID_CLIENT_SECRET');
}

// Token cache
let cachedToken: string = '';
let tokenExpiresAt: number = 0;

async function getAuthToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    const response = await fetch(`${BW_ID_HOSTNAME}/api/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${BW_ID_CLIENT_ID}:${BW_ID_CLIENT_SECRET}`).toString('base64'),
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    if (!response.ok) {
        throw new Error(`OAuth token request failed: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 10) * 1000;
    return cachedToken;
}

// GET /access-token - Return a cached OAuth token (minted server-side).
// BW_ID_CLIENT_SECRET never leaves the server.
app.get('/access-token', async (_req: Request, res: Response) => {
    try {
        const token = await getAuthToken();
        res.json({ access_token: token });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`OAuth token server listening on http://localhost:${PORT}`);
});
