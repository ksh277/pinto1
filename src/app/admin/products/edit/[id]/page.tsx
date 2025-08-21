'use client';

import { useParams } from 'next/navigation';
import { useProductContext } from '@/contexts/product-context';
import { ProductForm } from '../product-form';

export default function EditProductPage() {
  const params = useParams();
  const { id } = params;
  const { getProductById } = useProductContext();

  const product = getProductById(id as string);
  
  if (!product) {
      return <div>Product not found</div>
  }

  return <ProductForm product={product} />;
}
