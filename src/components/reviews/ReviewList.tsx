"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase.client";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";

interface Review {
  id: string;
  rating: number;
  text: string;
  author?: { uid: string; name?: string };
  createdAt?: Timestamp;
}

export default function ReviewList({
  productId,
  refresh = 0,
}: {
  productId: string;
  refresh?: number;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, `products/${productId}/reviews`),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, "id">),
      }));
      setReviews(list);
      const sum = list.reduce((a, b) => a + (b.rating || 0), 0);
      setAvg(list.length ? sum / list.length : 0);
    })();
  }, [productId, refresh]);

  async function remove(id: string) {
    try {
      await deleteDoc(doc(db, `products/${productId}/reviews/${id}`));
      const rest = reviews.filter((r) => r.id !== id);
      setReviews(rest);
      const sum = rest.reduce((a, b) => a + (b.rating || 0), 0);
      setAvg(rest.length ? sum / rest.length : 0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "삭제 실패";
      alert(msg);
    }
  }

  return (
    <div className="space-y-4">
      <p>
        평균 별점: {avg.toFixed(1)} / 5 ({reviews.length}개)
      </p>
      {reviews.map((r) => (
        <div key={r.id} className="border p-3 rounded">
          <p className="text-sm text-yellow-500">★ {r.rating} / 5</p>
          <p>{r.text}</p>
          {auth.currentUser?.uid === r.author?.uid && (
            <button
              onClick={() => remove(r.id)}
              className="text-red-600 text-sm"
            >
              삭제
            </button>
          )}
        </div>
      ))}
      {reviews.length === 0 && <p>아직 작성된 후기가 없습니다.</p>}
    </div>
  );
}
