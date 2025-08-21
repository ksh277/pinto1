
'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Notice } from '@/lib/types';
import { format } from 'date-fns';

interface NoticeCardProps {
  notice: Notice;
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const formatDate = (date: Date) => format(date, 'yyyy.MM.dd');

  return (
    <Link href={`/support/notice/${notice.id}`} className="group block">
        <div className="py-4 border-b">
            <div className="flex items-center gap-4">
                {notice.pinned && <Badge variant="destructive">중요</Badge>}
                <p className="flex-grow font-medium text-gray-800 group-hover:text-primary truncate">{notice.title}</p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{notice.author.name}</span>
                    <span>{formatDate(notice.publishedAt)}</span>
                    <span>조회 {notice.views}</span>
                </div>
            </div>
        </div>
    </Link>
  );
}
