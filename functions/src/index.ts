/* eslint-disable */
// @ts-nocheck
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const setUserRole = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  const roles = (auth.token.roles as string[]) || [];
  if (!roles.includes('admin')) {
    throw new HttpsError('permission-denied', 'Only admins can set roles');
  }
  const { uid, roles: newRoles } = request.data || {};
  if (!uid || !Array.isArray(newRoles)) {
    throw new HttpsError('invalid-argument', 'uid and roles are required');
  }
  await admin.auth().setCustomUserClaims(uid, { roles: newRoles });
  return { success: true };
});

export const migrateOperatorIds = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required');

  const roles = ((auth.token.roles as string[]) ?? []);
  if (!roles.includes('admin')) {
    throw new HttpsError('permission-denied', 'Only admins can run migration');
  }

  const { dryRun = true, pageSize = 300 } = request.data ?? {};
  const db = admin.firestore();

  let scanned = 0;
  let updated = 0;
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  while (true) {
    let q = db.collection('products')
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(pageSize as number);

    if (lastDoc) q = q.startAfter(lastDoc.id);

    const snap = await q.get();
    if (snap.empty) break;

    const batch = db.batch();
    for (const doc of snap.docs) {
      scanned++;
      const data = doc.data() as any;
      const hasOps = Array.isArray(data.operatorIds) && data.operatorIds.length > 0;
      const sellerId = data.sellerId as string | undefined;

      let changed = false;
      let nextOps: string[] = data.operatorIds ?? [];

      if (!hasOps && sellerId) {
        nextOps = [sellerId];
        changed = true;
      }

      if (changed) {
        if (!dryRun) batch.update(doc.ref, { operatorIds: nextOps });
        updated++;
      }
    }

    if (!dryRun && updated > 0) {
      await batch.commit();
    }

    lastDoc = snap.docs[snap.docs.length - 1];
  }

  return { scanned, updated, dryRun };
});
