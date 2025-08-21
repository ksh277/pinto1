
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useProductContext } from '@/contexts/product-context';
import { useI18n } from '@/contexts/i18n-context';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type ProductFormData = Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'stats' | 'imageUrls' | 'options'> & {
    price: number;
    image: string;
};

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { addProduct, updateProduct } = useProductContext();
  const { t } = useI18n();
  
  const defaultValues: Partial<ProductFormData> = product ? {
      ...product,
      price: product.priceKrw,
      image: product.imageUrl,
  } : {
      nameEn: '', nameKo: '', descriptionEn: '', descriptionKo: '',
      price: 0, categoryId: 'acrylic', subcategory: 'keyring', image: '',
      isFeatured: false, isPublished: true, status: 'active', stockQuantity: 100
  };

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormData>({ defaultValues });

  const onSubmit = (data: ProductFormData) => {
      const productData: Product = {
          ...(product || {} as Product),
          ...data,
          priceKrw: Number(data.price),
          imageUrl: data.image,
          // Temp until options UI is built
          options: product?.options || {},
          id: product?.id || '',
          slug: product?.slug || '',
          stats: product?.stats || { likeCount: 0, reviewCount: 0, ratingSum: 0, avgRating: 0 },
          createdAt: product?.createdAt || new Date(),
          updatedAt: new Date(),
      };
      
      if (product) {
          updateProduct({ ...product, ...productData });
      } else {
          addProduct(productData);
      }
      router.push('/admin/products');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{product ? t('admin.editProduct') : t('admin.newProduct')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="nameKo">{t('admin.productNameKo')}</Label>
                <Input id="nameKo" {...register('nameKo', { required: true })} />
                {errors.nameKo && <p className="text-destructive text-sm mt-1">이 필드는 필수입니다</p>}
              </div>
               <div>
                <Label htmlFor="nameEn">{t('admin.productNameEn')}</Label>
                <Input id="nameEn" {...register('nameEn')} />
              </div>
            </div>

            <div>
                <Label htmlFor="descriptionKo">{t('admin.productDescKo')}</Label>
                <Textarea id="descriptionKo" {...register('descriptionKo')} />
            </div>
             <div>
                <Label htmlFor="descriptionEn">{t('admin.productDescEn')}</Label>
                <Textarea id="descriptionEn" {...register('descriptionEn')} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="price">가격 (KRW)</Label>
                    <Input id="price" type="number" {...register('price', { required: true, valueAsNumber: true })} />
                    {errors.price && <p className="text-destructive text-sm mt-1">이 필드는 필수입니다</p>}
                </div>
                <div>
                    <Label htmlFor="stockQuantity">재고 수량</Label>
                    <Input id="stockQuantity" type="number" {...register('stockQuantity', { required: true, valueAsNumber: true })} />
                </div>
            </div>
             <div>
                <Label htmlFor="image">{t('admin.imageUrl')}</Label>
                <Input id="image" {...register('image', { required: true })} />
                {errors.image && <p className="text-destructive text-sm mt-1">이 필드는 필수입니다</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="categoryId">카테고리</Label>
                     <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="acrylic">아크릴</SelectItem>
                                    <SelectItem value="wood">우드</SelectItem>
                                    <SelectItem value="lanyard">랜야드</SelectItem>
                                    <SelectItem value="packaging">포장/부자재</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div>
                    <Label htmlFor="subcategory">서브카테고리</Label>
                    <Input id="subcategory" {...register('subcategory')} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Controller
                        name="isPublished"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="isPublished" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="isPublished">공개</Label>
                </div>
                 <div className="flex items-center space-x-2">
                     <Controller
                        name="isFeatured"
                        control={control}
                        render={({ field }) => (
                            <Checkbox id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                    />
                    <Label htmlFor="isFeatured">추천 상품</Label>
                </div>
            </div>
            
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    {t('cancel')}
                </Button>
                <Button type="submit">{t('admin.save')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
