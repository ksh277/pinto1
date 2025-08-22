'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Slide } from '@/lib/types';

interface SlideFormData {
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

export function SlideForm({ slide }: { slide?: Slide }) {
  const router = useRouter();
  const { register, handleSubmit, control } = useForm<SlideFormData>({
    defaultValues:
      slide || {
        title: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true,
        order: 0,
      },
  });

  const onSubmit = async (data: SlideFormData) => {
    if (slide) {
      await fetch(`/api/slides/${slide.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/slides', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    router.push('/admin/slides');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{slide ? '슬라이드 수정' : '슬라이드 등록'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input id="title" {...register('title')} />
            </div>
            <div>
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input id="imageUrl" {...register('imageUrl', { required: true })} />
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
