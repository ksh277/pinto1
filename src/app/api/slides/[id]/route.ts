import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from '@/lib/firebase.admin';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getFirestore();
  const doc = await db.collection('slides').doc(params.id).get();
  if (!doc.exists) return NextResponse.json(null, { status: 404 });
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  const db = getFirestore();
  await db.collection('slides').doc(params.id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: params.id });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const db = getFirestore();
  await db.collection('slides').doc(params.id).delete();
  return NextResponse.json({ id: params.id });
}
