import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from '@/lib/firebase.admin';

export async function GET() {
  const db = getFirestore();
  const snap = await db.collection('section1').orderBy('order', 'asc').get();
  const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const data = await req.json();
  const db = getFirestore();
  const docRef = await db.collection('section1').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: docRef.id });
}
