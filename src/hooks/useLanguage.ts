
import { useI18n, type Locale } from "@/contexts/i18n-context";

type TranslationInput = {
    [key in Locale]?: string;
}

export function useLanguage() {
    const { t, locale } = useI18n();

    const translate = (input: TranslationInput | string): string => {
        if (typeof input === 'string') {
            return t(input);
        }
        return input[locale] || input['en'] || input['ko'] || Object.values(input)[0] || '';
    };

    return { t: translate, locale };
}
