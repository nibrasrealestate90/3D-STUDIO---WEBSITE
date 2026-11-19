import type { MetadataRoute } from 'next';
import { getStorefrontProducts } from '@/lib/api';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://printstudio.ae').replace(/\/+$/, '');
  const now = new Date();

  // 1. Primary Website Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/custom-print/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. Collect All Flagship & Live API Published Products
  const slugSet = new Set<string>();
  INITIAL_PRODUCTS.forEach((p) => {
    if (p.slug) slugSet.add(p.slug);
  });

  try {
    const res = await getStorefrontProducts('All', 100);
    if (res.products && Array.isArray(res.products)) {
      res.products.forEach((p) => {
        if (p.slug && p.slug !== 'dynamic' && p.slug !== 'catalogue') {
          slugSet.add(p.slug);
        }
      });
    }
  } catch {
    // Graceful build-time fallback
  }

  const productRoutes: MetadataRoute.Sitemap = Array.from(slugSet).map((slug) => ({
    url: `${baseUrl}/products/${slug}/`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
