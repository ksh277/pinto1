import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, FieldPath, Timestamp } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp(
    process.env.FB_PRIVATE_KEY
      ? {
          credential: cert({
            projectId: process.env.FB_PROJECT_ID,
            clientEmail: process.env.FB_CLIENT_EMAIL,
            privateKey: process.env.FB_PRIVATE_KEY!.replace(/\\n/g, '\n'),
          }),
        }
      : { credential: applicationDefault() }
  );
}

export { getAuth, getFirestore, FieldValue, FieldPath, Timestamp };
