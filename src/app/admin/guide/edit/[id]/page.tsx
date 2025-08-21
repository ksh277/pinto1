
'use client';

import { GuideForm } from '../guide-form';

const mockGuide = { 
    id: '1', 
    title: '첫 주문 가이드', 
    slug: 'first-order-guide',
    summary: '상품 선택 → 옵션 지정 → 장바구니 → 결제 → 주문확인까지 과정을 안내합니다.',
    content: '가이드 내용입니다...',
    isPublished: true, 
    tags: ['주문', '초보자']
};

export default function EditGuidePage() {
  return <GuideForm guide={mockGuide} />;
}
