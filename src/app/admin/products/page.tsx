
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useProductContext } from '@/contexts/product-context';
import { useI18n } from '@/contexts/i18n-context';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminProductsPage() {
  const { products, deleteProduct } = useProductContext();
  const { t, locale } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
        <Button asChild>
          <Link href="/admin/products/new">{t('admin.newProduct')}</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">{t('admin.table.image')}</TableHead>
              <TableHead>{t('admin.table.name')}</TableHead>
              <TableHead>{t('admin.table.category')}</TableHead>
              <TableHead>{t('admin.table.price')}</TableHead>
              <TableHead className="text-right">{t('admin.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded-md">
                     <Image src={product.imageUrl} alt={product.nameKo} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.nameKo}</TableCell>
                <TableCell>{product.categoryId}</TableCell>
                <TableCell>{product.priceKrw.toLocaleString()} {t('currency')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/products/edit/${product.id}`}>{t('admin.editProduct')}</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">{t('admin.delete')}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없으며 상품이 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                          {t('admin.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
