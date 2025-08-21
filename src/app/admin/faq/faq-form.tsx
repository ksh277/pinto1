
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface FaqFormData {
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

interface FaqFormProps {
  faq?: any; // Replace with actual FAQ type
}

export function FaqForm({ faq }: FaqFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm<FaqFormData>({
    defaultValues: faq || { question: '', answer: '', category: '주문/결제', order: 1, isPublished: true },
  });

  const onSubmit = (data: FaqFormData) => {
    console.log(data);
    router.push('/admin/faq');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{faq ? 'FAQ 수정' : '새 FAQ 작성'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="question">질문</Label>
              <Input id="question" {...register('question', { required: '질문을 입력해주세요.' })} />
              {errors.question && <p className="text-destructive text-sm mt-1">{errors.question.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="주문/결제">주문/결제</SelectItem>
                      <SelectItem value="배송">배송</SelectItem>
                      <SelectItem value="취소/환불">취소/환불</SelectItem>
                      <SelectItem value="제작/편집">제작/편집</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="answer">답변</Label>
              <Textarea id="answer" {...register('answer')} rows={8} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                  <Label htmlFor="isPublished">공개 상태</Label>
                  <p className="text-sm text-muted-foreground">체크하면 FAQ가 사용자에게 즉시 공개됩니다.</p>
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
