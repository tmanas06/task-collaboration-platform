import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const initializeFirebaseAdmin = () => {
    if (admin.apps.length) return;

    try {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log('Firebase Admin: using application default credentials');
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
            return;
        }

        const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
        if (fs.existsSync(serviceAccountPath)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const serviceAccount = require(serviceAccountPath);
            console.log('Firebase Admin: using local serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            return;
        }

        console.warn('Firebase Admin: no credentials found; verifyIdToken will fail until credentials are provided');
        admin.initializeApp();
    } catch (err) {
        console.error('Firebase Admin initialization error:', err);
        if (!admin.apps.length) {
            admin.initializeApp();
        }
    }
};

initializeFirebaseAdmin();

export const auth = admin.auth();
