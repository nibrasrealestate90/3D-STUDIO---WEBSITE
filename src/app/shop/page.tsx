import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ShopPageClient from './ShopPageClient';

export const metadata: Metadata = {
  title: 'Shop All 3D Printed Creations — 3D Studio Dubai',
  description:
    'Browse ready-to-customize 3D printed home decor, personalized gifts, desk accessories, and corporate gifts in Dubai, UAE.',
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#737373]">
          Loading catalogue...
        </div>
      }
    >
      <ShopPageClient />
    </Suspense>
  );
}
