
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductContext } from '@/contexts/product-context';
import { useCartContext } from '@/contexts/cart-context';
import type { Product } from '@/lib/types';
import {
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Upload,
  Download,
  Puzzle,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import Image from 'next/image';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();
  const { locale: language } = useLanguage();
  const { getProductById } = useProductContext();
  const { addToCart } = useCartContext();

  const [product, setProduct] = useState<Product | null>(null);

  // State management
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedBase, setSelectedBase] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedPackaging, setSelectedPackaging] = useState<string | undefined>(undefined);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("pdf");
  const [customText, setCustomText] = useState("");

  const productData = getProductById(id);
  
  useEffect(() => {
    if (productData) {
      setProduct(productData);
      if (productData.options?.sizes?.length) {
        setSelectedSize(productData.options.sizes[0].name);
      }
       if (productData.options?.colors?.length) {
        setSelectedColor(productData.options.colors[0].nameKo);
      }
      if (productData.options?.bases?.length) {
        setSelectedBase(productData.options.bases[0].name);
      }
       if (productData.options?.packaging?.length) {
        setSelectedPackaging(productData.options.packaging[0].name);
      }
    }
  }, [id, productData]);

  const productDisplay = useMemo(() => {
    if (!product) return null;

    const defaultOptions = {
        sizes: [
            { name: "일반 20x20", price: 3500, description: "기본 사이즈" },
            { name: "일반 30x15", price: 4000, description: "기본 사이즈" },
        ],
        colors: [
            { nameEn: "Clear", nameKo: "투명", value: "#FFFFFF00", priceDelta: 500 },
            { nameEn: "White", nameKo: "흰색", value: "#FFFFFF", priceDelta: 300 },
        ],
        bases: [
            { name: "일반", price: 0, description: "기본 받침" },
            { name: "라미 3T", price: 1200, description: "3mm 라미네이팅" },
        ],
        packaging: [
            { name: "기본 포장", price: 0, description: "개별 비닐 포장" },
            { name: "선물 포장", price: 1000, description: "선물용 박스 포장" },
        ],
        quantityRanges: [
            { range: "1~9", condition: "소량 주문", multiplier: 1.0 },
            { range: "10~49", condition: "중량 주문", multiplier: 0.9 },
        ]
    };
    
    const finalOptions = {
        sizes: product.options?.sizes?.length ? product.options.sizes : defaultOptions.sizes,
        colors: product.options?.colors?.length ? product.options.colors : defaultOptions.colors,
        bases: product.options?.bases?.length ? product.options.bases : defaultOptions.bases,
        packaging: product.options?.packaging?.length ? product.options.packaging : defaultOptions.packaging,
        quantityRanges: product.options?.quantityRanges?.length ? product.options.quantityRanges : defaultOptions.quantityRanges,
    };

    return {
      ...product,
      name: language === 'ko' ? product.nameKo : product.nameEn,
      description: language === 'ko' ? product.descriptionKo : product.descriptionEn,
      images: product.imageUrls?.length ? product.imageUrls : ["https://placehold.co/600x600.png"],
      options: finalOptions,
      rating: product.stats.avgRating || 0,
      reviewCount: product.stats.reviewCount || 0,
    };
  }, [product, language]);


  const calculateTotalPrice = () => {
    if (!productDisplay || !product) return 0;
  
    const sizeData = productDisplay.options.sizes?.find(s => s.name === selectedSize);
    const sizePrice = sizeData?.price || product.priceKrw || 0;
    
    const colorData = productDisplay.options.colors?.find(c => c.nameKo === selectedColor);
    const colorPrice = colorData?.priceDelta || 0;
    
    const baseData = productDisplay.options.bases?.find(b => b.name === selectedBase);
    const baseTypePrice = baseData?.price || 0;
    
    const packagingData = productDisplay.options.packaging?.find(p => p.name === selectedPackaging);
    const packagingPrice = packagingData?.price || 0;

    const itemPrice = sizePrice;
    const addons = colorPrice + baseTypePrice + packagingPrice;
    const subtotal = itemPrice + addons;

    const quantityRange = productDisplay.options.quantityRanges?.find(r => {
      if (!r.range) return false;
      const [minStr, maxStr] = r.range.split(/[~-]/);
      const min = parseInt(minStr.replace(/\D/g, ""));
      const max = maxStr ? parseInt(maxStr.replace(/\D/g, "")) : Infinity;
      return quantity >= min && (isNaN(max) || quantity <= max);
    });
    const multiplier = quantityRange?.multiplier || 1;

    const total = Math.round(subtotal * multiplier * quantity);
    
    return total;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({ title: "파일 업로드 완료", description: `${file.name}이(가) 업로드되었습니다.` });
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      toast({ title: "PDF 파일 업로드 완료", description: `${file.name}이(가) 업로드되었습니다.` });
    }
  };

  const handleCartAction = (action: 'addToCart' | 'buyNow') => {
     if (!product || !productDisplay) return;
    if (!selectedSize || !selectedBase || (productDisplay.options.colors && productDisplay.options.colors.length > 0 && !selectedColor)) {
      toast({ title: "옵션을 선택해주세요", description: "사이즈, 색상, 받침을 선택해야 합니다.", variant: "destructive" });
      return;
    }
    
    const selectedColorObject = productDisplay.options.colors.find(c => c.nameKo === selectedColor);
    if (!selectedColorObject) {
       toast({ title: "색상 오류", description: "선택된 색상을 찾을 수 없습니다.", variant: "destructive" });
       return;
    }

    addToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameKo: product.nameKo,
      price: calculateTotalPrice() / quantity,
      image: product.imageUrl,
      quantity,
      options: {
          size: selectedSize,
          color: { nameKo: selectedColorObject.nameKo, nameEn: selectedColorObject.nameEn || selectedColorObject.nameKo, value: selectedColorObject.value },
          customText: customText,
      },
      designFile: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : undefined,
    });

    if(action === 'buyNow') {
        router.push('/cart');
    } else {
        toast({
            title: "장바구니에 추가됨",
            description: `${product.nameKo} 상품이 장바구니에 추가되었습니다.`
        });
    }
  }



  const generateStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ));
  };
  
  const sizeCategories = useMemo(() => {
    if (!productDisplay?.options?.sizes) return {};
    return {
        "일반": productDisplay.options.sizes.filter(s => s.name.startsWith("일반")),
        "라미": productDisplay.options.sizes.filter(s => s.name.startsWith("라미")),
        "대형": productDisplay.options.sizes.filter(s => s.name.startsWith("대형")),
    };
  }, [productDisplay]);


  if (!productDisplay || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">상품을 찾을 수 없습니다.</p>
          <Link href="/"><Button className="mt-4">상품 목록으로 돌아가기</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="bg-white dark:bg-[#1a1a1a] border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">홈</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href={`/category/${product.categoryId}`} className="hover:text-gray-700 dark:hover:text-gray-300">
              {product.categoryKo || product.categoryId}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 dark:text-white">{productDisplay.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden shadow-sm border dark:border-gray-700">
              <Image src={productDisplay.images[currentImageIndex]} alt={productDisplay.name} width={600} height={600} className="w-full h-full object-cover" />
            </div>

            <div className="flex space-x-2 overflow-x-auto">
              {productDisplay.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image src={image} alt={`${productDisplay.name} ${index + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{productDisplay.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex mr-2">{generateStars(Math.round(productDisplay.rating))}</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{productDisplay.rating.toFixed(1)} ({productDisplay.reviewCount} 리뷰)</span>
              </div>
            </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2">{calculateTotalPrice().toLocaleString()} 원</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">기본 가격부터 시작 (옵션에 따라 변동)</div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">✅ 스탠드 사이즈</Label>
                <div className="space-y-4">
                    {Object.entries(sizeCategories).map(([categoryName, sizes]) => 
                        sizes.length > 0 && (
                        <div key={categoryName}>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{categoryName} 사이즈</h4>
                            <div className="grid grid-cols-4 gap-2">
                              {sizes.map((size: { name: string; price: number }) => (
                                <button
                                key={size.name}
                                onClick={() => setSelectedSize(size.name)}
                                className={`p-2 rounded border text-center text-sm transition-all ${
                                    selectedSize === size.name
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                                }`}
                                >
                                <div className="font-medium">{size.name.replace(categoryName, '').trim()}</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">{size.price.toLocaleString()}원</div>
                                </button>
                            ))}
                            </div>
                        </div>
                        )
                    )}
                </div>
              </div>

                {productDisplay.options.bases && productDisplay.options.bases.length > 0 && (
                <div>
                    <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">✅ 받침 선택</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {productDisplay.options.bases.map(base => (
                        <button
                        key={base.name}
                        onClick={() => setSelectedBase(base.name)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                            selectedBase === base.name
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                        }`}
                        >
                        <div className="font-medium">{base.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{base.description}</div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{base.price > 0 ? `+${base.price.toLocaleString()}원` : "무료"}</div>
                        </button>
                    ))}
                    </div>
                </div>
                )}
              {productDisplay.options.colors && productDisplay.options.colors.length > 0 && (
                <div>
                  <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">✅ 색상 선택</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {productDisplay.options.colors.map(color => (
                      <button
                        key={color.nameKo}
                        onClick={() => setSelectedColor(color.nameKo)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedColor === color.nameKo
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        <div className="font-medium">{color.nameKo}</div>
                        {color.priceDelta ? (<div className="text-sm font-medium text-blue-600 dark:text-blue-400">+{color.priceDelta.toLocaleString()}원</div>) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">✅ 수량 선택</Label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center border dark:border-gray-700 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg text-gray-900 dark:text-gray-100"><Minus className="w-4 h-4" /></button>
                    <span className="px-4 py-2 border-x dark:border-gray-700 min-w-[60px] text-center text-gray-900 dark:text-gray-100">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg text-gray-900 dark:text-gray-100"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                 {productDisplay.options.quantityRanges && (
                    <div className="bg-gray-50 dark:bg-[#1a1a1a]/50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300"><strong>수량별 할인 안내:</strong></div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                            {productDisplay.options.quantityRanges.map(range => (
                            <div key={range.range} className="flex justify-between">
                                <span>{range.range} ({range.condition})</span>
                                <span className="font-medium">{range.multiplier === 1 ? "정가" : `${((1 - range.multiplier) * 100).toFixed(0)}% 할인`}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
              </div>

                {productDisplay.options.packaging && productDisplay.options.packaging.length > 0 && (
                <div>
                    <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">✅ 포장 방식</Label>
                    <div className="grid grid-cols-2 gap-2">
                    {productDisplay.options.packaging.map(pkg => (
                        <button
                        key={pkg.name}
                        onClick={() => setSelectedPackaging(pkg.name)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                            selectedPackaging === pkg.name
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100"
                        }`}
                        >
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{pkg.description}</div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{pkg.price > 0 ? `+${pkg.price.toLocaleString()}원` : "무료"}</div>
                        </button>
                    ))}
                    </div>
                </div>
                )}

              <div>
                <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-white">✅ 파일 업로드</Label>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pdf">PDF 업로드</TabsTrigger>
                    <TabsTrigger value="design">도안 작업 의뢰</TabsTrigger>
                    <TabsTrigger value="editor">굿즈에디터</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pdf" className="mt-4">
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${isDragOver ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30" : uploadedFile ? "border-green-400 bg-green-50 dark:bg-green-900/30" : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        {uploadedFile ? (
                          <div><p className="text-green-600 dark:text-green-400 font-medium mb-2">✅ {uploadedFile.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">파일이 업로드되었습니다. 다른 파일을 선택하려면 클릭하세요.</p></div>
                        ) : (
                          <div><p className="text-gray-600 dark:text-gray-300 font-medium mb-2">PDF 파일을 드래그하거나 클릭하여 업로드</p><p className="text-sm text-gray-500 dark:text-gray-400">최대 50MB, PDF 파일만 업로드 가능합니다.</p></div>
                        )}
                      </label>
                    </div>
                  </TabsContent>
                  <TabsContent value="design" className="mt-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-300">도안 작업 의뢰</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">전문 디자이너가 고객님의 요청에 따라 도안을 제작해드립니다.</p>
                      <Textarea placeholder="원하는 디자인에 대해 자세히 설명해주세요..." value={customText} onChange={(e) => setCustomText(e.target.value)} className="mb-3" rows={4} />
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">* 도안 작업비: 별도 견적 (복잡도에 따라 5,000원~20,000원)</div>
                    </div>
                  </TabsContent>
                  <TabsContent value="editor" className="mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">굿즈에디터</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">브라우저에서 바로 디자인을 만들어보세요!</p>
                      <Link href={`/editor?type=${product.categoryId}`}><Button className="w-full bg-blue-600 hover:bg-blue-700 text-white"><Puzzle className="w-4 h-4 mr-2" />굿즈에디터 시작하기</Button></Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <Link href={`/editor`} className="inline-flex items-center rounded-lg border px-3 py-2">
              이 디자인으로 굿즈 에디터 열기
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleCartAction('addToCart')} disabled={!selectedSize || !selectedBase} size="lg" variant="outline" className="text-lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  장바구니
              </Button>
               <Button onClick={() => handleCartAction('buyNow')} disabled={!selectedSize || !selectedBase} size="lg" className="text-lg">
                  <CreditCard className="w-5 h-5 mr-2" />
                  바로 구매
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">샘플파일 안내</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">올바른 파일 제작을 위한 템플릿과 가이드를 확인하세요</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"><Download className="w-4 h-4 mr-2" />다운로드</Button>
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">상품 상세</TabsTrigger>
              <TabsTrigger value="qna">상품 문의</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-8">
                <Image src="https://placehold.co/1200x800.png" alt="상품 상세 이미지" width={1200} height={800} className="w-full rounded-lg" />
            </TabsContent>
            <TabsContent value="qna" className="mt-8">
              <Button>
                문의하기
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
