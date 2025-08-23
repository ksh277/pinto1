import { NextResponse } from "next/server";
export async function GET() {
  const mk = (i:number)=>({
    id: `p-${i}`,
    name: `아크릴 키링 ${i}`,
    price: 8900 + i*100,
    thumbnail: `https://picsum.photos/seed/pinto${i}/800/800`,
    likeCount: 1200 + i*3,
    reviewCount: 300 + i*2,
    href: `/product/p-${i}`,
  });
  return NextResponse.json({
    recommended: Array.from({length:8}).map((_,i)=>mk(i+1)),
    creatorPicks: Array.from({length:4}).map((_,i)=>mk(i+21)),
  });
}
