import { NextResponse } from 'next/server';
import { getAuth, getFirestore, FieldValue, Timestamp } from '@/lib/firebase.admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function verify(req: Request) {
  const auth = getAuth();
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('no-token');
  const decoded = await auth.verifyIdToken(token);
  return decoded;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { uid } = await verify(req);
    const { reason = '' } = await req.json();
    const db = getFirestore();
    const { postId } = await params;
    const postRef = db.collection('community').doc(postId);

    const fiveMinAgo = Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
    const dup = await postRef
      .collection('reports')
      .where('author.uid', '==', uid)
      .where('createdAt', '>', fiveMinAgo)
      .limit(1)
      .get();
    if (!dup.empty)
      return NextResponse.json({ ok: false, dedup: true }, { status: 429 });

    await postRef.collection('reports').add({
      reason: String(reason).slice(0, 200),
      author: { uid },
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 401 });
  }
}
