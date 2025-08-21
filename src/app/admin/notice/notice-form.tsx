
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Notice } from '@/lib/types';

interface NoticeFormData {
  title: string;
  content: string;
  isPublished: boolean;
  pinned: boolean;
}

interface NoticeFormProps {
  notice?: Notice;
}

export function NoticeForm({ notice }: NoticeFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm<NoticeFormData>({
    defaultValues: notice || { title: '', content: '', isPublished: true, pinned: false },
  });

  const onSubmit = (data: NoticeFormData) => {
    console.log(data);
    // Here you would call a function to save the data
    router.push('/admin/notice');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{notice ? '공지사항 수정' : '새 공지사항 작성'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input id="title" {...register('title', { required: '제목을 입력해주세요.' })} />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea id="content" {...register('content')} rows={10} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="isPublished">공개 상태</Label>
                    <p className="text-sm text-muted-foreground">체크하면 공지사항이 사용자에게 즉시 공개됩니다.</p>
                </div>
                 <Controller
                    name="isPublished"
                    control={control}
                    render={({ field }) => (
                        <Switch id="isPublished" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                 />
              </div>
               <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="pinned">상단 고정</Label>
                     <p className="text-sm text-muted-foreground">체크하면 공지사항 목록 최상단에 고정됩니다.</p>
                  </div>
                   <Controller
                      name="pinned"
                      control={control}
                      render={({ field }) => (
                          <Switch id="pinned" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                  />
                </div>
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
