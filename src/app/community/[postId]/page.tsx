"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase.client";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

interface Post {
  id: string;
  title: string;
  body: string;
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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{post.title}</h1>
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

