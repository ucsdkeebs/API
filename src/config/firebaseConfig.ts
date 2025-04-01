import admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID || '';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
} else {
    // In test environments the Firebase config may not be set.
    // You can either skip initialization or provide dummy values.
    console.warn('Firebase configuration is not fully defined. Skipping Firebase admin initialization.');
}

export default admin;
