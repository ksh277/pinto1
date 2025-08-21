
'use client';

import { useRouter } from 'next/navigation';
import { useCartContext } from '@/contexts/cart-context';
import { useI18n } from '@/contexts/i18n-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, totalPrice, cartCount, clearCart } = useCartContext();
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
        toast({
            title: "로그인이 필요합니다.",
            description: "결제를 진행하려면 먼저 로그인해주세요.",
            variant: "destructive",
        });
      router.push('/login?redirect_to=/checkout');
    }
  }, [isAuthLoading, isAuthenticated, router, toast]);

  const handlePayment = async () => {
    setIsLoading(true);
    toast({
      title: "주문 생성 중...",
      description: "결제 페이지로 안전하게 이동합니다.",
    });

    try {
      // Step 1: Create an order with 'pending' status on the server.
      // This is a mock implementation. In a real app, this would be an API call.
      const mockOrderId = `ORD-${new Date().getTime()}`;

      // Step 2: Request payment from PortOne using the generated orderId.
      // This part is simulated.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

      const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
      if (!isSuccess) {
          throw new Error("Mock payment request failed");
      }

      // Step 3: On successful payment, clear the cart and navigate to the confirmation page.
      // In a real app, a webhook would trigger this, but we do it client-side for now.
      clearCart();
      router.push(`/order-confirmation?orderId=${mockOrderId}`);

    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        variant: 'destructive',
        title: t('checkout.failure'),
        description: t('checkout.failureMessage'),
      });
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || cartCount === 0) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-center text-3xl font-bold mb-8">{t('checkout.title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('checkout.orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image}
                      alt={locale === 'ko' ? item.nameKo : item.nameEn}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{locale === 'ko' ? item.nameKo : item.nameEn}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {item.price.toLocaleString()} {t('currency')}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">
                  {(item.price * item.quantity).toLocaleString()} {t('currency')}
                </p>
              </div>
            ))}
          </div>
          <Separator className="my-6" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('cart.subtotal')}</span>
              <span>{totalPrice.toLocaleString()} {t('currency')}</span>
            </div>
             <div className="flex justify-between font-bold text-xl">
              <span>{t('cart.total')}</span>
              <span>{totalPrice.toLocaleString()} {t('currency')}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full" onClick={handlePayment} disabled={isLoading}>
            {isLoading ? "결제 처리 중..." : `${totalPrice.toLocaleString()}원 ${t('checkout.payNow')}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
