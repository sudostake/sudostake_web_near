import admin, { ServiceAccount } from 'firebase-admin';

function parseServiceAccount(json: string): ServiceAccount {
  const trimmed = json.trim();
  const unwrapped =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;
  try {
    return JSON.parse(unwrapped) as ServiceAccount;
  } catch (e) {
    // In some environments (e.g., .env files), \n may be expanded to real newlines,
    // which makes the JSON invalid. Try normalizing by re-escaping newlines.
    try {
      const normalized = unwrapped.replace(/\n/g, "\\n");
      return JSON.parse(normalized) as ServiceAccount;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON: ${msg}. ` +
          `Please ensure the value is valid JSON and that special characters are properly escaped (e.g., use double quotes for strings, escape newlines and backslashes).`
      );
    }
  }
}

export function initFirebaseAdmin(): void {
  if (admin.apps.length) return;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    // Defer throwing until actually needed at runtime by callers
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }
  const serviceAccount = parseServiceAccount(serviceAccountJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  try {
    admin.firestore().settings({ ignoreUndefinedProperties: true });
  } catch {}
}

export function getAdmin() {
  if (!admin.apps.length) {
    initFirebaseAdmin();
  }
  return admin;
}
