"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase.client";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { track } from "@/lib/analytics";

export default function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted?: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("로그인이 필요합니다.");
    if (rating < 1 || rating > 5) return alert("별점은 1~5 사이여야 합니다.");
    setBusy(true);
    try {
      await addDoc(collection(db, `products/${productId}/reviews`), {
        rating,
        text,
        author: {
          uid: user.uid,
          name: user.displayName || user.email || "user",
        },
        createdAt: serverTimestamp(),
      });
      track("create_review", { product_id: productId, rating });
      setRating(5);
      setText("");
      onSubmitted?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "등록 실패";
      alert(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div>
        <label className="mr-2">별점</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="w-full border rounded px-2 py-1"
        placeholder="후기를 입력하세요"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        disabled={busy}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        리뷰 작성
      </button>
    </form>
  );
}
