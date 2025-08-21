'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/contexts/i18n-context';

export function LanguageSwitcher() {
  const { setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale('ko')}>
          {t('language.ko')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('en')}>
          {t('language.en')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('ja')}>
          {t('language.ja')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('zh')}>
          {t('language.zh')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
