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
