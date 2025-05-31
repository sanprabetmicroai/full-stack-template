const admin = require('firebase-admin');
const path = require('path');

// Path to your service account file
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db }; 