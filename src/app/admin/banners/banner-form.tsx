'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Banner } from '@/lib/types';

interface BannerFormData {
  title: string;
  content: string;
  backgroundType: 'color' | 'image';
  backgroundValue: string;
  isOpen: boolean;
  durationOption: 'day' | 'week';
}

export function BannerForm({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const { register, handleSubmit, control } = useForm<BannerFormData>({
    defaultValues:
      banner || {
        title: '',
        content: '',
        backgroundType: 'color',
        backgroundValue: '#000000',
        isOpen: true,
        durationOption: 'day',
      },
  });

  const onSubmit = async (data: BannerFormData) => {
    if (banner) {
      await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/banners', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    router.push('/admin/banners');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{banner ? '배너 수정' : '배너 등록'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input id="title" {...register('title', { required: true })} />
            </div>
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea id="content" rows={3} {...register('content')} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>배경 타입</Label>
                <Controller
                  name="backgroundType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">색상</SelectItem>
                        <SelectItem value="image">이미지</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="backgroundValue">값</Label>
                <Input id="backgroundValue" {...register('backgroundValue')} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isOpen">공개 상태</Label>
                <p className="text-sm text-muted-foreground">체크하면 사이트에 표시됩니다.</p>
              </div>
              <Controller
                name="isOpen"
                control={control}
                render={({ field }) => <Switch id="isOpen" checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>
            <div>
              <Label>기간 옵션</Label>
              <Controller
                name="durationOption"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">오늘 하루</SelectItem>
                      <SelectItem value="week">일주일</SelectItem>
                    </SelectContent>
                  </Select>
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

