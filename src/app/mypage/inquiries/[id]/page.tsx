
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paperclip } from 'lucide-react';
import Link from 'next/link';

const mockInquiry = {
  id: '1',
  title: '주문 관련 문의입니다.',
  user: { nickname: 'pinto_master' },
  type: '주문/결제',
  status: 'answered',
  createdAt: new Date(),
  content: '안녕하세요. 주문번호 ORD-12345 관련하여 문의드립니다. 배송지 변경이 가능할까요?',
  attachments: [
      { name: 'order_details.png', url: '#', size: '1.2MB' }
  ],
  history: [
      { user: 'pinto_master', text: '안녕하세요. 주문번호 ORD-12345 관련하여 문의드립니다. 배송지 변경이 가능할까요?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { user: '관리자', text: '안녕하세요, 핀토입니다. 배송지 변경 가능합니다. 변경하실 주소를 알려주세요.', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
  ]
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    received: 'destructive',
    in_progress: 'secondary',
    answered: 'default',
    closed: 'outline'
}

const statusText: Record<string, string> = {
    received: '접수',
    in_progress: '처리중',
    answered: '답변완료',
    closed: '종료'
}


export default function InquiryDetailPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader className="border-b">
            <div className="flex items-start justify-between">
                <div>
                    <Badge variant={statusVariant[mockInquiry.status] || 'default'} className="mb-2">{statusText[mockInquiry.status] || mockInquiry.status}</Badge>
                    <CardTitle className="text-2xl">{mockInquiry.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        문의 유형: {mockInquiry.type} | 접수일: {mockInquiry.createdAt.toLocaleString()}
                    </p>
                </div>
                 <Button variant="outline" onClick={() => router.back()}>목록으로</Button>
            </div>
        </CardHeader>
        <CardContent className="p-6">
            <div className="space-y-6">
                 {/* Conversation History */}
                <div className="space-y-4">
                  {mockInquiry.history.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.user === '관리자' ? 'justify-end' : ''}`}>
                      {message.user !== '관리자' && <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">나</div>}
                      <div className={`rounded-lg p-3 max-w-[75%] ${message.user === '관리자' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs text-right mt-2 opacity-70">{message.createdAt.toLocaleTimeString()}</p>
                      </div>
                      {message.user === '관리자' && <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs">관리자</div>}
                    </div>
                  ))}
                </div>

                {/* Attachments */}
                {mockInquiry.attachments.length > 0 && (
                     <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold">첨부파일</h4>
                        <div className="flex flex-col items-start gap-2">
                            {mockInquiry.attachments.map((file, i) => (
                                <Link href={file.url} key={i} target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <Paperclip className="h-4 w-4"/>
                                    <span>{file.name} ({file.size})</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 border-t">
            <div className="w-full">
                <Textarea id="response" placeholder="추가 문의사항을 입력하세요..." rows={3} />
                <div className="flex justify-end mt-4">
                     <Button>추가 문의하기</Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
