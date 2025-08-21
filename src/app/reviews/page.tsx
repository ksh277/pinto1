
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/i18n-context';
import { Star } from 'lucide-react';
import type { Review } from '@/lib/types';

const mockReviewsData: Review[] = [
    { id: '1', productId: '1', userId: '1', author: 'rj*****', title: '거울 아크릴 뽑았어요!', image: 'https://placehold.co/300x300.png', likeCount: 0, scraps: 0, views: 26, rating: 5, createdAt: new Date() },
    { id: '2', productId: '1', userId: '1', author: 'im*****', title: '투명아크릴 디오라마 만들엇서요', image: 'https://placehold.co/300x300.png', likeCount: 0, scraps: 1, views: 37, rating: 5, createdAt: new Date() },
    { id: '3', productId: '1', userId: '1', author: 'hy*****', title: '2D 포장 키링', image: 'https://placehold.co/300x300.png', likeCount: 0, scraps: 1, views: 57, rating: 5, createdAt: new Date() },
    { id: '4', productId: '1', userId: '1', author: '40*****', title: '친구 선물로 주문했어요', image: 'https://placehold.co/300x300.png', likeCount: 0, scraps: 0, views: 40, rating: 5, createdAt: new Date() },
    { id: '5', productId: '1', userId: '1', author: 'ka*****', title: '원형 자개 아크릴 키링', image: 'https://placehold.co/300x300.png', likeCount: 0, scraps: 0, views: 32, rating: 5, createdAt: new Date() },
    { id: '6', productId: '1', userId: '1', author: 'user_a', title: '배송도 빠르고 인쇄 상태도 완벽해요.', image: 'https://placehold.co/300x300.png', hint: 'custom mug', likeCount: 10, scraps: 2, views: 150, rating: 5, createdAt: new Date() },
    { id: '7', productId: '1', userId: '1', author: 'user_b', title: '색상이 화면과 조금 달라서 아쉬워요.', image: 'https://placehold.co/300x300.png', hint: 'phone case', likeCount: 2, scraps: 0, views: 88, rating: 4, createdAt: new Date() },
    { id: '8', productId: '1', userId: '1', author: 'user_c', title: '상담도 친절하고 결과물도 만족스럽습니다!', image: 'https://placehold.co/300x300.png', hint: 't-shirt', likeCount: 25, scraps: 5, views: 230, rating: 5, createdAt: new Date() },
];


export default function ReviewsPage() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>(mockReviewsData);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('header.nav.reviews')}</h1>
      
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden border rounded-lg shadow-sm">
            <div className="relative aspect-square w-full">
              <Image 
                src={review.image} 
                alt={review.title} 
                fill 
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <p className="truncate font-semibold text-base mb-2">{review.title}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className='flex items-center gap-2'>
                    <Avatar className="h-5 w-5">
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{review.author}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Star className={`h-3 w-3 ${review.rating >= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted-foreground'}`}/>
                    <span>{review.rating}</span>
                </div>
              </div>
               <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span>좋아요 {review.likeCount}</span>
                    <span>스크랩 {review.scraps}</span>
                    <span>조회 {review.views}</span>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
