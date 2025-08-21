"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase.client";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

interface Item {
  id: string;
  title: string;
  author?: { displayName?: string };
  type?: string;
}

export default function PostList({ productId }: { productId: string }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, "community"),
        where("productId", "==", productId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setItems(
        snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Item, "id">),
        }))
      );
    })();
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
    </div>
  );
}

