'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Banner, isHidden, setHideUntil } from '@/lib/banner';
import '@/styles/banner.css';

export function TopStripBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideWeek, setHideWeek] = useState(false);

  useEffect(() => {
    let mounted = true;
    const start = Date.now();

    async function load() {
      try {
        const res = await fetch('/api/banners/active', { cache: 'no-store' });
        if (!res.ok) throw new Error('fetch failed');
        const data: Banner = await res.json();
        if (!data.isOpen) return;
        if (!isHidden(data.id) && mounted) {
          setBanner(data);
        }
      } catch (err) {
        console.warn('TopStripBanner: failed to load banner', err);
      } finally {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 300 - elapsed);
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, delay);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClose = () => {
    if (!banner) return;
    const duration = hideWeek ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    setHideUntil(banner.id, duration);
    setBanner(null);
  };

  const getTextColor = (): string => {
    if (!banner) return 'text-white';
    if (banner.bgType !== 'color') return 'text-white';
    const hex = banner.bgValue.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 160 ? 'text-black' : 'text-white';
  };

  if (loading) {
    return <div className="banner-skeleton" />;
  }

  if (!banner) return null;

  const style: React.CSSProperties = {};
  if (banner.bgType === 'color') {
    style.backgroundColor = banner.bgValue;
  } else if (banner.bgType === 'gradient') {
    style.backgroundImage = banner.bgValue;
  } else if (banner.bgType === 'image') {
    style.backgroundImage = `url(${banner.bgValue})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }

  return (
    <div
      role="region"
      aria-label="공지 배너"
      className={`w-full shadow-sm ring-1 ring-white/40 ${getTextColor()}`}
      style={style}
    >
      <div className="container mx-auto flex h-11 md:h-12 items-center justify-between px-4 md:px-5 text-xs md:text-sm">
        <div className="flex-1 truncate">
          {banner.href ? (
            <Link href={banner.href} className="hover:underline">
              {banner.message}
            </Link>
          ) : (
            <span>{banner.message}</span>
          )}
        </div>
        {banner.canClose && (
          <div className="ml-4 flex items-center gap-2 whitespace-nowrap">
            <input
              id="hide7d"
              type="checkbox"
              className="h-4 w-4"
              checked={hideWeek}
              onChange={e => setHideWeek(e.target.checked)}
            />
            <label htmlFor="hide7d" className="cursor-pointer select-none text-xs">
              일주일간 보지 않기
            </label>
            <button
              aria-label="배너 닫기"
              onClick={handleClose}
              className="p-1 hover:opacity-80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopStripBanner;
