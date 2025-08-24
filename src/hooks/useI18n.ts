import ko from '../i18n/ko.json';

type Dictionary = typeof ko;

declare type Keys = keyof Dictionary;

export function useI18n() {
  const dict: Dictionary = ko;
  return (key: Keys) => dict[key];
}
