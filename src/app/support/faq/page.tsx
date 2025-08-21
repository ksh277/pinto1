
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FAQ } from '@/lib/types';

const faqData: FAQ[] = [
  {
    id: '1',
    category: '주문/결제',
    question: '결제 수단은 무엇을 지원하나요?',
    answer: '신용/체크카드, 간편결제(토스/카카오/네이버), 계좌이체를 지원합니다.',
    order: 1, isPublished: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '2',
    category: '배송',
    question: '제작/배송 기간은 얼마나 걸리나요?',
    answer: '디자인 확정 후 평균 2-4영업일 제작, 출고 후 1-2일 소요됩니다.',
    order: 1, isPublished: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '3',
    category: '취소/환불',
    question: '주문 취소는 어떻게 하나요?',
    answer: '결제 완료 후 제작 전 단계에서만 취소가 가능합니다. 1:1 문의로 접수해 주세요.',
    order: 1, isPublished: true, createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '4',
    category: '제작/편집',
    question: '배경 제거/키링 위치 편집이 가능한가요?',
    answer: '가능하며 굿즈에디터에서 배경 제거/구멍 위치 이동 기능을 제공합니다.',
    order: 1, isPublished: true, createdAt: new Date(), updatedAt: new Date(),
  },
];

const categories = ['전체', '주문/결제', '배송', '취소/환불', '제작/편집'];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqData.filter(faq => {
    const categoryMatch = activeCategory === '전체' || faq.category === activeCategory;
    const searchMatch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">자주 묻는 질문</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          궁금한 점을 빠르고 쉽게 해결하세요.
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="궁금한 점을 검색해보세요..."
            className="w-full rounded-full bg-background py-2 pl-10 pr-4 text-base h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8 flex justify-center border-b">
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 text-muted-foreground hover:text-primary',
              activeCategory === category && 'border-primary font-semibold text-primary'
            )}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b">
              <AccordionTrigger className="py-4 text-left text-base hover:no-underline">
                <span className="font-semibold text-primary mr-4">Q.</span>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="bg-secondary/50 p-6 rounded-md">
                <div className="flex">
                  <span className="font-semibold text-muted-foreground mr-4">A.</span>
                  <p className="text-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </Accordion>
    </div>
  );
}
