const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

let db;

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath) {
        // Resolve path relative to the backend root (which is 2 levels up from this file)
        const absolutePath = path.isAbsolute(serviceAccountPath) 
            ? serviceAccountPath 
            : path.join(__dirname, '..', '..', serviceAccountPath);
            
        const serviceAccount = require(absolutePath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // Fallback for environment variables (useful for CI/CD)
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
    }
    
    db = admin.firestore();
    console.log('Firestore connected successfully');
} catch (error) {
    console.error('Firestore connection error:', error);
    // Don't exit process here, allow app to start but log error
}

module.exports = { admin, db };
