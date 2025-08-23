"use client";
import { useEffect, useState } from "react";

type Banner = {
  id: string; isOpen: boolean;
  bgType: "color" | "image"; bgValue: string;
  text?: string; href?: string;
};
const HIDE_KEY = (id: string) => `pinto_top_banner_${id}_hide_until`;

export default function TopBanner() {
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    (async () => {
      try {
        const res = await fetch("/api/banners/active", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const data: Banner = await res.json();
        if (!data?.isOpen) { setBanner(null); return; }
        const until = localStorage.getItem(HIDE_KEY(data.id));
        if (until && Date.now() < Number(until)) { setHidden(true); }
        setBanner(data);
      } catch { setBanner(null); }
    })();
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <div className="h-12 animate-pulse rounded-2xl bg-gray-100 my-3" />;
  }
  if (!banner || hidden) return null;

  const style = banner.bgType === "image"
    ? { backgroundImage: `url(${banner.bgValue})`, backgroundSize:"cover", backgroundPosition:"center" }
    : { backgroundColor: banner.bgValue };

  const onClose = () => {
    const until = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(HIDE_KEY(banner.id), String(until));
    setHidden(true);
  };

  return (
    <div className="my-3 rounded-2xl shadow-card px-4 py-3 flex items-center justify-between" style={style as any}>
      <a href={banner.href ?? "#"} className="text-sm md:text-base font-medium">
        {banner.text}
      </a>
      <button aria-label="배너 닫기" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
    </div>
  );
}
