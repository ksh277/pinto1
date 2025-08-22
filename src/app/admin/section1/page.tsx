'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SectionItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function Section1Page() {
  const [items, setItems] = useState<SectionItem[]>([]);

  useEffect(() => {
    fetch('/api/section1').then(res => res.json()).then(setItems);
  }, []);

  const toggleActive = async (item: SectionItem) => {
    await fetch(`/api/section1/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    setItems(prev => prev.map(i => (i.id === item.id ? { ...i, isActive: !i.isActive } : i)));
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/section1/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">섹션1 관리</h1>
        <Button asChild>
          <Link href="/admin/section1/new">항목 등록</Link>
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
          {items.map(item => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.title}</td>
              <td className="p-2">
                <Switch checked={item.isActive} onCheckedChange={() => toggleActive(item)} />
              </td>
              <td className="p-2">{item.order}</td>
              <td className="p-2 space-x-2">
                <Button variant="outline" asChild size="sm">
                  <Link href={`/admin/section1/edit/${item.id}`}>수정</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
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
