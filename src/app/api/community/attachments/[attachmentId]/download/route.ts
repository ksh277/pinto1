import { NextResponse } from 'next/server';
import { getFirestore, FieldPath, FieldValue } from '@/lib/firebase.admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  try {
    const { attachmentId } = await params;
    const db = getFirestore();
    const snap = await db
      .collectionGroup('attachments')
      .where(FieldPath.documentId(), '==', attachmentId)
      .limit(1)
      .get();

    if (snap.empty)
      return NextResponse.json({ error: 'not-found' }, { status: 404 });

    const doc = snap.docs[0];
    const url = doc.get('downloadURL') as string | undefined;
    if (!url)
      return NextResponse.json({ error: 'missing-url' }, { status: 500 });

    await doc.ref.update({ downloadCount: FieldValue.increment(1) });

    return NextResponse.redirect(url, 302);
  } catch (e) {
    const message = e instanceof Error ? e.message : undefined;
    const status = message?.includes('document path') ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? 'not-found' : 'internal', detail: message },
      { status },
    );
  }
}
