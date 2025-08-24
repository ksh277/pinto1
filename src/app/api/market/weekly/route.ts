import { NextRequest, NextResponse } from 'next/server';

// Temporary stub data for weekly market ranking
const SAMPLE = [
  {
    id: 'sample-1',
    nameKo: '샘플 상품 1',
    priceKrw: 1200,
    imageUrl: 'https://placehold.co/600x600.png',
    rank: 1,
  },
  {
    id: 'sample-2',
    nameKo: '샘플 상품 2',
    priceKrw: 2300,
    imageUrl: 'https://placehold.co/600x600.png',
    rank: 2,
  },
  {
    id: 'sample-3',
    nameKo: '샘플 상품 3',
    priceKrw: 3400,
    imageUrl: 'https://placehold.co/600x600.png',
    rank: 3,
  },
  {
    id: 'sample-4',
    nameKo: '샘플 상품 4',
    priceKrw: 4500,
    imageUrl: 'https://placehold.co/600x600.png',
    rank: 4,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '4', 10);
  return NextResponse.json(SAMPLE.slice(0, limit));
}
