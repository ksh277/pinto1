
'use client';

import { useState } from 'react';
import type { Notice } from '@/lib/types';
import { NoticeCard } from '@/components/notice-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockNotices: Notice[] = [
  {
    id: '1',
    title: '서비스 점검 안내 (10/05 새벽)',
    content: '안정적인 서비스를 위해 10/05(토) 02:00~04:00 시스템 점검이 진행됩니다. 점검 시간 동안 결제/회원가입 등 일부 기능이 제한될 수 있습니다. 이용에 불편을 드려 죄송합니다.',
    pinned: true,
    isPublished: true,
    publishedAt: new Date('2024-10-01'),
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01'),
    author: { uid: 'admin', name: '핀토 관리자' },
    views: 1024,
  },
  {
    id: '2',
    title: '추석 연휴 배송 지연 안내',
    content: '9/15일 이후 주문은 연휴가 끝나고 순차적으로 발송됩니다. 이용에 참고 부탁드립니다.',
    pinned: false,
    isPublished: true,
    publishedAt: new Date('2024-09-10'),
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-10'),
    author: { uid: 'admin', name: '핀토 관리자' },
    views: 876,
  },
  {
    id: '3',
    title: '신규 우드 굿즈 3종 출시!',
    content: '따뜻한 감성의 우드 제품 3종이 새롭게 출시되었습니다. 지금 바로 확인해보세요.',
    pinned: false,
    isPublished: true,
    publishedAt: new Date('2024-09-05'),
    createdAt: new Date('2024-09-05'),
    updatedAt: new Date('2024-09-05'),
    author: { uid: 'admin', name: '핀토 관리자' },
    views: 543,
  },
];

export default function EventsPage() {
  const [notices, setNotices] = useState<Notice[]>(mockNotices);

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">이벤트</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          핀토에서 진행하는 다양한 프로모션과 공지사항을 확인하세요.
        </p>
      </div>

      <div className="mb-8 flex justify-center border-b">
         {/* Filter tabs will go here */}
      </div>

       <div className="border-t">
        {sortedNotices.map(notice => (
          <NoticeCard key={notice.id} notice={notice} />
        ))}
      </div>
      
       <div className="mt-12 text-center">
       </div>
    </div>
  );
}
