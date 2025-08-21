
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '새 비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormData) => {
    // In a real app, you would send this to your backend to verify
    // the current password and update it.
    console.log(data);

    // Mocking API call
    if (data.currentPassword === 'password123') { // Mock current password
      toast({
        title: '비밀번호 변경 완료',
        description: '비밀번호가 성공적으로 변경되었습니다.',
      });
      router.push('/mypage/edit');
    } else {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '현재 비밀번호가 올바르지 않습니다.',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-20">
       <Card>
            <CardHeader>
                <CardTitle className="text-center text-2xl">비밀번호 변경</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                    <Label htmlFor="userId">아이디</Label>
                    <p id="userId" className="text-lg text-muted-foreground">{user?.email}</p>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <Input id="currentPassword" type="password" {...register('currentPassword')} />
                    {errors.currentPassword && <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input id="newPassword" type="password" {...register('newPassword')} />
                    <p className="text-sm text-muted-foreground">(영문 대소문자/숫자/특수문자 중 3가지 이상 조합, 8자~16자)</p>
                    {errors.newPassword && <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
                    {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            취소
                        </Button>
                        <Button type="submit">
                            비밀번호 변경
                        </Button>
                    </div>
                </form>
            </CardContent>
       </Card>
    </div>
  );
}
