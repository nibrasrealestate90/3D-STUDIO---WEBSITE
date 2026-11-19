import React from 'react';
import type { Metadata } from 'next';
import { getStorefrontProductBySlug, getStorefrontProducts } from '@/lib/api';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import { ProductDetailWrapper } from '@/components/product/ProductDetailWrapper';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = new Set<string>();

  // Always pre-render all standard studio catalogue products
  INITIAL_PRODUCTS.forEach((p) => {
    if (p.slug) slugs.add(p.slug);
  });

  try {
    const res = await getStorefrontProducts('All', 100);
    if (res.products && Array.isArray(res.products)) {
      res.products.forEach((p) => {
        if (p.slug) slugs.add(p.slug);
      });
    }
  } catch (err) {
    // Build-time fetch gracefully handled
  }

  // Pre-render the dynamic SPA fallback route for Cloudflare Pages rewrites
  slugs.add('dynamic');

  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === 'dynamic' || slug === 'catalogue') {
    return {
      title: 'Product Details — 3D Studio Dubai',
      description: 'Explore custom 3D printed creations crafted in Dubai, UAE.',
    };
  }

  const { product } = await getStorefrontProductBySlug(slug);
  const fallback = INITIAL_PRODUCTS.find((p) => p.slug === slug);
  const item = product || fallback;

  if (!item) {
    return {
      title: 'Product Details — 3D Studio Dubai',
      description: 'Explore custom 3D printed creations crafted in Dubai, UAE.',
    };
  }

  return {
    title: `${item.name} — 3D Studio Dubai`,
    description: item.description,
    openGraph: {
      title: `${item.name} | 3D Studio Dubai`,
      description: item.description,
      images: item.images[0] ? [{ url: item.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const isFallbackParam = slug === 'dynamic' || slug === 'catalogue';

  let initialProduct = null;
  if (!isFallbackParam) {
    const { product } = await getStorefrontProductBySlug(slug);
    initialProduct = product || INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  return <ProductDetailWrapper initialProduct={initialProduct} slug={slug} />;
}
