
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Guide } from '@/lib/types';

interface GuideFormData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string;
  isPublished: boolean;
}

interface GuideFormProps {
  guide?: Guide;
}

export function GuideForm({ guide }: GuideFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm<GuideFormData>({
    defaultValues: guide ? { ...guide, tags: guide.tags.join(', ') } : { title: '', slug: '', summary: '', content: '', tags: '', isPublished: true },
  });

  const onSubmit = (data: GuideFormData) => {
    const finalData = { ...data, tags: data.tags.split(',').map(t => t.trim()) };
    console.log(finalData);
    router.push('/admin/guide');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{guide ? '이용가이드 수정' : '새 이용가이드 작성'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input id="title" {...register('title', { required: '제목을 입력해주세요.' })} />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug">슬러그 (URL 경로)</Label>
              <Input id="slug" {...register('slug', { required: '슬러그를 입력해주세요.' })} />
              <p className="text-sm text-muted-foreground mt-1">예: first-order-guide (영문, 숫자, 하이픈만 사용)</p>
              {errors.slug && <p className="text-destructive text-sm mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="summary">요약</Label>
              <Textarea id="summary" {...register('summary')} rows={3} />
            </div>

            <div>
              <Label htmlFor="content">본문</Label>
              <Textarea id="content" {...register('content')} rows={15} />
            </div>

             <div>
              <Label htmlFor="tags">태그</Label>
              <Input id="tags" {...register('tags')} />
               <p className="text-sm text-muted-foreground mt-1">쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다.</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                  <Label htmlFor="isPublished">공개 상태</Label>
                  <p className="text-sm text-muted-foreground">체크하면 가이드가 사용자에게 즉시 공개됩니다.</p>
              </div>
              <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                      <Switch id="isPublished" checked={field.value} onCheckedChange={field.onChange} />
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
