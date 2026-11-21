'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, ClockIcon, InstagramIcon, MailIcon, MapPinIcon } from '@/components/ui/icons';
import { WhatsAppIcon } from '../ui/WhatsAppButton';
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
            <div>
              <h3 className="font-display text-sm font-semibold text-white tracking-wide">
                Connect &amp; Studio Hours
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#FCF2EC]/75">
                <ClockIcon className="w-3.5 h-3.5 text-[#F45A00] shrink-0" aria-hidden="true" />
                <span>{settings.businessHours}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat on WhatsApp: ${settings.whatsappNumber}`}
                className="group flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#25D366]/40 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-4 h-4 shrink-0" bubbleFill="#FFFFFF" glyphFill="#25D366" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#FCF2EC]/55 group-hover:text-[#25D366] transition-colors">
                    WhatsApp Chat
                  </span>
                  <span className="block text-xs sm:text-sm font-medium text-[#FCF2EC] group-hover:text-white transition-colors truncate">
                    {settings.whatsappNumber}
                  </span>
                </div>
                <ChevronRightIcon
                  className="w-3.5 h-3.5 text-[#FCF2EC]/25 group-hover:text-[#FCF2EC]/80 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto"
                  aria-hidden="true"
                />
              </a>

              {/* Email */}
              <a
                href={`mailto:${settings.contactEmail}`}
                aria-label={`Email Studio: ${settings.contactEmail}`}
                className="group flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#F45A00]/40 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F45A00] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <MailIcon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#FCF2EC]/55 group-hover:text-[#F45A00] transition-colors">
                    Studio Email
                  </span>
                  <span className="block text-xs sm:text-sm font-medium text-[#FCF2EC] group-hover:text-white transition-colors truncate">
                    {settings.contactEmail}
                  </span>
                </div>
                <ChevronRightIcon
                  className="w-3.5 h-3.5 text-[#FCF2EC]/25 group-hover:text-[#FCF2EC]/80 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto"
                  aria-hidden="true"
                />
              </a>

              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow on Instagram: ${instagramHandle}`}
                className="group flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#E1306C]/40 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#c13584] via-[#e1306c] to-[#fd1d1d] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <InstagramIcon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#FCF2EC]/55 group-hover:text-[#E1306C] transition-colors">
                    Instagram
                  </span>
                  <span className="block text-xs sm:text-sm font-medium text-[#FCF2EC] group-hover:text-white transition-colors truncate">
                    {instagramHandle}
                  </span>
                </div>
                <ChevronRightIcon
                  className="w-3.5 h-3.5 text-[#FCF2EC]/25 group-hover:text-[#FCF2EC]/80 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto"
                  aria-hidden="true"
                />
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
