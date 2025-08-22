'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SlideForm } from '../../slide-form';
import type { Slide } from '@/lib/types';

export default function EditSlidePage() {
  const params = useParams();
  const { id } = params as { id: string };
  const [slide, setSlide] = useState<Slide | null>(null);

  useEffect(() => {
    fetch(`/api/slides/${id}`).then(res => res.json()).then(setSlide);
  }, [id]);

  if (!slide) return <div className="p-4">Loading...</div>;

  return <SlideForm slide={slide} />;
}
