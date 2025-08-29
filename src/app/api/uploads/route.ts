import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const required = ['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const
    const missing = required.filter((k) => !process.env[k])
    if (missing.length) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Storage not configured',
          detail: `Missing env: ${missing.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Background removal/upload not implemented in this stub.
    return NextResponse.json(
      { ok: false, error: 'Background removal/upload is not enabled in this build.' },
      { status: 501 },
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

