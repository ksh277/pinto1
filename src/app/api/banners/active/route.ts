import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase.admin';

export async function GET() {
  const db = getFirestore();
  const snap = await db
    .collection('banners')
    .where('isOpen', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return NextResponse.json(null);
  const doc = snap.docs[0];
  return NextResponse.json({ id: doc.id, ...doc.data() });
}
