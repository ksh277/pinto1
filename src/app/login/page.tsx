
'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";


function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 14.2389 2.92484 17.8223 6.84784 19.2435C7.03473 19.3138 7.15216 19.5076 7.12942 19.704C7.10668 19.9004 6.94637 20.0573 6.75 20.0573C6.70233 20.0573 6.65499 20.0513 6.60879 20.0395C3.81515 19.1678 1.48197 17.3828 0.219896 15.0116C0.10631 14.7937 0.222728 14.5383 0.440625 14.4247C0.658522 14.3111 0.913898 14.4275 1.02748 14.6454C2.18025 16.8091 4.31525 18.4428 6.84784 19.2435C6.84784 19.2435 6.84784 19.2435 6.84784 19.2435C6.84784 19.2435 6.84784 19.2435 6.84784 19.2435C6.84784 19.2435 6.84784 19.2435 6.84784 19.2435C7.30155 18.6826 7.64038 18.0261 7.84279 17.3121C7.88604 17.1593 7.78854 17.0017 7.63583 16.9585C7.48311 16.9152 7.32551 17.0127 7.28227 17.1655C7.09139 17.8428 6.77259 18.4638 6.34784 18.9953C3.62892 17.0628 2.01353 13.7144 2.01353 10C2.01353 5.59616 5.59616 2.01353 10 2.01353C14.4038 2.01353 17.9865 5.59616 17.9865 10C17.9865 12.1893 17.206 14.1723 15.9392 15.6517C15.7722 15.8421 15.8037 16.1136 15.9941 16.2806C16.1845 16.4476 16.456 16.4161 16.623 16.2257C18.064 14.5457 19.0135 12.3582 19.0135 10C19.0135 5.02487 14.9751 0.986478 10 0.986478C5.02487 0.986478 0.986478 5.02487 0.986478 10C0.986478 13.8839 3.44733 17.0872 6.60879 18.9822L6.60879 20.0395L6.75 20.0573L6.84784 19.2435C6.84784 19.2435 6.84784 19.2435 6.84784 19.2435L6.84784 18.9953L6.34784 18.9953L6.34784 18.9953C6.34784 18.9953 6.34784 18.9953 6.34784 18.9953Z" fill="#3A1D1D"/>
    </svg>
  );
}

function NaverIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="20" rx="4" fill="#03C75A"/>
            <path d="M12.2148 10.3346V14H8.86816V6H12.4436L12.4442 9.66536H12.4564L14.3311 6H17V14H13.6352V10.3346H13.623L11.5811 14H8V6L12.2148 10.3346Z" fill="white"/>
        </svg>
    );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [secureLogin, setSecureLogin] = useState(false);
  const [error, setError] = useState("");

  const { login, redirectPath, setRedirectPath } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async () => {
    await login(formData.username, formData.password);
    const redirectTo = redirectPath || "/";
    setRedirectPath(null);
    router.push(redirectTo);
  };
  
  useEffect(() => {
    const redirectTo = searchParams.get('redirect_to');
    if (redirectTo) {
      setRedirectPath(decodeURIComponent(redirectTo));
    }
  }, [searchParams, setRedirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (formData.username && formData.password) {
      try {
        await handleLogin();
      } catch (err: any) {
        setError(err.message ?? '로그인에 실패했습니다.');
      }
    } else {
      setError(t({ ko: "아이디 또는 비밀번호를 입력해주세요.", en: "Please enter username and password." }));
    }
    setIsLoading(false);
  };

  const handleSnsLogin = (_provider: "kakao" | "naver") => {
    // Social login not implemented
    setIsLoading(true);
    handleLogin().finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">
              {t({ ko: "로그인", en: "Login", ja: "ログイン", zh: "登录" })}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="user-id"
                  name="user-id"
                  type="text"
                  placeholder={t({
                    ko: "아이디를 입력하세요",
                    en: "Enter your username",
                    ja: "ユーザー名を入力してください",
                    zh: "请输入用户名",
                  })}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="h-12 text-base"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t({
                      ko: "비밀번호를 입력하세요",
                      en: "Enter your password",
                      ja: "パスワードを入力してください",
                      zh: "请输入密码",
                    })}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    className="h-12 text-base pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="secure-login"
                      checked={secureLogin}
                      onCheckedChange={(checked) =>
                        setSecureLogin(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="secure-login"
                      className="text-sm cursor-pointer flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      {t({
                        ko: "보안접속",
                        en: "Secure Login",
                        ja: "セキュアログイン",
                        zh: "安全登录",
                      })}
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading
                  ? t({
                      ko: "로그인 중...",
                      en: "Logging in...",
                      ja: "ログイン中...",
                      zh: "登录中...",
                    })
                  : t({
                      ko: "로그인",
                      en: "Login",
                      ja: "ログイン",
                      zh: "登录",
                    })}
              </Button>
            </form>

            <div className="flex justify-center space-x-4 text-sm">
              <Link
                href="/find-id"
                className="text-muted-foreground hover:text-foreground"
              >
                아이디 찾기
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/find-password"
                className="text-muted-foreground hover:text-foreground"
              >
                비밀번호 찾기
              </Link>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    간편 로그인
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-[#FEE500] bg-[#FEE500] hover:bg-[#FEE500]/90 text-black/85"
                  onClick={() => handleSnsLogin("kakao")}
                >
                  <KakaoIcon />
                  카카오
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-[#03C75A] bg-[#03C75A] hover:bg-[#03C75A]/90 text-white"
                  onClick={() => handleSnsLogin("naver")}
                >
                  <NaverIcon />
                  네이버
                </Button>
              </div>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg text-center border">
              <p className="text-sm text-muted-foreground mb-3">
                아직 회원이 아니신가요? 지금 회원가입을 하시면
                <br />
                다양한 특별 혜택이 준비되어 있습니다.
              </p>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="w-full h-10 border-border hover:bg-background/50"
                >
                  회원가입
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
