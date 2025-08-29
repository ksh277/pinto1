"use client";

import { useState, type ChangeEvent } from "react";

interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
}

export function BannerAdmin() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleAddBanner = () => {
    if (!image || !title) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBanners((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          imageUrl: e.target?.result as string,
          title,
        },
      ].slice(0, 12));
      setImage(null);
      setTitle('');
    };
    reader.readAsDataURL(image);
  };

  const handleRemove = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>메인 배너 관리 (최대 12개)</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <input
          type="text"
          placeholder="제목 입력"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={handleAddBanner} disabled={!image || !title || banners.length >= 12}>
          추가
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {banners.map((banner) => (
          <div key={banner.id} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#eee',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{banner.title}</div>
            <button onClick={() => handleRemove(banner.id)} style={{ fontSize: 12 }}>삭제</button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
        * 이미지는 원형으로 크롭되어 노출됩니다. 최대 12개까지 등록할 수 있습니다.
      </div>
    </div>
  );
}
