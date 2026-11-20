import type {
  Category,
  CustomPrintRequest,
  CustomerEnquiry,
  MaterialOption,
  Product,
  SortOption,
} from './types';

export interface ProductFilterOptions {
  search?: string;
  categoryId?: string;
  maxPrice?: number;
  sortBy?: SortOption;
  includeUnavailable?: boolean;
  availabilityFilter?: 'all' | 'available' | 'unavailable';
}

export function formatAed(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return `AED ${safe.toLocaleString('en-AE', {
    minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getEffectivePrice(product: Pick<Product, 'price' | 'salePrice'>): number {
  if (typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price) {
    return product.salePrice;
  }
  return product.price;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateReferenceCode(prefix: 'LC-ENQ' | 'LC-CUSTOM'): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomDigits}`;
}

export function sanitizePhoneForWaMe(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length > 0 ? digits : '971500000000';
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digits = sanitizePhoneForWaMe(phoneNumber);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(
  productName: string,
  priceAed: number,
  quantity = 1,
  color?: string,
  sku?: string,
  personalizationText?: string
): string {
  const qtyPart = quantity > 1 ? ` (Quantity: ${quantity})` : '';
  const colorPart = color ? ` in ${color}` : '';
  const skuPart = sku ? ` [SKU: ${sku}]` : '';
  const personalPart =
    personalizationText && personalizationText.trim().length > 0
      ? ` [Custom Text: "${personalizationText.trim()}"]`
      : '';
  const totalAed = priceAed * quantity;
  return `Hello 3D Studio! I would like to enquire about: "${productName}"${skuPart}${colorPart}${personalPart}${qtyPart}. Indicative price is AED ${totalAed}. Could you please confirm studio availability and delivery lead time in Dubai?`;
}

export function buildCustomPrintWhatsAppMessage(projectName?: string, referenceCode?: string): string {
  const refPart = referenceCode ? ` (Ref: ${referenceCode})` : '';
  if (projectName && projectName.trim().length > 0) {
    return `Hello 3D Studio! I would like to discuss a custom 3D printing project: "${projectName.trim()}"${refPart} in Dubai.`;
  }
  return `Hello 3D Studio! I would like to discuss a custom 3D printing project${refPart} in Dubai.`;
}

export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions
): Product[] {
  const query = (options.search ?? '').trim().toLowerCase();
  const categoryId = options.categoryId ?? 'all';
  const maxPrice = options.maxPrice;
  const sortBy = options.sortBy ?? 'featured';
  const includeUnavailable = options.includeUnavailable ?? false;
  const availabilityFilter = options.availabilityFilter ?? 'all';

  const filtered = products.filter((product) => {
    if (!includeUnavailable && !product.isAvailable) {
      return false;
    }
    if (availabilityFilter === 'available' && !product.isAvailable) {
      return false;
    }
    if (availabilityFilter === 'unavailable' && product.isAvailable) {
      return false;
    }
    if (categoryId !== 'all') {
      const cleanTarget = categoryId.toLowerCase().replace(/^cat-/, '');
      const cleanProdCat = product.categoryId.toLowerCase().replace(/^cat-/, '');
      if (cleanProdCat !== cleanTarget && product.categoryId !== categoryId) {
        return false;
      }
    }
    const price = getEffectivePrice(product);
    if (typeof maxPrice === 'number' && maxPrice > 0 && price > maxPrice) {
      return false;
    }
    if (query.length > 0) {
      const haystack = `${product.name} ${product.description} ${product.material} ${product.sku} ${product.colors.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return getEffectivePrice(a) - getEffectivePrice(b);
      case 'price-desc':
        return getEffectivePrice(b) - getEffectivePrice(a);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'featured':
      default: {
        const aScore = (a.isFeatured ? 2 : 0) + (a.isBestSeller ? 1 : 0);
        const bScore = (b.isFeatured ? 2 : 0) + (b.isBestSeller ? 1 : 0);
        if (bScore !== aScore) {
          return bScore - aScore;
        }
        return b.salesCount - a.salesCount;
      }
    }
  });

  return sorted;
}

export const ALLOWED_3D_FILE_EXTENSIONS = [
  '.stl',
  '.obj',
  '.3mf',
  '.step',
  '.stp',
  '.png',
  '.jpg',
  '.jpeg',
] as const;

export function validateFileUpload(
  fileName: string,
  sizeBytes: number
): { valid: boolean; extension: string; error?: string } {
  const dotIndex = fileName.lastIndexOf('.');
  const extension = dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : '';
  if (!ALLOWED_3D_FILE_EXTENSIONS.includes(extension as (typeof ALLOWED_3D_FILE_EXTENSIONS)[number])) {
    return {
      valid: false,
      extension,
      error: 'Unsupported file format. Please upload .STL, .OBJ, .3MF, .STEP, .STP, .PNG, .JPG, or .JPEG.',
    };
  }
  const maxBytes = 25 * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    return {
      valid: false,
      extension,
      error: 'File exceeds the 25 MB demo upload limit.',
    };
  }
  return { valid: true, extension };
}

export interface CustomPrintFormInput {
  fullName: string;
  email: string;
  whatsappNumber: string;
  projectName: string;
  projectDescription: string;
  dimensions: string;
  material: MaterialOption;
  color: string;
  quantity: number;
  budgetRangeAed: string;
  requiredDate: string;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Sensible international phone number validation.
 * Accepts optional leading '+' and digits separated by spaces, hyphens, or parentheses.
 * Requires 7 to 15 digits (ITU-T E.164 standard).
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;
  if (!/^\+?[0-9\s\-()]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/[^0-9]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export interface ProductEnquiryFormInput {
  customerName: string;
  email: string;
  phone: string;
  quantity: number | string;
  message: string;
}

export function validateProductEnquiryForm(
  input: ProductEnquiryFormInput
): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = String(input.customerName || '').trim();
  if (!name) {
    errors.customerName = 'Please enter your full name.';
  } else if (name.length < 2) {
    errors.customerName = 'Name must be at least 2 characters.';
  } else if (name.length > 150) {
    errors.customerName = 'Name cannot exceed 150 characters.';
  }

  const email = String(input.email || '').trim();
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(email) || email.length > 255) {
    errors.email = 'Please enter a valid email address.';
  }

  const phone = String(input.phone || '').trim();
  if (!phone) {
    errors.phone = 'Please enter your phone or WhatsApp number.';
  } else if (!isValidPhoneNumber(phone)) {
    errors.phone = 'Please enter a valid phone number (7-15 digits).';
  }

  const rawQty = input.quantity;
  const qty =
    typeof rawQty === 'number'
      ? rawQty
      : Number(String(rawQty || '').trim());
  if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
    errors.quantity = 'Quantity must be a positive integer of at least 1.';
  } else if (qty > 500) {
    errors.quantity = 'Quantity cannot exceed 500 units.';
  }

  const message = String(input.message || '').trim();
  if (!message) {
    errors.message = 'Please add a short note about your enquiry.';
  } else if (message.length < 5) {
    errors.message = 'Message must be at least 5 characters.';
  } else if (message.length > 5000) {
    errors.message = 'Message cannot exceed 5000 characters.';
  }

  return errors;
}

export function validateCustomPrintForm(
  input: CustomPrintFormInput
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.fullName.trim()) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!input.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
  }
  if (!input.whatsappNumber.trim() || input.whatsappNumber.replace(/[^0-9]/g, '').length < 7) {
    errors.whatsappNumber = 'Please enter a valid WhatsApp or phone number.';
  }
  if (!input.projectName.trim()) {
    errors.projectName = 'Please give your project a short name.';
  }
  if (!input.projectDescription.trim() || input.projectDescription.trim().length < 15) {
    errors.projectDescription = 'Please describe your project (at least 15 characters).';
  }
  if (!Number.isFinite(input.quantity) || input.quantity < 1) {
    errors.quantity = 'Quantity must be at least 1.';
  }

  return errors;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  material: string;
  dimensions: string;
  quantity: number;
  images: string[];
  colors: string[];
}

export function validateProductForm(input: ProductFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) {
    errors.name = 'Product name is required.';
  }
  if (!input.slug.trim()) {
    errors.slug = 'URL slug is required.';
  }
  if (!input.categoryId.trim()) {
    errors.categoryId = 'Please select a category.';
  }
  if (!input.description.trim()) {
    errors.description = 'Product description is required.';
  }
  if (!Number.isFinite(input.price) || input.price <= 0) {
    errors.price = 'Price must be greater than AED 0.';
  }
  if (typeof input.salePrice === 'number' && input.salePrice > 0 && input.salePrice >= input.price) {
    errors.salePrice = 'Sale price must be lower than the regular price.';
  }
  if (!input.sku.trim()) {
    errors.sku = 'SKU is required.';
  }
  if (!input.material.trim()) {
    errors.material = 'Material is required.';
  }
  if (!Number.isFinite(input.quantity) || input.quantity < 0) {
    errors.quantity = 'Quantity cannot be negative.';
  }
  return errors;
}

export interface DashboardKpis {
  totalProducts: number;
  activeProducts: number;
  pendingEnquiries: number;
  customPrintRequests: number;
  openCustomRequests: number;
}

export function calculateDashboardKpis(
  products: Product[],
  enquiries: CustomerEnquiry[],
  customRequests: CustomPrintRequest[]
): DashboardKpis {
  return {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.isAvailable).length,
    pendingEnquiries: enquiries.filter(
      (e) => e.status === 'New' || e.status === 'In Review'
    ).length,
    customPrintRequests: customRequests.length,
    openCustomRequests: customRequests.filter(
      (r) => r.status === 'New' || r.status === 'In Review' || r.status === 'Quoted'
    ).length,
  };
}

export function getCategoryDistribution(
  products: Product[],
  categories: Category[]
): Array<{ category: Category; count: number; percentage: number }> {
  const total = products.length || 1;
  return categories.map((category) => {
    const count = products.filter((p) => p.categoryId === category.id).length;
    return {
      category,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });
}

/**
 * Resolves, validates, and deduplicates product gallery images while preserving dashboard order.
 * - Primary image (index 0) remains authoritative
 * - Preserves exact image order from dashboard
 * - Maintains backward compatibility with legacy products that only have imageUrl
 * - If images[] is empty, falls back to imageUrl
 * - Deduplicates identical image URLs
 * - Filters out invalid, malformed, or dangerous scheme image URLs
 */
export function resolveProductImages(
  images?: (string | null | undefined)[] | null,
  imageUrl?: string | null
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  const isValidUrl = (url: unknown): url is string => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.length === 0) return false;
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('file:') ||
      lower.startsWith('blob:') ||
      lower.startsWith('about:')
    ) {
      return false;
    }
    // Allow https://, http://, and safe leading slash paths (no traversal)
    if (lower.startsWith('https://') || lower.startsWith('http://')) {
      return true;
    }
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('..')) {
      return true;
    }
    return false;
  };

  const addUrl = (url: unknown) => {
    if (isValidUrl(url)) {
      const clean = url.trim();
      if (!seen.has(clean)) {
        seen.add(clean);
        result.push(clean);
      }
    }
  };

  // 1. Process images array preserving order
  if (Array.isArray(images)) {
    for (const img of images) {
      addUrl(img);
    }
  }

  // 2. Fall back to imageUrl if no valid images found, or ensure imageUrl is included
  if (result.length === 0 && isValidUrl(imageUrl)) {
    addUrl(imageUrl);
  }

  return result;
}
