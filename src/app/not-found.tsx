import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CompassIcon, PackageIcon } from '@/components/ui/icons';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F45A00]/10 text-[#F45A00] border border-[#F45A00]/20 mb-6 shadow-sm">
        <PackageIcon className="h-8 w-8" />
      </div>

      <span className="font-mono text-xs text-[#963200] font-semibold uppercase tracking-widest">
        404 • Object Not Found
      </span>

      <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-[#0D1B35] tracking-tight">
        Layer Not Found
      </h1>

      <p className="mt-4 max-w-md text-sm sm:text-base text-[#525252] leading-relaxed [text-wrap:pretty]">
        The design or page you are looking for does not exist or may have been relocated in our Dubai studio catalog.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-[#0D1B35] hover:bg-[#1A2F5A] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Return Home</span>
        </Link>

        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-xl border border-[#0D1B35]/15 bg-white hover:bg-[#FCF2EC] px-6 py-3 text-sm font-semibold text-[#0D1B35] transition-colors"
        >
          <CompassIcon className="h-4 w-4 text-[#B83800]" />
          <span>Explore Shop</span>
        </Link>

        <WhatsAppButton
          message="Hello 3D Studio! I was searching for a design on your website and could not locate it."
          label="Ask on WhatsApp"
          variant="outline"
          className="text-sm"
        />
      </div>
    </div>
  );
}
