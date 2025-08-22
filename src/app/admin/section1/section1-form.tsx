'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { SectionItem } from '@/lib/types';

interface SectionFormData {
  title: string;
  imageUrl?: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

export function Section1Form({ item }: { item?: SectionItem }) {
  const router = useRouter();
  const { register, handleSubmit, control } = useForm<SectionFormData>({
    defaultValues:
      item || {
        title: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true,
        order: 0,
      },
  });

  const onSubmit = async (data: SectionFormData) => {
    if (item) {
      await fetch(`/api/section1/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/section1', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    router.push('/admin/section1');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{item ? '섹션1 항목 수정' : '섹션1 항목 등록'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input id="title" {...register('title', { required: true })} />
            </div>
            <div>
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input id="imageUrl" {...register('imageUrl')} />
            </div>
            <div>
              <Label htmlFor="linkUrl">링크 URL</Label>
              <Input id="linkUrl" {...register('linkUrl')} />
            </div>
            <div>
              <Label htmlFor="order">순서</Label>
              <Input id="order" type="number" {...register('order', { valueAsNumber: true })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">활성화</Label>
                <p className="text-sm text-muted-foreground">체크하면 사이트에 표시됩니다.</p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit">저장하기</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
