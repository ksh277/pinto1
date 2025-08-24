/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      mode, templateShape,
      size, offsets, hole, paths, state,
      previewDataUrl,
    } = body

    let previewBuffer: Buffer | undefined
    if (typeof previewDataUrl === 'string' && previewDataUrl.startsWith('data:image/png;base64,')) {
      previewBuffer = Buffer.from(previewDataUrl.replace('data:image/png;base64,', ''), 'base64')
    }

    const created = await prisma.design.create({
      data: {
        mode,
        templateShape: templateShape ?? null,
        widthMM: size.widthMM,
        heightMM: size.heightMM,
        dpi: size.dpi,
        bleedMM: size.bleedMM,
        safeMM: size.safeMM,
        borderMM: offsets.borderMM,
        cutOffsetMM: offsets.cutOffsetMM,
        holeX: hole.x,
        holeY: hole.y,
        holeDiameterMM: hole.diameterMM,
        boardPath: paths.boardPath ?? undefined,
        cutlinePath: paths.cutlinePath ?? undefined,
        stateJson: state,
        previewPng: previewBuffer,
      },
    })

    return NextResponse.json({ ok: true, id: created.id })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

export async function GET() {
  const items = await prisma.design.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json({ items: items.map(i => ({ id: i.id, createdAt: i.createdAt, mode: i.mode })) })
}
