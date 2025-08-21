
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// This would come from a context or server fetch
const mockNotices = [
    { id: '1', title: '서비스 점검 안내', pinned: true, isPublished: true, author: { name: '관리자' }, views: 1024, createdAt: new Date() },
    { id: '2', title: '추석 연휴 배송 안내', pinned: false, isPublished: true, author: { name: '관리자' }, views: 876, createdAt: new Date() },
];

export default function AdminNoticesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">공지사항 관리</h1>
        <Button asChild>
          <Link href="/admin/notice/new">새 공지 작성</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>고정</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>조회수</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockNotices.map(notice => (
              <TableRow key={notice.id}>
                <TableCell className="font-medium">{notice.title}</TableCell>
                <TableCell>{notice.isPublished ? '게시' : '숨김'}</TableCell>
                <TableCell>{notice.pinned ? 'Y' : 'N'}</TableCell>
                <TableCell>{notice.author.name}</TableCell>
                <TableCell>{notice.views}</TableCell>
                <TableCell>{notice.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/notice/edit/${notice.id}`}>수정</Link>
                  </Button>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">삭제</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없으며 공지사항이 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction>삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
