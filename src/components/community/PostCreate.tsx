"use client";

import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase.client";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { track } from "@/lib/analytics";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

type Kind = "discussion" | "design_share";

export default function PostCreate({ productId }: { productId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<Kind>("design_share");
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) return alert("로그인이 필요합니다.");
    if (!title.trim()) return alert("제목을 입력하세요.");

    setBusy(true);
    try {
      // 1) 커뮤니티 글 생성
      const postRef = await addDoc(collection(db, "community"), {
        productId,
        type,
        title,
        body,
        author: {
          uid: auth.currentUser.uid,
          displayName:
            auth.currentUser.displayName ||
            auth.currentUser.email ||
            "user",
        },
        attachmentCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      track("create_community_post", { product_id: productId, type });

      // 2) 파일 업로드 (선택)
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          if (file.type !== "application/pdf") {
            alert(`PDF만 업로드 가능합니다: ${file.name}`);
            continue;
          }
          const path = `community-uploads/${postRef.id}/${auth.currentUser.uid}/${file.name}`;
          const storageRef = ref(storage, path);
          const task = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
          });

          await new Promise<void>((resolve, reject) => {
            task.on(
              "state_changed",
              (snap) =>
                setProgress(
                  Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                ),
              reject,
              () => resolve()
            );
          });

          const url = await getDownloadURL(storageRef);
          await addDoc(collection(db, `community/${postRef.id}/attachments`), {
            fileName: file.name,
            size: file.size,
            contentType: file.type,
            storagePath: path,
            downloadURL: url,
            createdAt: serverTimestamp(),
          });
          track("upload_pdf_attachment", { post_id: postRef.id });
        }
        // 첨부 개수 반영 (읽기용이라 생략해도 UX엔 큰 문제 없음)
        // await updateDoc(postRef, { attachmentCount: uploaded });
      }

      alert("게시되었습니다.");
      setTitle("");
      setBody("");
      (document.getElementById("files") as HTMLInputElement).value = "";
      setFiles(null);
      setProgress(0);
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "업로드 실패";
      alert(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Kind)}
          className="border rounded px-2 py-1"
        >
          <option value="design_share">디자인 공유</option>
          <option value="discussion">토론</option>
        </select>
        {/* 공지는 임시 비활성(권한되면 추가) */}
      </div>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border rounded px-3 py-2 min-h-[120px]"
        placeholder="내용"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <input
        id="files"
        type="file"
        accept="application/pdf"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      {busy && <div>업로드… {progress}%</div>}
      <button
        disabled={busy}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        게시하기
      </button>
    </form>
  );
}

