
'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/contexts/i18n-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmationContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader className="p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-6 text-3xl font-bold">{t('orderConfirmation.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <CardDescription className="text-base text-muted-foreground">{t('orderConfirmation.message')}</CardDescription>
          {orderId && (
            <div className="mt-6 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">주문번호</p>
              <p className="font-mono text-lg font-semibold text-foreground">{orderId}</p>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full">
              <Link href="/mypage/orders">{t('orderConfirmation.viewOrder') || '주문 내역 보기'}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/">{t('orderConfirmation.backToHome')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
