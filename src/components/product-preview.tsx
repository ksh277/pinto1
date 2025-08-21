
'use client';

import Image from 'next/image';

interface ProductPreviewProps {
  imageUrl: string;
  altText: string;
  customText?: string;
}

export function ProductPreview({ imageUrl, altText, customText }: ProductPreviewProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 shadow-lg">
      <Image
        src={imageUrl}
        alt={altText}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        data-ai-hint="product image"
      />
      {customText && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 p-8 transition-all duration-300">
          <p
            className="break-all text-center font-headline text-5xl font-bold uppercase"
            style={{
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            {customText}
          </p>
        </div>
      )}
    </div>
  );
}
