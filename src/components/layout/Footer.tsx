'use client';

import React from 'react';
import Link from 'next/link';
import { InstagramIcon, MapPinIcon, MessageCircleIcon } from '@/components/ui/icons';
import { useStore } from '@/context/StoreContext';
import { buildWhatsAppUrl } from '@/lib/storeLogic';
import { BrandLogo } from '../ui/BrandLogo';

export function Footer() {
  const { settings, categories } = useStore();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hello ${settings.storeName}! I found your Dubai 3D printing website and would like to get in touch.`
  );

  const instagramHandle = settings.instagramHandle.startsWith('@')
    ? settings.instagramHandle
    : `@${settings.instagramHandle}`;
  const instagramUrl =
    settings.instagramUrl ||
    `https://instagram.com/${settings.instagramHandle.replace(/^@/, '')}`;

  return (
    <footer className="bg-[#0D1B35] text-[#FCF2EC] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <BrandLogo
              storeName={settings.storeName}
              variant="light"
              logoStyle={settings.logoStyle}
            />
            <p className="text-sm text-[#FCF2EC]/75 leading-relaxed max-w-xs">
              Thoughtfully crafted 3D printed home decor, personalized gifts, desk
              accessories, and rapid custom prototyping in Dubai, UAE.
            </p>
            <div className="flex items-start gap-2 text-xs text-[#FCE3CB]">
              <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#F45A00]" aria-hidden="true" />
              <span>{settings.storeLocation}</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FCF2EC]/75">
              <li>
                <Link href="/" className="hover:text-[#F45A00] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#F45A00] transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/custom-print" className="hover:text-[#F45A00] transition-colors">
                  Custom 3D Printing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F45A00] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F45A00] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FCF2EC]/75">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.id}`}
                    className="hover:text-[#F45A00] transition-colors text-left"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Social */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold text-white">
              Connect &amp; Studio Hours
            </h3>
            <p className="text-xs text-[#FCF2EC]/70">{settings.businessHours}</p>
            <div className="flex flex-col gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#FCE3CB] hover:text-[#F45A00] transition-colors"
              >
                <MessageCircleIcon className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
                <span>WhatsApp: {settings.whatsappNumber}</span>
              </a>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2 text-sm text-[#FCE3CB] hover:text-[#F45A00] transition-colors"
              >
                <span>{settings.contactEmail}</span>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#FCE3CB] hover:text-[#E1306C] transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                <span>{instagramHandle}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#FCF2EC]/60">
          <p>
            &copy; {new Date().getFullYear()} Print Studio Dubai · Dubai, United Arab Emirates.
          </p>
          <p>Custom 3D printing, personalized gifts &amp; corporate fabrication across the UAE.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
