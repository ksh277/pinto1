
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const editorProducts = [
  {
    type: 'keyring',
    name: '아크릴 키링',
    nameEn: 'Acrylic Keyring',
    description: '투명한 아크릴 소재로 제작되는 키링',
    price: 3500,
    tags: ['인기', '투명'],
    specs: { '크기': '5cm x 5cm', '두께': '3mm' },
    isPopular: true,
  },
  {
    type: 'photocard-holder',
    name: '포토카드 홀더',
    nameEn: 'Photocard Holder',
    description: '포토카드를 보호하고 꾸밀 수 있는 홀더',
    price: 2800,
    tags: ['보호', '매트'],
    specs: { '크기': '6cm x 9cm', '두께': '2mm' },
  },
  {
    type: 'acrylic-stand',
    name: '아크릴 스탠드',
    nameEn: 'Acrylic Stand',
    description: '캐릭터나 디자인을 세워둘 수 있는 스탠드',
    price: 4200,
    tags: ['인기', '스탠드'],
    specs: { '크기': '8cm x 10cm', '두께': '5mm' },
    isPopular: true,
  },
  {
    type: 'badge',
    name: '뱃지',
    nameEn: 'Badge',
    description: '옷이나 가방에 붙일 수 있는 뱃지',
    price: 2200,
    tags: ['메탈', '핀'],
    specs: { '크기': '4cm x 4cm', '타입': '핀타입' },
  },
  {
    type: 'sticker',
    name: '스티커',
    nameEn: 'Sticker',
    description: '다양한 크기의 맞춤 스티커',
    price: 1800,
    tags: ['방수', '자유크기'],
    specs: { '크기': '자유', '재질': '방수' },
  },
  {
    type: 'phone-case',
    name: '폰케이스',
    nameEn: 'Phone Case',
    description: '개인 디자인으로 제작하는 폰케이스',
    price: 8900,
    tags: ['인기', '맞춤제작'],
    specs: { '제작': '기종별 제작', '타입': '하드케이스' },
    isPopular: true,
  },
];

export function ProductTypeSelector() {
    const router = useRouter();

    const handleSelect = (productType: string) => {
        router.push(`/editor?type=${productType}`);
    };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">어떤 굿즈를 만들까요?</h1>
          <p className="mt-3 text-muted-foreground">
            다양한 굿즈 중에서 원하는 것을 선택하면 바로 에디터로 이동합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {editorProducts.map((product) => (
            <Card key={product.type} className="group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="relative">
                     <div className="absolute top-3 right-3 z-10">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white/70 hover:bg-white text-muted-foreground hover:text-red-500">
                             <Heart className="w-5 h-5"/>
                        </Button>
                    </div>
                    {product.isPopular && (
                        <Badge variant="default" className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground">
                            ☆ 인기
                        </Badge>
                    )}
                   <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Image 
                            src="https://placehold.co/400x300.png"
                            width={400}
                            height={300}
                            alt={product.name}
                            className="object-cover w-full h-full"
                        />
                   </div>
                </div>
              <CardContent className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.nameEn}</p>
                    </div>
                    <p className="text-lg font-semibold text-primary">{product.price.toLocaleString()}원~</p>
                </div>

                <p className="mt-3 text-sm text-muted-foreground flex-grow">{product.description}</p>
                
                <div className="text-xs text-muted-foreground mt-3 space-y-1">
                    {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="flex">
                            <span className="w-12 font-medium">{key}:</span>
                            <span>{value}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                  ))}
                </div>

              </CardContent>
               <div className="p-5 pt-0 mt-auto">
                    <Button 
                        className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white text-base font-bold"
                        onClick={() => handleSelect(product.type)}
                    >
                        선택하고 디자인 시작
                    </Button>
                </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
