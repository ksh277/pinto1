
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const mockInquiries = [
  { id: '1', title: '주문 관련 문의입니다.', user: { nickname: 'pinto_master' }, type: '주문/결제', status: 'answered', createdAt: new Date() },
  { id: '2', title: '상품 불량 문의', user: { nickname: 'goods_lover' }, type: '상품', status: 'in_progress', createdAt: new Date() },
  { id: '3', title: '배송 언제 되나요?', user: { nickname: 'user123' }, type: '배송', status: 'received', createdAt: new Date() },
];

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

export default function AdminInquiriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">1:1 문의 관리</h1>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>문의일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInquiries.map(inquiry => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">{inquiry.title}</TableCell>
                <TableCell>{inquiry.user.nickname}</TableCell>
                <TableCell>{inquiry.type}</TableCell>
                <TableCell><Badge variant={statusVariant[inquiry.status] || 'default'}>{statusText[inquiry.status] || inquiry.status}</Badge></TableCell>
                <TableCell>{inquiry.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/inquiries/${inquiry.id}`}>답변하기</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
