
'use client';

import Link from 'next/link';
import { useCartContext } from '@/contexts/cart-context';
import { useI18n } from '@/contexts/i18n-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem as CartItemComponent } from '@/components/cart-item';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cartItems, cartCount, totalPrice } = useCartContext();
  const { t } = useI18n();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  }

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold">{t('cart.title')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('cart.empty')}</p>
        <Button asChild className="mt-6">
          <Link href="/">{t('cart.continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center text-3xl font-bold mb-8">{t('cart.title')}</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    <CartItemComponent item={item} />
                    {index < cartItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')} ({cartCount} {t('cart.items')})</span>
                <span>{totalPrice.toLocaleString()} {t('currency')}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('cart.total')}</span>
                <span>{totalPrice.toLocaleString()} {t('currency')}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckout} size="lg" className="w-full">
                {t('cart.checkout')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
