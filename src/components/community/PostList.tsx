'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase.client';
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';

interface Item {
  id: string;
  title: string;
  author?: { displayName?: string };
  type?: string;
}

const PAGE = 10;

export default function PostList({ productId }: { productId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  async function load() {
    const base = [
      where('productId', '==', productId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(PAGE),
    ];
    const q = cursor
      ? query(collection(db, 'community'), ...base, startAfter(cursor))
      : query(collection(db, 'community'), ...base);
    const snap = await getDocs(q);
    const docs = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Item, 'id'>),
    }));
    setItems((prev) => [...prev, ...docs]);
    const last = snap.docs[snap.docs.length - 1] || null;
    setCursor(last);
    if (snap.docs.length < PAGE) setHasMore(false);
  }

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <article key={it.id} className="border rounded p-3">
          <h3 className="font-semibold">{it.title}</h3>
          <p className="text-sm text-gray-500">
            {it.author?.displayName} • {it.type}
          </p>
          <Link
            href={`/community/${it.id}`}
            className="text-blue-600 underline"
          >
            자세히 보기
          </Link>
        </article>
      ))}
      {items.length === 0 && <p>첫 글을 작성해보세요.</p>}
      {hasMore && (
        <button
          onClick={load}
          className="px-4 py-2 rounded bg-gray-100"
          disabled={!hasMore}
        >
          더보기
        </button>
      )}
    </div>
  );
}
