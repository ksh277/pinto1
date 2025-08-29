'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductStats } from '@/types/product';

interface Props {
  product: Product;
  stats?: ProductStats;
}

export function ProductCard({ product, stats }: Props) {
  const reviewCount = stats?.reviewCount ?? 0;
  const likeCount = stats?.likeCount ?? 0;
  return (
    <div className="group rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 hover:shadow-md focus-within:ring-2 dark:bg-slate-800 dark:ring-slate-700">
      <Link href={`/product/${product.id}`} className="block focus:outline-none">
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700 aspect-square">
          <Image
            src={product.imageUrl || 'https://placehold.co/600x600.png'}
            alt={product.nameKo}
            fill
            sizes="(max-width:640px)50vw,(max-width:1024px)25vw,20vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="mt-3 line-clamp-1 text-sm text-slate-700 dark:text-slate-300">
          {product.nameKo}
        </div>
      </Link>
      <div className="mt-1 text-[15px] font-semibold text-slate-900 dark:text-slate-100">
        {product.priceKrw.toLocaleString()}원~
      </div>
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        리뷰 {reviewCount} · ❤ {likeCount}
      </div>
    </div>
  );
}
