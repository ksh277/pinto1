
'use client';

// 타입스크립트에서 window.daum 타입 선언 (최상단에 위치)
declare global {
  interface Window {
    daum: any;
  }
}

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/useLanguage";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Eye, EyeOff, AlertCircle } from "lucide-react";

// 비밀번호 유효성 검사 함수
function isValidPassword(password: string): boolean {
  // 8~16자, 영문/숫자/특수문자 각각 1개 이상 포함
  const lengthCheck = /^.{8,16}$/;
  const engCheck = /[a-zA-Z]/;
  const numCheck = /[0-9]/;
  const specialCheck = /[!@#$%^&*(),.?":{}|<>_\-\[\]\\/]/;
  return (
    lengthCheck.test(password) &&
    engCheck.test(password) &&
    numCheck.test(password) &&
    specialCheck.test(password)
  );
}

// 카카오 주소 검색 API 연동 함수 (컴포넌트 외부에 위치)
function openKakaoAddressSearch(setUserData: any) {
  if (typeof window === "undefined") return;
  if (!window.daum || !window.daum.Postcode) {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = function () {
      openKakaoAddressSearch(setUserData);
    };
    document.body.appendChild(script);
    return;
  }
  new window.daum.Postcode({
    oncomplete: function (data: any) {
      setUserData((prev: any) => ({ ...prev, address: data.address }));
    },
    width: "100%",
    height: "100%",
  }).open();
}

type Step = 1 | 2 | 3;

interface AgreementData {
  allAgreed: boolean;
  serviceTerms: boolean;
  privacyPolicy: boolean;
  shoppingInfo: boolean;
  smsMarketing: boolean;
  emailMarketing: boolean;
}

interface UserData {
  username: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  addressDetail: string;
  memberType: "lifetime" | "guest";
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });
  const router = useRouter();
  const { t } = useLanguage();

  const [agreements, setAgreements] = useState<AgreementData>({
    allAgreed: false,
    serviceTerms: false,
    privacyPolicy: false,
    shoppingInfo: false,
    smsMarketing: false,
    emailMarketing: false,
  });

  const [userData, setUserData] = useState<UserData>({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    addressDetail: "",
    memberType: "lifetime",
  });

  const handleAllAgreementChange = (checked: boolean) => {
    setAgreements({
      allAgreed: checked,
      serviceTerms: checked,
      privacyPolicy: checked,
      shoppingInfo: checked,
      smsMarketing: checked,
      emailMarketing: checked,
    });
  };

  const handleAgreementChange = (
    field: keyof AgreementData,
    checked: boolean,
  ) => {
    const newAgreements = { ...agreements, [field]: checked };

    const allChecked =
      newAgreements.serviceTerms &&
      newAgreements.privacyPolicy &&
      newAgreements.shoppingInfo &&
      newAgreements.smsMarketing &&
      newAgreements.emailMarketing;

    newAgreements.allAgreed = allChecked;
    setAgreements(newAgreements);
  };

  const canProceedFromStep1 =
    agreements.serviceTerms && agreements.privacyPolicy;

  // Mock function
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return;
    }
    setUsernameStatus({ checking: true, available: null, message: "확인 중..." });
    await new Promise(resolve => setTimeout(resolve, 500));
    if (username === "admin" || username === "test") {
        setUsernameStatus({ checking: false, available: false, message: "이미 사용 중인 아이디입니다." });
    } else {
        setUsernameStatus({ checking: false, available: true, message: "사용 가능한 아이디입니다." });
    }
  }, []);

  // Mock function
  const checkNicknameAvailability = useCallback(async (nickname: string) => {
    if (!nickname || nickname.length < 2) {
      setNicknameStatus({ checking: false, available: null, message: "" });
      return;
    }
     if (nickname.length > 10) {
      setNicknameStatus({ 
        checking: false, 
        available: false, 
        message: "닉네임은 10자 이하여야 합니다." 
      });
      return;
    }
    setNicknameStatus({ checking: true, available: null, message: "확인 중..." });
    await new Promise(resolve => setTimeout(resolve, 500));
    if (nickname === "관리자") {
        setNicknameStatus({ checking: false, available: false, message: "이미 사용 중인 닉네임입니다." });
    } else {
        setNicknameStatus({ checking: false, available: true, message: "사용 가능한 닉네임입니다." });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userData.username) {
        checkUsernameAvailability(userData.username);
      }
    }, 500); 
    return () => clearTimeout(timeoutId);
  }, [userData.username, checkUsernameAvailability]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userData.nickname) {
        checkNicknameAvailability(userData.nickname);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [userData.nickname, checkNicknameAvailability]);

  const canProceedFromStep2 =
    userData.username &&
    userData.password &&
    userData.confirmPassword &&
    userData.name &&
    userData.nickname &&
    userData.phone &&
    userData.email &&
    userData.password === userData.confirmPassword &&
    isValidPassword(userData.password) &&
    userData.nickname.length >= 2 &&
    userData.nickname.length <= 10 &&
    nicknameStatus.available === true &&
    usernameStatus.available === true;

  const handleStep1Next = () => {
    if (!canProceedFromStep1) {
      setError("필수 약관에 동의해주세요.");
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const handleStep2Next = async () => {
    if (!canProceedFromStep2) {
      if (!isValidPassword(userData.password)) {
        setError("비밀번호는 영문, 숫자, 특수문자를 포함한 8~16자여야 합니다.");
        return;
      }
      setError("필수 정보를 모두 입력해주세요.");
      return;
    }
    if (userData.password !== userData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("회원가입 성공:", userData);
    setError("");
    setCurrentStep(3);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          약관 동의
        </h2>
        <p className="text-muted-foreground">
          서비스 이용을 위한 약관에 동의해주세요
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <Checkbox
            id="all-agree"
            checked={agreements.allAgreed}
            onCheckedChange={(checked) => handleAllAgreementChange(checked as boolean)}
          />
          <label
            htmlFor="all-agree"
            className="text-sm font-medium text-primary cursor-pointer"
          >
            전체 동의
          </label>
        </div>

        <div className="space-y-3 ml-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="service-terms"
                checked={agreements.serviceTerms}
                onCheckedChange={(checked) =>
                  handleAgreementChange("serviceTerms", checked as boolean)
                }
              />
              <label
                htmlFor="service-terms"
                className="text-sm cursor-pointer"
              >
                [필수] 이용약관 동의
              </label>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-muted-foreground h-auto p-0"
            >
              보기
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="privacy-policy"
                checked={agreements.privacyPolicy}
                onCheckedChange={(checked) =>
                  handleAgreementChange("privacyPolicy", checked as boolean)
                }
              />
              <label
                htmlFor="privacy-policy"
                className="text-sm cursor-pointer"
              >
                [필수] 개인정보 수집 및 이용 동의
              </label>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-muted-foreground h-auto p-0"
            >
              보기
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="shopping-info"
                checked={agreements.shoppingInfo}
                onCheckedChange={(checked) =>
                  handleAgreementChange("shoppingInfo", checked as boolean)
                }
              />
              <label
                htmlFor="shopping-info"
                className="text-sm cursor-pointer"
              >
                [선택] 쇼핑정보 수신 동의
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-3 pl-4 text-muted-foreground">
            <Checkbox
              id="sms-marketing"
              checked={agreements.smsMarketing}
              onCheckedChange={(checked) =>
                handleAgreementChange("smsMarketing", checked as boolean)
              }
            />
            <label htmlFor="sms-marketing" className="text-sm cursor-pointer">
              SMS
            </label>
             <Checkbox
              id="email-marketing"
              checked={agreements.emailMarketing}
              onCheckedChange={(checked) =>
                handleAgreementChange("emailMarketing", checked as boolean)
              }
            />
            <label htmlFor="email-marketing" className="text-sm cursor-pointer">
              이메일
            </label>
          </div>
        </div>
      </div>

      <Button
        onClick={handleStep1Next}
        className="w-full h-12"
        disabled={!canProceedFromStep1}
      >
        다음 단계
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          정보 입력
        </h2>
        <p className="text-muted-foreground">
          회원가입을 위한 정보를 입력해주세요
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="username">아이디</Label>
          <Input
            id="username"
            type="text"
            placeholder="아이디를 입력하세요"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
            className={`mt-1 ${
              usernameStatus.available === false
                ? 'border-red-500'
                : usernameStatus.available === true
                ? 'border-green-500'
                : ''
            }`}
          />
          <div className="mt-1 min-h-[20px]">
            {usernameStatus.checking && (
              <p className="text-sm text-blue-500">확인 중...</p>
            )}
            {usernameStatus.available === true && (
              <p className="text-sm text-green-600">✓ 사용 가능한 아이디입니다</p>
            )}
            {usernameStatus.available === false && usernameStatus.message && (
              <p className="text-sm text-red-500">✗ {usernameStatus.message}</p>
            )}
            {!usernameStatus.checking && usernameStatus.available === null && (
              <p className="text-sm text-muted-foreground">
                로그인 시 사용할 아이디입니다 (필수)
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-sm mt-1"
            style={{ color: isValidPassword(userData.password) ? '#16a34a' : '#ef4444' }}>
            {userData.password.length > 0
              ? isValidPassword(userData.password)
                ? "사용 가능한 비밀번호입니다."
                : "영문, 숫자, 특수문자를 모두 포함한 8~16자를 입력하세요."
              : "영문, 숫자, 특수문자 포함 8~16자"}
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={userData.confirmPassword}
              onChange={(e) =>
                setUserData({ ...userData, confirmPassword: e.target.value })
              }
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-sm mt-1"
            style={{ color: userData.confirmPassword.length > 0 ? (userData.password === userData.confirmPassword ? '#16a34a' : '#ef4444') : '#6b7280' }}>
            {userData.confirmPassword.length > 0
              ? userData.password === userData.confirmPassword
                ? "비밀번호가 일치합니다."
                : "비밀번호가 일치하지 않습니다."
              : "비밀번호를 다시 입력하세요"}
          </p>
        </div>

        <div>
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            type="text"
            placeholder="이름을 입력하세요"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="nickname">닉네임 <span className="text-red-500">*</span></Label>
          <Input
            id="nickname"
            type="text"
            placeholder="닉네임을 입력하세요 (2-10자)"
            value={userData.nickname}
            onChange={(e) => setUserData({ ...userData, nickname: e.target.value })}
            className={`mt-1 ${
              nicknameStatus.available === false ? 'border-red-500' : 
              nicknameStatus.available === true ? 'border-green-500' : ''
            }`}
            maxLength={10}
          />
          <div className="mt-1 min-h-[20px]">
            {nicknameStatus.checking && (
              <p className="text-sm text-blue-500">확인 중...</p>
            )}
            {nicknameStatus.available === true && (
              <p className="text-sm text-green-600">✓ 사용 가능한 닉네임입니다</p>
            )}
            {nicknameStatus.available === false && nicknameStatus.message && (
              <p className="text-sm text-red-500">✗ {nicknameStatus.message}</p>
            )}
            {!nicknameStatus.checking && nicknameStatus.available === null && (
              <p className="text-sm text-muted-foreground">
                댓글 작성 시 표시될 닉네임입니다 (필수)
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="phone">휴대전화</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="휴대전화 번호를 입력하세요"
            value={userData.phone}
            onChange={(e) =>
              setUserData({ ...userData, phone: e.target.value })
            }
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            className="mt-1"
          />
        </div>
        {/* 주소 입력란 */}
        <div>
          <Label htmlFor="address">배송지 주소</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="address"
              type="text"
              placeholder="주소 검색을 통해 입력하세요"
              value={userData.address}
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => openKakaoAddressSearch(setUserData)}
            >
              주소 검색
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="addressDetail">상세주소</Label>
          <Input
            id="addressDetail"
            type="text"
            placeholder="상세주소를 입력하세요 (예: 아파트, 동/호수 등)"
            value={userData.addressDetail}
            onChange={(e) =>
              setUserData({ ...userData, addressDetail: e.target.value })
            }
            className="mt-1"
          />
        </div>

        <div>
          <Label>회원유형</Label>
          <RadioGroup
            value={userData.memberType}
            onValueChange={(value) =>
              setUserData({
                ...userData,
                memberType: value as "lifetime" | "guest",
              })
            }
            className="mt-2 flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lifetime" id="lifetime" />
              <Label htmlFor="lifetime" className="font-normal">평생회원 (탈퇴 시까지)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="guest" id="guest" />
              <Label htmlFor="guest" className="font-normal">비회원</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="flex-1 h-12"
        >
          이전 단계
        </Button>
        <Button
          onClick={handleStep2Next}
          className="flex-1 h-12"
          disabled={!canProceedFromStep2}
        >
          다음 단계
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          🎉 회원가입이 완료되었습니다!
        </h2>
        <p className="text-muted-foreground">
          핀토의 다양한 혜택을 지금 바로 만나보세요.
        </p>
      </div>

      <div className="bg-secondary/50 p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">
          가입 정보
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">아이디:</span>
            <span className="font-medium">{userData.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">이름:</span>
            <span className="font-medium">{userData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">휴대전화:</span>
            <span className="font-medium">{userData.phone}</span>
          </div>
          {userData.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">이메일:</span>
              <span className="font-medium">{userData.email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">회원유형:</span>
            <span className="font-medium">
              {userData.memberType === "lifetime" ? "평생회원" : "비회원"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={() => router.push('/login')} className="w-full h-12">
            로그인 하러 가기
        </Button>
        <div className="text-center">
          <Link
            href="/"
            className="text-primary hover:underline text-sm"
          >
            홈페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-8 h-0.5 mx-2 ${
                          step < currentStep
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {t({ ko: "회원가입", en: "Sign Up" })}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {currentStep < 3 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  이미 계정이 있으신가요?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline"
                  >
                    로그인
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
