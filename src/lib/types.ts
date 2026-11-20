export type CustomerPage =
  | 'home'
  | 'shop'
  | 'product-details'
  | 'custom-print'
  | 'about'
  | 'contact';

export type EnquiryStatus = 'New' | 'In Review' | 'Quoted' | 'Completed' | 'Rejected';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export type MaterialOption =
  | 'PLA'
  | 'PETG'
  | 'ABS'
  | 'Resin'
  | 'Not Sure — Recommend for Me';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  imageUrl?: string | null;
  material: string;
  colors: string[];
  dimensions: string;
  sku: string;
  quantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  salesCount: number;
  weightGrams?: number;
  finish?: string;
  careInstructions?: string;
  supportsPersonalization?: boolean;
  updatedAt: string;
  createdAt: string;
  isFromApi?: boolean;
}

export interface CustomerEnquiry {
  id: string;
  referenceCode: string;
  customerName: string;
  email: string;
  phone: string;
  productId?: string;
  productName: string;
  quantity: number;
  selectedColor?: string;
  message: string;
  status: EnquiryStatus;
  internalNotes: string;
  createdAt: string;
}

export interface UploadedFileMeta {
  name: string;
  sizeBytes: number;
  extension: string;
  previewDataUrl?: string;
}

export interface CustomPrintRequest {
  id: string;
  referenceCode: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  projectName: string;
  projectDescription: string;
  uploadedFile?: UploadedFileMeta;
  dimensions: string;
  material: MaterialOption;
  color: string;
  quantity: number;
  budgetRangeAed: string;
  requiredDate: string;
  additionalNotes: string;
  status: EnquiryStatus;
  internalNotes: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  isPlaceholderWhatsapp: boolean;
  instagramUrl: string;
  instagramHandle: string;
  storeLocation: string;
  currency: string;
  businessHours: string;
  contactEmail: string;
  logoStyle: 'geometric' | 'monogram';
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'error';
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}


// ----------------------------------------------------------------------------
// API Boundary Contracts (Matching 3D Printing Business Dashboard Vercel API)
// ----------------------------------------------------------------------------

export interface StorefrontProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  sellingPrice: number;
  currency: string;
  weightGrams?: number;
  imageUrl: string | null;
  images?: string[];
  material?: string;
  dimensions?: string;
  finish?: string;
  colors?: string[];
  supportsPersonalization?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isAvailable: boolean;
  updatedAt: string;
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  postUrl?: string;
  order: number;
}

export interface ContentResponse {
  success: boolean;
  count: number;
  instagramGallery: InstagramPost[];
  error?: string;
  message?: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  products: StorefrontProduct[];
  error?: string;
  message?: string;
}

export interface SingleProductResponse {
  success: boolean;
  product?: StorefrontProduct;
  error?: string;
  message?: string;
}

export interface EnquiryInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  productId?: string;
}

export interface EnquiryResponse {
  success: boolean;
  enquiryId?: string;
  message: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface QuoteInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  projectTitle: string;
  projectDescription: string;
  materialPreference?: string;
  colorPreference?: string;
  quantity: number;
  targetDeadline?: string;
  uploadToken?: string;
}

export interface QuoteResponse {
  success: boolean;
  rfqReference?: string;
  quoteRequestId?: string;
  message: string;
  error?: string;
  errors?: Record<string, string>;
}
