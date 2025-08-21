import { NextResponse } from 'next/server';
import { getAuth, getFirestore } from '@/lib/firebase.admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const dec = await getAuth().verifyIdToken(token);
  if (!Array.isArray(dec.roles) || !dec.roles.includes('admin')) throw new Error('not-admin');
  return dec;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    await requireAdmin(req);
    const { status } = await req.json();
    const { postId } = await params;
    await getFirestore().collection('community').doc(postId).update({ status });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 403 });
  }
}
