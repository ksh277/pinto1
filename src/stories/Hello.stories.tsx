import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useI18n } from '../hooks/useI18n';

const Hello = () => {
  const t = useI18n();
  return <div>{t('hello')}</div>;
};

const meta: Meta<typeof Hello> = {
  title: 'Sample/Hello',
  component: Hello,
};
export default meta;

export const 기본: StoryObj<typeof Hello> = {};
