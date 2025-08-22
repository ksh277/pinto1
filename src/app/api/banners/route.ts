import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from '@/lib/firebase.admin';

export async function GET() {
  const db = getFirestore();
  const snap = await db.collection('banners').orderBy('createdAt', 'desc').get();
  const banners = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  const data = await req.json();
  const db = getFirestore();
  const docRef = await db.collection('banners').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: docRef.id });
}
