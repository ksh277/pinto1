// src/app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Configure your REMBG server (FastAPI or any) endpoint via env
const REMBG_URL = process.env.REMBG_URL || '';

export async function POST(req: NextRequest){
  try {
    if (!REMBG_URL) {
      return NextResponse.json({ error: 'REMBG_URL is not configured' }, { status: 500 });
    }
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 });

    const upstream = new FormData();
    upstream.set('file', file);

    const res = await fetch(REMBG_URL, { method: 'POST', body: upstream });
    if (!res.ok) {
      const msg = await res.text();
      return NextResponse.json({ error: 'upstream error', detail: msg }, { status: 502 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return new NextResponse(buf, { headers: { 'content-type': 'image/png' } });
  } catch (e:any) {
    return NextResponse.json({ error: 'unexpected', detail: e?.message }, { status: 500 });
  }
}
