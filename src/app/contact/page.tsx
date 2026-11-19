import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Our Dubai Studio — 3D Studio',
  description:
    'Have questions about custom 3D printing, corporate gifts, materials, or delivery in Dubai and the UAE? Contact our 3D Studio team or chat directly on WhatsApp.',
};

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-[#0D1B35]/10 rounded w-1/3" />
          <div className="h-4 bg-[#0D1B35]/10 rounded w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            <div className="lg:col-span-5 h-64 bg-[#0D1B35]/10 rounded-2xl" />
            <div className="lg:col-span-7 h-96 bg-[#0D1B35]/10 rounded-2xl" />
          </div>
        </div>
      }
    >
      <ContactPageClient />
    </Suspense>
  );
}
