'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CarouselApi } from '@/components/ui/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

export type HeroBanner = {
  id: string;
  href: string;
  imgSrc: string;
  alt: string;
};

interface TopBannerProps {
  banners: HeroBanner[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

export function TopBanner({ banners }: TopBannerProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const slides = chunk(banners, 2);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);
    const autoplay = setInterval(() => api.scrollNext(), 5000);
    return () => {
      api.off('select', onSelect);
      clearInterval(autoplay);
    };
  }, [api]);

  return (
    <div className="relative">
      <Carousel opts={{ loop: true }} setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((group, idx) => (
            <CarouselItem key={idx}>
              <div className="grid grid-cols-1 md:grid-cols-2">
                {group.map(b => (
                  <Link
                    key={b.id}
                    href={b.href}
                    className="relative block w-full aspect-[4/3] overflow-hidden"
                  >
                    <Image
                      src={b.imgSrc}
                      alt={b.alt}
                      fill
                      sizes="(max-width:768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </Link>
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={`h-2 w-2 rounded-full ${
              current === i ? 'bg-black' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default TopBanner;

