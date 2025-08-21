
'use client';

import { NoticeForm } from '../../notice-form';
import type { Notice } from '@/lib/types';

const mockNotice: Notice = {
    id: '1',
    title: '서비스 점검 안내',
    content: '서비스 점검 내용입니다.',
    pinned: true,
    isPublished: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    author: { uid: 'admin', name: '관리자' },
    views: 0,
};

export default function EditNoticePage() {
  return <NoticeForm notice={mockNotice} />;
}
