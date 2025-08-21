import { auth } from '@/lib/firebase.client';

export async function authedFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken(true);
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
