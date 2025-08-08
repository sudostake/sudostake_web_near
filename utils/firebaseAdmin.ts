import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }
  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Please check that it is valid JSON.'
    );
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
