'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase.client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { track } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';
import { authedFetch } from '@/lib/authedFetch';

interface Post {
  id: string;
  title: string;
  body: string;
  author?: { uid: string; [key: string]: unknown };
  status?: string;
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
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const d = await getDoc(doc(db, 'community', postId));
      const data = d.data();
      if (data) {
        setPost({ id: d.id, ...(data as Omit<Post, 'id'>) } as Post);
      }
      const a = await getDocs(
        collection(db, `community/${postId}/attachments`),
      );
      setFiles(
        a.docs.map((docSnap) => {
          const dData = docSnap.data() as Omit<Attachment, 'id'>;
          return { id: docSnap.id, ...dData };
        }) as Attachment[],
      );
    })();
  }, [postId]);

  if (!post) return <div>불러오는 중…</div>;

  async function handleDelete() {
    if (!post) return;
    if (!confirm('삭제하시겠습니까?')) return;
    const snap = await getDocs(
      collection(db, `community/${postId}/attachments`),
    );
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, 'community', postId));
    alert('삭제되었습니다.');
    router.replace(`/products/${post.productId}`);
  }

  const isAuthor = auth.currentUser?.uid === post.author?.uid;
  const isAdmin = user?.isAdmin;

  async function handleReport() {
    if (!auth.currentUser) return alert('로그인이 필요합니다.');
    const reason = prompt('신고 사유를 입력하세요') || '';
    const res = await authedFetch(`/api/community/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    if (res.status === 429) alert('잠시 후 다시 시도하세요.');
    else if (!res.ok) alert('신고에 실패했습니다.');
    else alert('신고되었습니다.');
  }

  async function toggleVisibility() {
    if (!auth.currentUser) return;
    const next = post?.status === 'hidden' ? 'active' : 'hidden';
    const res = await authedFetch(`/api/community/posts/${postId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setPost((p) => (p ? { ...p, status: next } : p));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{post.title}</h1>
        <div className="space-x-2">
          {isAuthor && (
            <button onClick={handleDelete} className="text-red-600 text-sm">
              삭제
            </button>
          )}
          {isAdmin && (
            <button
              onClick={toggleVisibility}
              className="text-sm text-gray-600"
            >
              {post.status === 'hidden' ? '복구' : '숨기기'}
            </button>
          )}
          {auth.currentUser && !isAdmin && (
            <button onClick={handleReport} className="text-sm text-gray-600">
              신고
            </button>
          )}
        </div>
      </div>
      <p className="whitespace-pre-wrap">{post.body}</p>

      <h2 className="font-semibold mt-6">첨부 PDF</h2>
      <ul className="list-disc pl-6">
        {files.map((f) => (
          <li key={f.id}>
            <a
              href={`/api/community/attachments/${f.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
              onClick={() =>
                track('download_design_pdf', {
                  post_id: postId,
                  file: f.fileName,
                })
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
