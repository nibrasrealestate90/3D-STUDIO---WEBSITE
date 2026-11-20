'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_STORE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_CUSTOM_REQUESTS,
  INITIAL_ENQUIRIES,
} from '@/lib/mockData';
import type {
  Category,
  CustomPrintRequest,
  CustomerEnquiry,
  Product,
  StoreSettings,
  ToastMessage,
  InstagramPost,
} from '@/lib/types';
import { generateReferenceCode } from '@/lib/storeLogic';
import { getStorefrontProducts, getStorefrontContent, submitEnquiry, submitQuoteRequest } from '@/lib/api';
import { toast } from 'sonner';

const DEMO_STORAGE_KEY = '3dstudio_store_state_v1';
const VISIBILITY_REFRESH_THROTTLE_MS = 30_000; // 30 seconds throttle for tab visibility refresh

interface PersistedStoreState {
  products: Product[];
  categories: Category[];
  enquiries: CustomerEnquiry[];
  customRequests: CustomPrintRequest[];
  settings: StoreSettings;
  wishlistIds: string[];
}

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  enquiries: CustomerEnquiry[];
  customRequests: CustomPrintRequest[];
  settings: StoreSettings;
  wishlistIds: string[];
  instagramGallery: InstagramPost[];
  isCatalogLoading: boolean;
  isCatalogUnavailable: boolean;
  toasts: ToastMessage[];
  pushToast: (title: string, description?: string, variant?: ToastMessage['variant']) => void;
  dismissToast: (id: string) => void;
  toggleWishlist: (productId: string) => void;
  submitProductEnquiry: (
    payload: Omit<CustomerEnquiry, 'id' | 'referenceCode' | 'status' | 'internalNotes' | 'createdAt'>
  ) => Promise<CustomerEnquiry>;
  submitCustomPrintRequest: (
    payload: Omit<
      CustomPrintRequest,
      'id' | 'referenceCode' | 'status' | 'internalNotes' | 'createdAt'
    >
  ) => Promise<CustomPrintRequest>;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  enquiryModalState: {
    product: Product | null;
    quantity?: number;
    color?: string;
  };
  setEnquiryModalState: (state: { product: Product | null; quantity?: number; color?: string }) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadInitialStoreState(): PersistedStoreState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedStoreState>;
        // Categories are strictly initialized to INITIAL_CATEGORIES safe fallback.
        // Stale `parsed.categories` stored in old localStorage is intentionally ignored.
        const validApiProducts = Array.isArray(parsed.products)
          ? parsed.products.filter((p) => p.isFromApi)
          : [];
        return {
          products: validApiProducts,
          categories: INITIAL_CATEGORIES,
          enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : INITIAL_ENQUIRIES,
          customRequests: Array.isArray(parsed.customRequests)
            ? parsed.customRequests
            : INITIAL_CUSTOM_REQUESTS,
          settings: parsed.settings
            ? { ...DEFAULT_STORE_SETTINGS, ...parsed.settings }
            : DEFAULT_STORE_SETTINGS,
          wishlistIds: Array.isArray(parsed.wishlistIds) ? parsed.wishlistIds : [],
        };
      }
    } catch {
      // Fallback cleanly to empty state
    }
  }
  return {
    products: [],
    categories: INITIAL_CATEGORIES,
    enquiries: INITIAL_ENQUIRIES,
    customRequests: INITIAL_CUSTOM_REQUESTS,
    settings: DEFAULT_STORE_SETTINGS,
    wishlistIds: [],
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState<PersistedStoreState>(() => loadInitialStoreState());

  const [products, setProducts] = useState<Product[]>(initial.products);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);
  const [isCatalogUnavailable, setIsCatalogUnavailable] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>(initial.categories);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>(initial.enquiries);
  const [customRequests, setCustomRequests] = useState<CustomPrintRequest[]>(
    initial.customRequests
  );
  const [settings] = useState<StoreSettings>(initial.settings);
  const [wishlistIds, setWishlistIds] = useState<string[]>(initial.wishlistIds);
  const [instagramGallery, setInstagramGallery] = useState<InstagramPost[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [enquiryModalState, setEnquiryModalState] = useState<{
    product: Product | null;
    quantity?: number;
    color?: string;
  }>({ product: null });

  const lastVisibilityFetchTimeRef = useRef<number>(Date.now());
  const isVisibilityFetchingRef = useRef<boolean>(false);

  // On client mount, attempt to fetch live API products and website content
  useEffect(() => {
    let mounted = true;
    setIsCatalogLoading(true);
    getStorefrontProducts('All', 50)
      .then((res) => {
        if (!mounted) return;
        if (res.isFromApi) {
          setProducts(res.products);
          setIsCatalogUnavailable(false);
        } else if (res.isUnavailable) {
          setProducts([]);
          setIsCatalogUnavailable(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setProducts([]);
          setIsCatalogUnavailable(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsCatalogLoading(false);
        }
      });

    getStorefrontContent()
      .then((res) => {
        if (mounted && res.isFromApi) {
          if (Array.isArray(res.instagramGallery)) {
            setInstagramGallery(res.instagramGallery);
          }
          if (Array.isArray(res.categories)) {
            setCategories(res.categories);
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Refresh dynamic content when visitors return to an open tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Do not refresh while document remains hidden
      if (typeof document === 'undefined' || document.visibilityState !== 'visible') {
        return;
      }

      const now = Date.now();
      // Throttle: at least 30 seconds between visibility refreshes
      if (now - lastVisibilityFetchTimeRef.current < VISIBILITY_REFRESH_THROTTLE_MS) {
        return;
      }

      // Prevent overlapping requests
      if (isVisibilityFetchingRef.current) {
        return;
      }

      isVisibilityFetchingRef.current = true;
      lastVisibilityFetchTimeRef.current = now;

      try {
        const res = await getStorefrontContent();
        // Handle failed requests without replacing valid current data with an invalid response
        if (res && res.isFromApi) {
          // Update categories when response is valid
          if (Array.isArray(res.categories)) {
            setCategories(res.categories);
          }
          // Update Instagram gallery only if existing content response is valid
          if (Array.isArray(res.instagramGallery)) {
            setInstagramGallery(res.instagramGallery);
          }
        }
      } catch {
        // Silently preserve current valid state on network failure
      } finally {
        isVisibilityFetchingRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    try {
      // Dynamic categories are intentionally excluded from localStorage persistence to prevent stale cache retention.
      // Customer state (products, enquiries, customRequests, settings, wishlistIds) remains fully persisted.
      const payload: Omit<PersistedStoreState, 'categories'> = {
        products,
        enquiries,
        customRequests,
        settings,
        wishlistIds,
      };
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, [products, enquiries, customRequests, settings, wishlistIds]);

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, description?: string, variant: ToastMessage['variant'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      if (variant === 'error') {
        toast.error(title, { id, description });
      } else if (variant === 'info') {
        toast.info(title, { id, description });
      } else {
        toast.success(title, { id, description });
      }
    },
    []
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
        pushToast(
          exists ? 'Removed from saved items' : 'Saved to wishlist',
          undefined,
          'info'
        );
        return next;
      });
    },
    [pushToast]
  );

  const submitProductEnquiry = useCallback(
    async (
      payload: Omit<
        CustomerEnquiry,
        'id' | 'referenceCode' | 'status' | 'internalNotes' | 'createdAt'
      >
    ) => {
      const qtySuffix =
        typeof payload.quantity === 'number' && payload.quantity > 1
          ? ` (Qty: ${payload.quantity})`
          : '';
      const subject = `Enquiry: ${payload.productName}${qtySuffix}`;

      const apiRes = await submitEnquiry({
        customerName: payload.customerName,
        customerEmail: payload.email,
        customerPhone: payload.phone,
        subject,
        message: payload.message,
        productId: payload.productId,
      });

      if (!apiRes.success) {
        const error = new Error(apiRes.message || 'Enquiry submission failed.') as Error & {
          code?: string;
          errors?: Record<string, string>;
        };
        error.code = apiRes.error;
        error.errors = apiRes.errors;
        throw error;
      }

      const referenceCode = apiRes.enquiryId ? `ENQ-${apiRes.enquiryId}` : generateReferenceCode('LC-ENQ');
      const newEnquiry: CustomerEnquiry = {
        ...payload,
        id: apiRes.enquiryId ? `enq-${apiRes.enquiryId}` : `enq-${Date.now()}`,
        referenceCode,
        status: 'New',
        internalNotes: '',
        createdAt: new Date().toISOString(),
      };
      setEnquiries((prev) => [newEnquiry, ...prev]);

      pushToast(
        'Enquiry received',
        `Reference ${newEnquiry.referenceCode} confirmed.`
      );
      return newEnquiry;
    },
    [pushToast]
  );

  const submitCustomPrintRequest = useCallback(
    async (
      payload: Omit<
        CustomPrintRequest,
        'id' | 'referenceCode' | 'status' | 'internalNotes' | 'createdAt'
      >
    ) => {
      const descParts = [
        payload.projectDescription,
        payload.hasDesignFile ? `3D Design File: ${payload.hasDesignFile}` : '',
        payload.dimensions ? `Dimensions: ${payload.dimensions}` : '',
        payload.budgetRangeAed ? `Budget: ${payload.budgetRangeAed}` : '',
        payload.additionalNotes ? `Notes: ${payload.additionalNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const cleanDeadline = /^\d{4}-\d{2}-\d{2}$/.test(payload.requiredDate?.trim() || '')
        ? payload.requiredDate.trim()
        : undefined;

      const apiRes = await submitQuoteRequest({
        customerName: payload.fullName,
        customerEmail: payload.email,
        customerPhone: payload.whatsappNumber,
        projectTitle: payload.projectName,
        projectDescription: descParts,
        materialPreference: payload.material,
        colorPreference: payload.color,
        quantity: payload.quantity,
        targetDeadline: cleanDeadline,
      });

      if (!apiRes.success) {
        const error = new Error(apiRes.message || 'Quote request submission failed.') as Error & {
          code?: string;
          errors?: Record<string, string>;
        };
        error.code = apiRes.error;
        error.errors = apiRes.errors;
        throw error;
      }

      const referenceCode =
        apiRes.rfqReference ||
        (apiRes.quoteRequestId ? `RFQ-${apiRes.quoteRequestId}` : generateReferenceCode('LC-CUSTOM'));

      const newReq: CustomPrintRequest = {
        ...payload,
        id: apiRes.quoteRequestId ? `req-${apiRes.quoteRequestId}` : `req-${Date.now()}`,
        referenceCode,
        status: 'New',
        internalNotes: '',
        createdAt: new Date().toISOString(),
      };
      setCustomRequests((prev) => [newReq, ...prev]);

      pushToast(
        'Quote request received',
        `Reference ${newReq.referenceCode} confirmed.`
      );
      return newReq;
    },
    [pushToast]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        enquiries,
        customRequests,
        settings,
        wishlistIds,
        instagramGallery,
        isCatalogLoading,
        isCatalogUnavailable,
        toasts,
        pushToast,
        dismissToast,
        toggleWishlist,
        submitProductEnquiry,
        submitCustomPrintRequest,
        quickViewProduct,
        setQuickViewProduct,
        enquiryModalState,
        setEnquiryModalState,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}
