
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

const mockGuides = [
  { id: '1', title: '첫 주문 가이드', slug: 'first-order-guide', isPublished: true, tags: ['주문', '초보자'] },
  { id: '2', title: '아크릴 키링 템플릿 가이드', slug: 'acrylic-template', isPublished: true, tags: ['아크릴', '템플릿'] },
];

export default function AdminGuidesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">이용가이드 관리</h1>
        <Button asChild>
          <Link href="/admin/guide/new">새 가이드 작성</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>슬러그</TableHead>
              <TableHead>태그</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockGuides.map(guide => (
              <TableRow key={guide.id}>
                <TableCell className="font-medium">{guide.title}</TableCell>
                <TableCell>{guide.slug}</TableCell>
                <TableCell>{guide.tags.join(', ')}</TableCell>
                <TableCell>{guide.isPublished ? '게시' : '숨김'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/guide/edit/${guide.id}`}>수정</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">삭제</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                           이 작업은 되돌릴 수 없으며 가이드가 영구적으로 삭제됩니다.
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
