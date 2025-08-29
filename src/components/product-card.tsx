
'use client';

import Image from 'next/image';
import type { Product } from '@/lib/types';
import Link from 'next/link';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 hover:shadow-md dark:bg-slate-800 dark:ring-slate-700">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700 aspect-square">
          <Image
            src={product.imageUrl || 'https://placehold.co/600x600.png'}
            alt={product.nameKo}
            fill
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        </div>
        <div className="mt-3 line-clamp-1 text-sm text-slate-700 dark:text-slate-300">
          {product.nameKo}
        </div>
      </Link>

      <div className="mt-1 flex items-center justify-between">
        <div className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
          {product.priceKrw?.toLocaleString()}원~
        </div>
        {product.stats?.reviewCount ? (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            후기 {product.stats.reviewCount}
          </div>
        ) : null}
      </div>
    </div>
  );
}
