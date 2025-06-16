const admin = require('firebase-admin');
require('dotenv').config();

let adminApp = null;
let db = null;
let storage = null;

try {
    // Check if all required Firebase credentials are present
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_PRIVATE_KEY_ID && 
        process.env.FIREBASE_PRIVATE_KEY && 
        process.env.FIREBASE_CLIENT_EMAIL && 
        process.env.FIREBASE_CLIENT_ID && 
        process.env.FIREBASE_CLIENT_CERT_URL) {
        
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };

        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        db = admin.firestore();
        storage = admin.storage();
        
        console.log('Firebase Admin initialized successfully');
    } else {
        console.log('Firebase credentials not provided, Firebase functionality will be disabled');
    }
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Don't throw error here, let the app start even if Firebase fails
}

module.exports = { admin: adminApp, db, storage }; 