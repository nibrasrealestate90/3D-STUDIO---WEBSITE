'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PackageXIcon } from '@/components/ui/icons';
import { ProductDetailClient } from './ProductDetailClient';
import { getStorefrontProductBySlug } from '@/lib/api';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';

interface ProductDetailWrapperProps {
  initialProduct: Product | null;
  slug: string;
}

export function ProductDetailWrapper({ initialProduct, slug }: ProductDetailWrapperProps) {
  const { products } = useStore();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);

  useEffect(() => {
    // Detect true slug from URL on client mount (handles Cloudflare Pages SPA rewrite)
    let resolvedSlug = slug;
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
      if (parts[0] === 'products' && parts[1] && parts[1] !== 'dynamic' && parts[1] !== 'catalogue') {
        resolvedSlug = decodeURIComponent(parts[1]);
      }
    }

    // Check if live products catalog in StoreContext already has fresh product details
    const contextProduct = products.find((p) => p.slug === resolvedSlug);
    if (contextProduct) {
      setProduct(contextProduct);
      setLoading(false);
    }

    // Always fetch latest product details from live API to ensure fresh multi-image gallery
    let isCancelled = false;
    getStorefrontProductBySlug(resolvedSlug)
      .then((res) => {
        if (isCancelled) return;
        if (res.product) {
          setProduct(res.product);
        } else if (!product && !initialProduct && !contextProduct) {
          const localFallback = INITIAL_PRODUCTS.find((p) => p.slug === resolvedSlug);
          setProduct(localFallback || null);
        }
      })
      .catch(() => {
        if (isCancelled) return;
        if (!product && !initialProduct && !contextProduct) {
          const localFallback = INITIAL_PRODUCTS.find((p) => p.slug === resolvedSlug);
          setProduct(localFallback || null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [slug, products]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F45A00] border-r-transparent align-[-0.125em]" />
        <p className="text-sm font-medium text-[#737373]">Loading creation details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FCF2EC] text-[#F45A00] border border-[#0D1B35]/10 mb-4">
          <PackageXIcon className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#0D1B35]">Product Not Found</h1>
        <p className="text-sm text-[#737373] max-w-md mx-auto">
          The requested 3D creation could not be located in our catalogue.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-[#F45A00] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#D94E00] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
