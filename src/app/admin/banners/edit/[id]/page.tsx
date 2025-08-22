'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BannerForm } from '../../banner-form';
import type { Banner } from '@/lib/types';

export default function EditBannerPage() {
  const params = useParams();
  const { id } = params as { id: string };
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetch(`/api/banners/${id}`).then(res => res.json()).then(setBanner);
  }, [id]);

  if (!banner) return <div className="p-4">Loading...</div>;

  return <BannerForm banner={banner} />;
}

