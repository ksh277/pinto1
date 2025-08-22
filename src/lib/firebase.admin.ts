
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, FieldPath, Timestamp } from 'firebase-admin/firestore';

const usingEmulators = !!process.env.FIREBASE_AUTH_EMULATOR_HOST
  || !!process.env.FIRESTORE_EMULATOR_HOST
  || !!process.env.FIREBASE_STORAGE_EMULATOR_HOST;

const hasSvcCreds = !!process.env.FB_PRIVATE_KEY
  && !!process.env.FB_CLIENT_EMAIL
  && !!process.env.FB_PROJECT_ID;

if (!getApps().length) {
  if (usingEmulators) {
    // Local emulator: works without credentials, just needs projectId.
    initializeApp({ projectId: process.env.FB_PROJECT_ID || process.env.GCLOUD_PROJECT || 'demo-local' });
  } else if (hasSvcCreds) {
    // Service account (server/deploy)
    initializeApp({
      credential: cert({
        projectId: process.env.FB_PROJECT_ID!,
        clientEmail: process.env.FB_CLIENT_EMAIL!,
        privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // GCP runtime/ADC (e.g., local with gcloud auth application-default login)
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FB_PROJECT_ID || process.env.GCLOUD_PROJECT,
    });
  }
}

export { getAuth, getFirestore, FieldValue, FieldPath, Timestamp };
