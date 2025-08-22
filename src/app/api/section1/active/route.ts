import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase.admin';

export async function GET() {
  const db = getFirestore();
  const snap = await db
    .collection('section1')
    .where('isActive', '==', true)
    .orderBy('order', 'asc')
    .limit(12)
    .get();
  const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(items);
}
