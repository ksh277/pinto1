

'use client';

import { useState } from 'react';
import type { Guide } from '@/lib/types';
import { GuideCard } from '@/components/guide-card';

const mockGuides: Guide[] = [
  {
    id: '1',
    slug: 'first-order-guide',
    title: '첫 주문 가이드 – 장바구니부터 결제까지',
    summary: '상품 선택 → 옵션 지정 → 장바구니 → 결제 → 주문확인까지 과정을 안내합니다. 핀토에서의 첫 주문, 어렵지 않게 따라오세요!',
    content: '...',
    coverImageUrl: 'https://placehold.co/400x300.png',
    isPublished: true,
    publishedAt: new Date('2024-05-01'),
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
    author: { uid: 'admin', name: '핀토 관리자' },
    tags: ['주문', '결제', '초보자'],
  },
  {
    id: '2',
    slug: 'acrylic-keyring-template-guide',
    title: '아크릴 키링 템플릿 완벽 가이드',
    summary: 'AI, PSD 템플릿을 사용하여 완벽한 아크릴 키링 데이터를 만드는 방법을 단계별로 안내합니다. 칼선, 화이트 레이어 등 모든 것을 마스터하세요.',
    content: '...',
    coverImageUrl: 'https://placehold.co/400x300.png',
    isPublished: true,
    publishedAt: new Date('2024-04-25'),
    createdAt: new Date('2024-04-25'),
    updatedAt: new Date('2024-04-25'),
    author: { uid: 'admin', name: '핀토 관리자' },
    tags: ['아크릴', '키링', '템플릿'],
  },
  {
    id: '3',
    slug: 'sticker-diy-guide',
    title: '나만의 스티커, 제대로 알고 만들자!',
    summary: '방수, 홀로그램, 조각 스티커 등 다양한 스티커 종류와 특징을 알아보고, 내 디자인에 맞는 최적의 스티커를 선택하는 팁을 드립니다.',
    content: '...',
    coverImageUrl: 'https://placehold.co/400x300.png',
    isPublished: true,
    publishedAt: new Date('2024-04-18'),
    createdAt: new Date('2024-04-18'),
    updatedAt: new Date('2024-04-18'),
    author: { uid: 'admin', name: '핀토 관리자' },
    tags: ['스티커', 'DIY', '재질'],
  },
];


export default function ResourcesPage() {
  const [guides] = useState<Guide[]>(mockGuides);

  // TODO: Add filtering and sorting logic
  const sortedGuides = [...guides].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">자료실</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          굿즈 제작에 필요한 템플릿, 가이드, 소스 파일을 다운로드하세요.
        </p>
      </div>

      <div className="mb-8 flex justify-center border-b">
         {/* TODO: Add category filter tabs here */}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {sortedGuides.map(guide => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
      
       <div className="mt-12 text-center">
        {/* TODO: Add pagination control here */}
       </div>
    </div>
  );
}
