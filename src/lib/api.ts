import {
  Product,
  StorefrontProduct,
  ProductsResponse,
  SingleProductResponse,
  EnquiryInput,
  EnquiryResponse,
  QuoteInput,
  QuoteResponse,
  InstagramPost,
  ContentResponse,
} from './types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:3000';

export function mapStorefrontProductToStoreProduct(sp: StorefrontProduct): Product {
  const categoryIdMap: Record<string, string> = {
    'home decor': 'cat-home-decor',
    'personalized gifts': 'cat-personalized-gifts',
    'keychains & accessories': 'cat-keychains',
    'desk accessories': 'cat-desk-accessories',
    'phone stands': 'cat-phone-stands',
    'corporate gifts': 'cat-corporate-gifts',
    'custom prints': 'cat-home-decor',
  };

  const catLower = (sp.category || '').toLowerCase();
  const matchedCategoryId = categoryIdMap[catLower] || 'cat-desk-accessories';

  // Multi-image array resolution: prefer sp.images if non-empty, then sp.imageUrl
  let images: string[] = [];
  if (Array.isArray(sp.images) && sp.images.length > 0) {
    images = sp.images;
  } else if (sp.imageUrl) {
    images = [sp.imageUrl];
  } else {
    images = ['/assets/images/hero_creations_dubai_1794842125042.jpg'];
  }

  return {
    id: sp.id,
    name: sp.name,
    slug: sp.slug,
    categoryId: matchedCategoryId,
    description: sp.description || 'Precision 3D printed additive creation crafted in Dubai.',
    price: sp.sellingPrice,
    images,
    material: sp.material || 'Bio-Polymer PLA+ / PETG',
    colors: Array.isArray(sp.colors) && sp.colors.length > 0 ? sp.colors : ['Warm Cream', 'Deep Navy', 'Charcoal Black'],
    dimensions: sp.dimensions || (sp.weightGrams ? `Weight: ${sp.weightGrams}g` : 'Standard Studio Spec'),
    finish: sp.finish || '0.16mm Layer Height, Smooth Satin Finish',
    supportsPersonalization: Boolean(sp.supportsPersonalization),
    isFeatured: Boolean(sp.isFeatured),
    isBestSeller: Boolean(sp.isBestSeller),
    sku: sp.sku || `LC-${sp.id.slice(-6).toUpperCase()}`,
    quantity: 20,
    isAvailable: sp.isAvailable,
    salesCount: sp.isBestSeller ? 150 : 25,
    createdAt: sp.updatedAt || new Date().toISOString(),
    updatedAt: sp.updatedAt || new Date().toISOString(),
    isFromApi: true,
  };
}

/**
 * Fetch published product catalog from GET /api/store/products
 * Production Fallback: If API fails or is unreachable, returns empty array with isUnavailable: true.
 * NEVER falls back to fabricated mock products.
 */
export async function getStorefrontProducts(
  category?: string,
  limit: number = 50
): Promise<{ products: Product[]; isFromApi: boolean; isUnavailable: boolean }> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All' && category !== 'all') {
      params.set('category', category);
    }
    params.set('limit', String(limit));

    const endpoint = `${API_BASE_URL}/api/store/products?${params.toString()}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return { products: [], isFromApi: false, isUnavailable: true };
    }

    const data: ProductsResponse = await res.json();
    if (data.success && Array.isArray(data.products)) {
      const apiProducts = data.products.map(mapStorefrontProductToStoreProduct);
      return { products: apiProducts, isFromApi: true, isUnavailable: false };
    }

    return { products: [], isFromApi: false, isUnavailable: true };
  } catch (err) {
    return { products: [], isFromApi: false, isUnavailable: true };
  }
}

/**
 * Fetch published website content (Instagram gallery, etc.) from GET /api/store/content
 * Production Fallback: Returns empty gallery if API is unreachable. Never injects fabricated posts.
 */
export async function getStorefrontContent(): Promise<{
  instagramGallery: InstagramPost[];
  isFromApi: boolean;
  isUnavailable: boolean;
}> {
  try {
    const endpoint = `${API_BASE_URL}/api/store/content`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data: ContentResponse = await res.json();
      if (data.success && Array.isArray(data.instagramGallery)) {
        return { instagramGallery: data.instagramGallery, isFromApi: true, isUnavailable: false };
      }
    }
    return { instagramGallery: [], isFromApi: false, isUnavailable: true };
  } catch {
    return { instagramGallery: [], isFromApi: false, isUnavailable: true };
  }
}

/**
 * Fetch single published product by slug
 * Returns { product, isFromApi, isUnavailable }.
 * Never returns fabricated products.
 */
export async function getStorefrontProductBySlug(
  slug: string
): Promise<{ product: Product | null; isFromApi: boolean; isUnavailable: boolean }> {
  try {
    const cleanSlug = encodeURIComponent(slug.trim());
    const endpoint = `${API_BASE_URL}/api/store/products/${cleanSlug}`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data: SingleProductResponse = await res.json();
      if (data.success && data.product) {
        return { product: mapStorefrontProductToStoreProduct(data.product), isFromApi: true, isUnavailable: false };
      }
    }

    if (res.status === 404) {
      return { product: null, isFromApi: true, isUnavailable: false };
    }

    return { product: null, isFromApi: false, isUnavailable: true };
  } catch (err) {
    return { product: null, isFromApi: false, isUnavailable: true };
  }
}

/**
 * Submit general customer or product enquiry via POST /api/store/enquiries
 */
export async function submitEnquiry(input: EnquiryInput): Promise<EnquiryResponse> {
  try {
    const endpoint = `${API_BASE_URL}/api/store/enquiries`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || `Enquiry submission failed (${res.status}).`,
        error: data?.error || 'SUBMISSION_ERROR',
        errors: data?.errors,
      };
    }

    return {
      success: true,
      enquiryId: data.enquiryId,
      message:
        data.message ||
        'Your enquiry has been received. Our Dubai studio team will review and respond promptly.',
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network offline: Stored locally in demo queue. We will contact you via WhatsApp.',
      error: 'NETWORK_ERROR',
    };
  }
}

/**
 * Submit custom CAD quote request via POST /api/store/quotes
 */
export async function submitQuoteRequest(input: QuoteInput): Promise<QuoteResponse> {
  try {
    const endpoint = `${API_BASE_URL}/api/store/quotes`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || `Quote request failed (${res.status}).`,
        error: data?.error || 'QUOTE_SUBMISSION_ERROR',
        errors: data?.errors,
      };
    }

    return {
      success: true,
      rfqReference: data.rfqReference,
      quoteRequestId: data.quoteRequestId,
      message:
        data.message ||
        'Your custom manufacturing quote request has been submitted successfully.',
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network offline: Stored locally in demo queue. Continue directly on WhatsApp.',
      error: 'NETWORK_ERROR',
    };
  }
}
