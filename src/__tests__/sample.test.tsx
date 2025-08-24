import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { useI18n } from '../hooks/useI18n';

function Hello() {
  const t = useI18n();
  return <div>{t('hello')}</div>;
}

describe('Sample', () => {
  it('renders greeting', () => {
    render(<Hello />);
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });
});
