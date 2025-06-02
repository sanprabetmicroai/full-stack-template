const admin = require('firebase-admin');
const path = require('path');

// Path to your service account file
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, db, storage }; 