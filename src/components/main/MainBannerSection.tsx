import React from 'react';

interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
}

// 임시: 실제로는 DB에서 받아와야 함
const mockBanners: BannerItem[] = [];

export default function MainBannerSection({ banners = mockBanners }: { banners?: BannerItem[] }) {
  return (
    <section style={{ display: 'flex', justifyContent: 'center', gap: 40, background: '#fafbfc', padding: '32px 0' }}>
      {banners.slice(0, 12).map((banner) => (
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
          <div style={{ fontSize: 14, marginTop: 4 }}>{banner.title}</div>
        </div>
      ))}
    </section>
  );
}
