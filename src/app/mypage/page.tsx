
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, FileText, Package, ShoppingCart, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const OrderStatusCard = ({ title, count, icon: Icon }: { title: string; count: number; icon: React.ElementType }) => (
  <div className="flex flex-col items-center gap-2">
    <Icon className="w-8 h-8 text-muted-foreground" />
    <span className="font-semibold text-lg">{count}</span>
    <span className="text-sm text-muted-foreground">{title}</span>
  </div>
);

const MyInfoLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="flex items-center justify-between py-3 text-foreground hover:text-primary transition-colors">
        <span>{children}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
)

export default function MyPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
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

  const orderStatus = {
    paymentPending: 0,
    preparing: 0,
    shipping: 0,
    delivered: 0,
  };

  const claimStatus = {
    cancelled: 0,
    exchanged: 0,
    returned: 0,
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
        <p className="text-lg text-muted-foreground">
          {user?.name}님의 주문 및 활동 내역을 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>나의 주문처리 현황 (최근 3개월 기준)</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-around p-8">
                <OrderStatusCard title="입금전" count={orderStatus.paymentPending} icon={ShoppingCart} />
                <ChevronRight className="w-6 h-6 text-gray-300" />
                <OrderStatusCard title="배송준비중" count={orderStatus.preparing} icon={Package} />
                <ChevronRight className="w-6 h-6 text-gray-300" />
                <OrderStatusCard title="배송중" count={orderStatus.shipping} icon={Truck} />
                <ChevronRight className="w-6 h-6 text-gray-300" />
                <OrderStatusCard title="배송완료" count={orderStatus.delivered} icon={FileText} />
                </CardContent>
                <div className="border-t grid grid-cols-3 divide-x">
                    <div className="p-4 text-center text-sm text-muted-foreground">취소: <span className="font-semibold text-foreground">{claimStatus.cancelled}</span></div>
                    <div className="p-4 text-center text-sm text-muted-foreground">교환: <span className="font-semibold text-foreground">{claimStatus.exchanged}</span></div>
                    <div className="p-4 text-center text-sm text-muted-foreground">반품: <span className="font-semibold text-foreground">{claimStatus.returned}</span></div>
                </div>
            </Card>

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

        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>나의 정보</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                    <MyInfoLink href="/mypage/edit">회원 정보 수정</MyInfoLink>
                    <MyInfoLink href="/mypage/change-password">비밀번호 변경</MyInfoLink>
                    <MyInfoLink href="/mypage/inquiries">1:1 문의 내역</MyInfoLink>
                    <MyInfoLink href="/orders">주문/배송 조회</MyInfoLink>
                    <MyInfoLink href="/cart">장바구니</MyInfoLink>
                     <div className="py-3">
                      <Button variant="outline" size="sm" onClick={logout} className="w-full">
                        로그아웃
                      </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
