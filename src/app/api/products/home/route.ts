import { NextResponse } from 'next/server';
import { mockProducts } from '@/lib/data';
import type { HomeResponse } from '@/lib/types';

export async function GET() {
  const recommended = mockProducts.slice(0, 4);
  const creatorPicks = mockProducts.slice(4, 8);
  const body: HomeResponse = { recommended, creatorPicks };
  return NextResponse.json(body);
}
