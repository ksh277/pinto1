
'use client';
import Link from 'next/link';
import { useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "./language-switcher";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t bg-secondary/50">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-bold text-lg text-foreground">Pinto</h3>
            <div className="space-y-1">
                <p><strong>대표:</strong> 김핀토</p>
                <p><strong>사업자등록번호:</strong> 123-45-67890</p>
                <p><strong>주소:</strong> 서울특별시 중구 핀토로 123, 4층</p>
                <p><strong>전화:</strong> 02-1234-5678</p>
                <p><strong>이메일:</strong> contact@pinto.com</p>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-foreground">고객센터</h3>
            <ul className="space-y-2">
              <li><Link href="/support/notice" className="hover:underline">공지사항</Link></li>
              <li><Link href="/support/faq" className="hover:underline">자주 묻는 질문</Link></li>
              <li><Link href="/mypage/inquiries" className="hover:underline">1:1 문의</Link></li>
              <li><Link href="/support/guide" className="hover:underline">이용 가이드</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-foreground">회사정보</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">회사소개</a></li>
              <li><a href="#" className="hover:underline">이용약관</a></li>
              <li><a href="#" className="hover:underline">개인정보처리방침</a></li>
            </ul>
          </div>
          <div>
             <h3 className="font-bold text-foreground mb-4">Follow Us & Language</h3>
             <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Instagram</a></li>
                <li><a href="#" className="hover:underline">Facebook</a></li>
                <li><a href="#" className="hover:underline">Twitter</a></li>
             </ul>
             <div className="mt-4">
                <LanguageSwitcher />
             </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Pinto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
