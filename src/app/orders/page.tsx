
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrdersPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, router]);
    
    if (isLoading || !isAuthenticated) {
        return (
             <div className="flex h-screen items-center justify-center">
                <p>Redirecting...</p>
            </div>
        );
    }
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">주문/배송 조회</h1>
         <Card>
            <CardHeader>
            <CardTitle>주문내역 조회</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-20">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <XCircle className="w-16 h-16 mb-4" />
                    <p>주문 내역이 없습니다.</p>
            </div>
            </CardContent>
        </Card>
    </div>
  );
}
