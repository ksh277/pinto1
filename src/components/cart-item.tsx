
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Paperclip } from 'lucide-react';
import type { CartItem } from '@/lib/types';
import { useCartContext } from '@/contexts/cart-context';
import { useI18n } from '@/contexts/i18n-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CartItemProps {
  item: CartItem;
}

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCartContext();
  const { locale, t } = useI18n();
  const name = locale === 'ko' ? item.nameKo : item.nameEn;

  return (
    <div className="flex items-start gap-4 p-4">
      <Link href={`/products/${item.productId}`}>
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
          <Image
            src={item.image}
            alt={name}
            fill
            className="object-cover"
            data-ai-hint="product image"
          />
        </div>
      </Link>
      <div className="flex-grow">
        <Link href={`/products/${item.productId}`}>
          <h3 className="font-semibold hover:underline">{name}</h3>
        </Link>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium text-foreground">{t('product.size')}:</span> {item.options.size}
          </p>
          <p>
            <span className="font-medium text-foreground">{t('product.color')}:</span> {locale === 'ko' ? item.options.color.name_ko : item.options.color.name_en}
          </p>
          {item.options.customText && (
            <p>
              <span className="font-medium text-foreground">{t('product.customText')}:</span> "{item.options.customText}"
            </p>
          )}
          {item.designFile && (
            <div className="flex items-center gap-1.5 pt-1 text-blue-600">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{item.designFile.name}</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
            className="h-9 w-16"
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-between self-stretch">
        <p className="font-semibold">
          {(item.price * item.quantity).toLocaleString()} {t('currency')}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => removeFromCart(item.id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  );
}
