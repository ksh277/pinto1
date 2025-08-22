'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Slide } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    fetch('/api/slides').then(res => res.json()).then(setSlides);
  }, []);

  const toggleActive = async (slide: Slide) => {
    await fetch(`/api/slides/${slide.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !slide.isActive }),
    });
    setSlides(prev => prev.map(s => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s)));
  };

  const deleteSlide = async (id: string) => {
    await fetch(`/api/slides/${id}`, { method: 'DELETE' });
    setSlides(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">슬라이드 관리</h1>
        <Button asChild>
          <Link href="/admin/slides/new">슬라이드 등록</Link>
        </Button>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">제목</th>
            <th className="p-2">활성화</th>
            <th className="p-2">순서</th>
            <th className="p-2">작업</th>
          </tr>
        </thead>
        <tbody>
          {slides.map(s => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.title}</td>
              <td className="p-2">
                <Switch checked={s.isActive} onCheckedChange={() => toggleActive(s)} />
              </td>
              <td className="p-2">{s.order}</td>
              <td className="p-2 space-x-2">
                <Button variant="outline" asChild size="sm">
                  <Link href={`/admin/slides/edit/${s.id}`}>수정</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteSlide(s.id)}>
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
