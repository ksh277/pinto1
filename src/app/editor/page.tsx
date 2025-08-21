
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

function EditorComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, setRedirectPath } = useAuth();
  const { toast } = useToast();

  const type = searchParams.get('type') || '';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = `/editor${type ? `?type=${type}` : ''}`;
      setRedirectPath(currentPath);
      
      toast({
        title: "로그인이 필요한 페이지입니다",
        description: "굿즈 에디터를 사용하려면 로그인해주세요.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        router.push(`/login?redirect_to=${encodeURIComponent(currentPath)}`);
      }, 1000);
    }
  }, [isAuthenticated, isLoading, type, router, setRedirectPath, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <EditorLayout productType={type} />
  );
}


export default function Editor() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorComponent />
    </Suspense>
  )
}
