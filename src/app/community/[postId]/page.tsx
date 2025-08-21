"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase.client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { track } from "@/lib/analytics";

interface Post {
  id: string;
  title: string;
  body: string;
  author?: { uid: string; [key: string]: unknown };
  [key: string]: unknown;
}

interface Attachment {
  id: string;
  fileName: string;
  size?: number;
  downloadURL: string;
  [key: string]: unknown;
}

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [files, setFiles] = useState<Attachment[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const d = await getDoc(doc(db, "community", postId));
      const data = d.data();
        if (data) {
          setPost({ id: d.id, ...(data as Omit<Post, "id">) } as Post);
        }
        const a = await getDocs(collection(db, `community/${postId}/attachments`));
        setFiles(
          a.docs.map((docSnap) => {
            const dData = docSnap.data() as Omit<Attachment, "id">;
            return { id: docSnap.id, ...dData };
          }) as Attachment[]
        );
      })();
  }, [postId]);

  if (!post) return <div>불러오는 중…</div>;

  async function handleDelete() {
    if (!post) return;
    if (!confirm("삭제하시겠습니까?")) return;
    const snap = await getDocs(collection(db, `community/${postId}/attachments`));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, "community", postId));
    alert("삭제되었습니다.");
    router.replace(`/products/${post.productId}`);
  }

  const isAuthor = auth.currentUser?.uid === post.author?.uid;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{post.title}</h1>
        {isAuthor && (
          <button onClick={handleDelete} className="text-red-600 text-sm">
            삭제
          </button>
        )}
      </div>
      <p className="whitespace-pre-wrap">{post.body}</p>

      <h2 className="font-semibold mt-6">첨부 PDF</h2>
      <ul className="list-disc pl-6">
        {files.map((f) => (
          <li key={f.id}>
            <a
              href={f.downloadURL}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
              onClick={() =>
                track("download_design_pdf", { post_id: postId, file: f.fileName })
              }
            >
              {f.fileName} ({Math.round((f.size || 0) / 1024 / 1024)}MB)
            </a>
          </li>
        ))}
        {files.length === 0 && <li>첨부가 없습니다.</li>}
      </ul>
    </div>
  );
}

