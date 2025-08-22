export function SubNav() {
  const items = [
    { href: '/support/notice', label: '공지사항' },
    { href: '/support/faq', label: '고객센터' },
    { href: '/support/guide', label: '이용가이드' },
    { href: '/events', label: '이벤트' },
    { href: '/mypage/inquiries', label: '문의게시판' },
    { href: '/resources', label: '자료실' },
  ];
  return (
    <nav aria-label="Secondary" className="border-b bg-background text-xs text-muted-foreground">
      <ul className="container mx-auto flex h-9 flex-wrap items-center gap-2 px-4">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <span className="mx-2">|</span>}
            <a href={item.href} className="hover:underline">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SubNav;
