
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import { toggleLike, getLikeCount, getMyLike } from '@/lib/likes';

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const [counts, setCounts] = useState({
    like: product.stats?.likeCount ?? 0,
    review: product.stats?.reviewCount ?? 0,
  });

  useEffect(() => {
    getLikeCount(product.id).then((c) =>
      setCounts((prev) => ({ ...prev, like: c }))
    );
    getMyLike(product.id).then(setLiked);
  }, [product.id]);

  const onToggle = async () => {
    const prevLiked = liked;
    const prevCount = counts.like;
    setLiked(!prevLiked);
    setCounts((p) => ({ ...p, like: prevLiked ? p.like - 1 : p.like + 1 }));
    try {
      await toggleLike(product.id);
    } catch (e) {
      setLiked(prevLiked);
      setCounts((p) => ({ ...p, like: prevCount }));
      const msg = e instanceof Error ? e.message : 'error';
      if (msg === 'login-required') alert('로그인이 필요합니다.');
      else alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition hover:scale-[1.01] hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
        <Image
          src={product.imageUrl || 'https://placehold.co/600x600.png'}
          alt={product.nameKo}
          fill
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
      </div>
      <div className="mt-3 line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
        {product.nameKo}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-slate-900 dark:text-slate-100">
        {product.priceKrw?.toLocaleString()}원~
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>리뷰 {counts.review}</span>
        <button
          className={`flex items-center gap-1 transition ${
            liked ? 'text-rose-500' : 'hover:text-slate-700 dark:hover:text-slate-200'
          }`}
          onClick={e => {
            e.preventDefault();
            onToggle();
          }}
          aria-label="좋아요"
        >
          <Heart
            className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`}
          />
          <span>{counts.like}</span>
        </button>
      </div>
    </Link>
  );
}
