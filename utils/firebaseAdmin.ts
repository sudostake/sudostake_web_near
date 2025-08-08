import admin, { ServiceAccount } from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }
  let serviceAccount: ServiceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON: ${err.message}`
      );
    } else {
      throw err;
    }
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
