
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity } from '@/contexts/community-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/contexts/i18n-context';
import { Plus, X, Image as ImageIcon, ChevronRight } from 'lucide-react';
import type { Post } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function MyInquiriesPage() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Mock data, this should come from a context or API call
  const mockInquiries = [
    { id: 'inq-1', title: "주문 배송지 변경 가능한가요?", createdAt: new Date(Date.now() - 86400000), status: 'answered'},
    { id: 'inq-2', title: "아크릴 키링 인쇄 품질 문의", createdAt: new Date(Date.now() - 86400000 * 3), status: 'received'},
  ];

  const [showForm, setShowForm] = useState(false);
  const [newInquiry, setNewInquiry] = useState({ title: '', content: '' });
  const [inquiryType, setInquiryType] = useState('');
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInquiry.title.trim() || !newInquiry.content.trim() || !inquiryType) {
        alert('문의 유형, 제목, 내용을 모두 입력해주세요.');
        return;
    }
    // Logic to submit the inquiry
    console.log({ ...newInquiry, type: inquiryType });
    setShowForm(false);
    setNewInquiry({ title: '', content: '' });
    setInquiryType('');
  };
  
  if (isLoading || !isAuthenticated) {
      return (
          <div className="flex h-screen items-center justify-center">
            <p>Redirecting...</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">1:1 문의</h1>
        <Button onClick={() => setShowForm(s => !s)}>
          <Plus className="mr-2 h-4 w-4" />
          문의 등록하기
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>새 문의 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInquirySubmit} className="space-y-6">
               <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p>- 이미지 첨부는 최대 6개(각 10MB 이하)까지 가능합니다.</p>
                <p>- 주문 관련 문의는 주문번호를 함께 적어 주세요.</p>
              </div>

               <div>
                 <Label htmlFor="inquiryType">문의 유형</Label>
                  <Select onValueChange={setInquiryType} value={inquiryType}>
                    <SelectTrigger id="inquiryType"><SelectValue placeholder="문의 유형을 선택하세요" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">주문/결제</SelectItem>
                      <SelectItem value="shipping">배송</SelectItem>
                      <SelectItem value="product">상품</SelectItem>
                      <SelectItem value="etc">기타</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
                <div>
                 <Label htmlFor="inquiryTitle">제목</Label>
                  <Input 
                    id="inquiryTitle"
                    placeholder="제목을 입력하세요."
                    value={newInquiry.title}
                    onChange={(e) => setNewInquiry(p => ({...p, title: e.target.value}))}
                  />
                </div>
              
              <Textarea
                placeholder="문의하실 내용을 자세하게 적어주세요."
                value={newInquiry.content}
                onChange={(e) => setNewInquiry(p => ({...p, content: e.target.value}))}
                rows={8}
              />
              
              <div className="mb-4">
                <Label className="block text-sm font-medium text-muted-foreground mb-2">
                  첨부파일 (최대 6개)
                </Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-muted p-6">
                   <ImageIcon className="h-8 w-8 text-muted-foreground" />
                   <p className="text-sm text-muted-foreground mt-2">파일을 드래그하거나 클릭해서 업로드</p>
                   <Input type="file" accept="image/*" multiple className="hidden" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                 <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    취소
                  </Button>
                  <Button type="submit">
                    문의 등록
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

       <div className="border-t">
        {mockInquiries.length > 0 ? mockInquiries.map((inquiry) => (
          <Link href={`/mypage/inquiries/${inquiry.id}`} key={inquiry.id} className="group block border-b">
              <div className="flex items-center justify-between py-4">
                  <div className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                        {inquiry.createdAt.toLocaleDateString()}
                    </p>
                    <p className="font-medium group-hover:text-primary truncate">{inquiry.title}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                     <span className={`text-xs px-2 py-1 rounded-full ${inquiry.status === 'answered' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {inquiry.status === 'answered' ? '답변완료' : '접수'}
                     </span>
                     <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
              </div>
          </Link>
        )) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>작성한 문의 내역이 없습니다.</p>
            </div>
        )}
      </div>
    </div>
  );
}
