import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase.admin';

export async function GET() {
  const db = getFirestore();
  const snap = await db
    .collection('slides')
    .where('isActive', '==', true)
    .orderBy('order', 'asc')
    .limit(8)
    .get();
  const slides = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(slides);
}
