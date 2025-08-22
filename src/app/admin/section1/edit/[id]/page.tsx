'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Section1Form } from '../../section1-form';
import type { SectionItem } from '@/lib/types';

export default function EditSection1Page() {
  const params = useParams();
  const { id } = params as { id: string };
  const [item, setItem] = useState<SectionItem | null>(null);

  useEffect(() => {
    fetch(`/api/section1/${id}`).then(res => res.json()).then(setItem);
  }, [id]);

  if (!item) return <div className="p-4">Loading...</div>;

  return <Section1Form item={item} />;
}
