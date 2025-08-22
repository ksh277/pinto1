'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Banner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch('/api/banners').then(res => res.json()).then(setBanners);
  }, []);

  const toggleOpen = async (banner: Banner) => {
    await fetch(`/api/banners/${banner.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isOpen: !banner.isOpen }),
    });
    setBanners(prev => prev.map(b => (b.id === banner.id ? { ...b, isOpen: !b.isOpen } : b)));
  };

  const deleteBanner = async (id: string) => {
    await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">배너 관리</h1>
        <Button asChild>
          <Link href="/admin/banners/new">배너등록</Link>
        </Button>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">제목</th>
            <th className="p-2">공개</th>
            <th className="p-2">작업</th>
          </tr>
        </thead>
        <tbody>
          {banners.map(b => (
            <tr key={b.id} className="border-b">
              <td className="p-2">{b.title}</td>
              <td className="p-2">
                <Switch checked={b.isOpen} onCheckedChange={() => toggleOpen(b)} />
              </td>
              <td className="p-2 space-x-2">
                <Button variant="outline" asChild size="sm">
                  <Link href={`/admin/banners/edit/${b.id}`}>수정</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteBanner(b.id)}>
                  삭제
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

