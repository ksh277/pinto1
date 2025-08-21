
export type ProductCategory = 'acrylic' | 'wood' | 'lanyard' | 'packaging';
export type ProductSubcategory =
  | 'keyring'
  | 'korotto'
  | 'smarttok'
  | 'stand'
  | 'holder'
  | 'shaker'
  | 'carabiner'
  | 'mirror'
  | 'magnet'
  | 'stationery'
  | 'cutting'
  | 'phone'
  | 'neck'
  | 'swatch'
  | 'supplies'
  | 'packaging'
  | 'all';


export interface Product {
  id: string;
  nameEn: string;
  nameKo: string;
  slug: string;
  descriptionEn: string;
  descriptionKo: string;
  priceKrw: number;
  categoryId: string;
  subcategory: string;
  imageUrl: string;
  imageUrls: string[];
  isFeatured: boolean;
  status: "draft" | "active" | "selling" | "inactive";
  isPublished: boolean;
  stockQuantity: number;
  operatorIds: string[];
  options: {
    colors?: { nameEn: string; nameKo: string; value: string, priceDelta?: number }[];
    sizes?: { name: string; price: number; description?: string }[];
    bases?: { name: string; price: number; description: string }[];
    packaging?: { name: string; price: number; description: string }[];
    quantityRanges?: { range: string; condition: string; multiplier: number }[];
  };
  stats: {
    likeCount: number;
    reviewCount: number;
    ratingSum: number;
    avgRating: number;
  };
    createdAt: Date | import('firebase/firestore').Timestamp; // Can be Date or Firestore Timestamp
    updatedAt: Date | import('firebase/firestore').Timestamp; // Can be Date or Firestore Timestamp
  categoryKo?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  nameEn: string;
  nameKo: string;
  price: number;
  image: string;
  quantity: number;
  options: {
    size: string;
    color: { nameKo: string; nameEn: string; value: string };
    customText?: string;
  };
  designFile?: {
    name: string;
    type: string;
    url?: string; // Will be added when connected to actual storage
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  nickname: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  membershipTier?: "basic" | "special" | "vip" | "vvip";
  totalSpent?: number;
  pointsBalance?: number;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    author: string; // author nickname
    rating: number;
    title: string;
    content?: string;
    image: string; // single image for now
    images?: string[];
    isFeatured?: boolean;
    likeCount: number;
    scraps: number;
    views: number;
    createdAt: Date;
    updatedAt?: Date;
    hint?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  author: { uid: string; name: string };
  views: number;
  attachments?: { name: string; url: string; size: number; type: string }[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  isPublished: boolean;
  seo?: { title: string; description: string; ogImage?: string };
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  author: { uid: string; name: string };
  tags: string[];
}

export interface Comment {
    id: string;
    user: {
        uid: string;
        nickname: string;
        avatarUrl?: string;
    };
    text: string;
    parentId?: string | null;
    isBlocked?: boolean;
    isDeleted?: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface Post {
    id: string;
    author: {
        uid: string;
        nickname: string;
        avatarUrl?: string;
    };
    title?: string;
    content: string;
    images?: {
        url: string;
        thumbUrl: string;
        w: number;
        h: number;
    }[];
    tags?: string[];
    likeCount: number;
    commentCount: number;
    viewCount?: number;
    isBlocked?: boolean;
    isDeleted?: boolean;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
}

// Add daum to the global window interface
interface DaumPostcodeConstructor {
  new (options: {
    oncomplete: (data: { address: string; zonecode: string }) => void;
    width?: string;
    height?: string;
  }): { open: () => void };
}

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcodeConstructor };
  }
}

// --- Payment and Order Types based on the new specification ---

export type OrderStatus = "draft" | "pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";
export type ShippingStatus = "preparing" | "shipped" | "delivered";


export interface OrderItem {
  id: string; // Subcollection document ID
  productId: string | null;
  name: string;
  imageUrl: string;
  options: Record<string, unknown>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  designRef?: {
    sessionId: string;
    exportPdfUrl: string;
    exportPngUrl: string;
  }
}


export interface Order {
  id: string; // Document ID, e.g., ORD-2025-000123
  userId: string;
  status: OrderStatus;
  itemsCount: number;
  amounts: {
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
    currency: "KRW";
  };
  payment: {
    status: PaymentStatus;
    provider: "portone" | string;
    transactionId: string | null;
    paidAt: Date | import('firebase/firestore').Timestamp; // Timestamp
  };
  shipping: {
    recipient: {
        name: string;
        phone: string;
        zip: string;
        address1: string;
        address2?: string;
    },
    method: string;
    carrier: string | null;
    trackingNumber: string | null;
    status: ShippingStatus;
    estimatedDelivery: Date | import('firebase/firestore').Timestamp | null; // Timestamp
    updatedAt: Date | import('firebase/firestore').Timestamp; // Timestamp
  };
  memo?: string;
  channel: 'web' | 'app';
  createdAt: Date | import('firebase/firestore').Timestamp; // Timestamp
  updatedAt: Date | import('firebase/firestore').Timestamp; // Timestamp
}

export interface Payment {
    id: string; // e.g., pay_xxx
    orderId: string;
    provider: 'portone' | string;
    status: 'paid'|'failed'|'refunded'|'partial_refund';
    amount: number;
    currency: 'KRW';
    raw: Record<string, unknown>; // Raw webhook payload
    capturedAt: Date | import('firebase/firestore').Timestamp; // Timestamp
    refundedAt?: Date | import('firebase/firestore').Timestamp; // Timestamp
    createdAt: Date | import('firebase/firestore').Timestamp; // Timestamp
}
