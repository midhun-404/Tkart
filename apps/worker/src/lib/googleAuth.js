import { importPKCS8, SignJWT } from 'jose';

/**
 * Generates a Google OAuth2 Access Token using the Service Account.
 * required scopes: https://www.googleapis.com/auth/datastore
 */
export async function getAccessToken(env) {
    try {
        const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);

        if (!serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT");
        }

        const algorithm = 'RS256';
        const privateKey = await importPKCS8(serviceAccount.private_key, algorithm);

        const jwt = await new SignJWT({
            scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform'
        })
            .setProtectedHeader({ alg: algorithm })
            .setIssuer(serviceAccount.client_email)
            .setAudience('https://oauth2.googleapis.com/token')
            .setExpirationTime('1h')
            .setIssuedAt()
            .sign(privateKey);

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            })
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error generating Access Token:", error);
        throw error;
    }
}
