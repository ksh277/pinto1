
'use client';

import { NoticeForm } from '../../notice-form';

const mockNotice = { 
    id: '1', 
    title: '서비스 점검 안내', 
    content: '서비스 점검 내용입니다.',
    pinned: true, 
    isPublished: true,
};

export default function EditNoticePage() {
  return <NoticeForm notice={mockNotice} />;
}
