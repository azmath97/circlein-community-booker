// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    // Check for the service account key in environment variables
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

    if (privateKey && clientEmail && projectId) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'), // Important for multiline private key
        }),
      });
      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.error('Missing Firebase Admin SDK environment variables:', {
        hasPrivateKey: !!privateKey,
        hasClientEmail: !!clientEmail,
        hasProjectId: !!projectId,
      });
      
      // Fallback: Initialize without credentials for development
      admin.initializeApp({
        projectId: 'circlein-app', // hardcoded for development
      });
      console.warn('Firebase Admin SDK initialized with minimal configuration');
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    
    // Fallback: Initialize with minimal config
    try {
      admin.initializeApp({
        projectId: 'circlein-app',
      });
      console.warn('Firebase Admin SDK initialized with fallback configuration');
    } catch (fallbackError) {
      console.error('Firebase Admin SDK fallback initialization failed:', fallbackError);
    }
  }
}

// Export services with error handling
export const adminAuth = (() => {
  try {
    return admin.auth();
  } catch (error) {
    console.error('Failed to get admin auth service:', error);
    return null;
  }
})();

export const adminFirestore = (() => {
  try {
    return admin.firestore();
  } catch (error) {
    console.error('Failed to get admin firestore service:', error);
    return null;
  }
})();
