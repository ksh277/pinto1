'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Banner } from '@/lib/types';

export function TopBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/banners/active');
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;
        const hideUntil = localStorage.getItem(`banner_hide_${data.id}`);
        if (hideUntil && new Date(hideUntil) > new Date()) {
          return;
        }
        setBanner(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleHide = (duration: 'day' | 'week') => {
    if (!banner) return;
    const days = duration === 'day' ? 1 : 7;
    const until = new Date();
    until.setDate(until.getDate() + days);
    localStorage.setItem(`banner_hide_${banner.id}`, until.toISOString());
    setHidden(true);
  };

  if (!banner || hidden) return null;

  const style =
    banner.backgroundType === 'color'
      ? { backgroundColor: banner.backgroundValue }
      : { backgroundImage: `url(${banner.backgroundValue})`, backgroundSize: 'cover' };

  return (
    <div className="w-full text-center text-white px-4 py-2" style={style}>
      <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-2 md:flex-row md:justify-center">
        <div className="flex-1" dangerouslySetInnerHTML={{ __html: banner.content }} />
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" onChange={() => handleHide('day')} />
            오늘 하루 보지 않기
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" onChange={() => handleHide('week')} />
            일주일 간 보지 않기
          </label>
          <X className="h-4 w-4 cursor-pointer" onClick={() => setHidden(true)} />
        </div>
      </div>
    </div>
  );
}

