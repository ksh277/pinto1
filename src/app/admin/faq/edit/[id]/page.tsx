
'use client';

import { FaqForm } from '../../faq-form';

const mockFaq = { 
    id: '1', 
    question: '결제 수단은 무엇을 지원하나요?', 
    category: '주문/결제', 
    answer: '신용/체크카드, 간편결제(토스/카카오/네이버), 계좌이체를 지원합니다.',
    isPublished: true, 
    order: 1 
};

export default function EditFaqPage() {
  return <FaqForm faq={mockFaq} />;
}
