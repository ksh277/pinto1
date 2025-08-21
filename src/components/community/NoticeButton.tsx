'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function NoticeButton({ onClick }: { onClick: () => void }) {
  const { user } = useAuth();
  if (!user?.isAdmin) return null;
  return (
    <Button type="button" onClick={onClick} variant="secondary">
      공지 작성
    </Button>
  );
}
