
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { Product } from '@/lib/types';
import { db, auth, functions, firebaseInitialized } from '@/lib/firebase';
import Link from 'next/link';

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);
  const [counts, setCounts] = useState({
    like: product.stats?.likeCount ?? 0,
    review: product.stats?.reviewCount ?? 0,
  });

  // 실시간 카운트 구독 (선택: 이미 리스트에서 값 받으면 생략 가능)
  useEffect(() => {
    if (!firebaseInitialized) return;
    const unsub = onSnapshot(doc(db, 'products', product.id), (snap) => {
      const d = snap.data() as Product;
      if (!d) return;
      setCounts({
        like: d.stats?.likeCount ?? 0,
        review: d.stats?.reviewCount ?? 0,
      });
    });
    return () => unsub();
  }, [product.id]);

  // 현재 사용자가 이미 좋아요 눌렀는지
  useEffect(() => {
    if (!firebaseInitialized) return;
    const uid = auth.currentUser?.uid;
    if (!uid) { setLiked(false); return; }
    const unsub = onSnapshot(doc(db, `products/${product.id}/likes`, uid), (s) => {
      setLiked(s.exists());
    });
    return () => unsub();
  }, [auth.currentUser, product.id]);

  const toggleLike = async () => {
    if (!firebaseInitialized) {
        alert('Firebase is not configured. Please add API keys to your .env file.');
        return;
    }
    const user = auth.currentUser;
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    const call = httpsCallable(functions, 'toggleProductLike');
    // 낙관적 UI
    setLiked(v => !v);
    try {
      await call({ productId: product.id });
      // 실제 카운트는 onSnapshot으로 따라옴
    } catch (e) {
      // 실패 시 롤백
      setLiked(v => !v);
      console.error('Like failed:', e);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

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
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <button
            className={`flex items-center gap-1 transition ${
              liked ? 'text-rose-500' : 'hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            onClick={toggleLike}
            aria-label="좋아요"
          >
            <Heart
              className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`}
            />
            {(counts.like ?? 0) > 0 && <span>{counts.like}</span>}
          </button>
           {(counts.review ?? 0) > 0 && <span>후기 {counts.review}</span>}
        </div>
      </div>
    </div>
  );
}
