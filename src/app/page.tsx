'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRightIcon,
  CompassIcon,
  InstagramIcon,
  LayersIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@/components/ui/icons';
import { ProductCard } from '@/components/product/ProductCard';
import { SafeImage } from '@/components/ui/SafeImage';
import { useStore } from '@/context/StoreContext';
import { HERO_IMAGE, WORKSHOP_IMAGE } from '@/lib/mockData';

export default function HomePage() {
  const { products, categories, settings, instagramGallery, isCatalogLoading, isCatalogUnavailable } = useStore();

  const galleryList = Array.isArray(instagramGallery) ? instagramGallery : [];

  const bestSellers = products
    .filter((p) => p.isAvailable)
    .sort((a, b) => {
      if (a.isBestSeller !== b.isBestSeller) return a.isBestSeller ? -1 : 1;
      return b.salesCount - a.salesCount;
    })
    .slice(0, 8);

  const benefits = [
    {
      icon: LayersIcon,
      title: 'Precision 3D Printing',
      description: 'Fine 0.12mm–0.16mm layer calibration for smooth architectural finishes.',
    },
    {
      icon: SparklesIcon,
      title: 'Personalized Creations',
      description: 'Custom names, corporate monograms, and bespoke sizing crafted to order.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Materials',
      description: 'Matte bio-based PLA+, durable PETG, engineering ABS, and cured resin.',
    },
    {
      icon: MapPinIcon,
      title: 'Dubai-Based Service',
      description: 'Printed locally in Al Quoz with fast courier delivery across the UAE.',
    },
    {
      icon: CompassIcon,
      title: 'Made for Your Ideas',
      description: 'From one-off gifts to small-batch prototypes, built around your brief.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* A. Hero Section */}
      <section className="relative overflow-hidden bg-[#FCF2EC] pt-10 pb-16 lg:pt-16 lg:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#FCE3CB]/70"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-sm font-semibold text-[#963200]">
                3D Studio · Dubai, UAE
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#0D1B35] leading-[1.08] [text-wrap:balance]">
                Turning Ideas Into Tangible Creations.
              </h1>

              <p className="text-base sm:text-lg text-[#525252] leading-relaxed max-w-xl">
                Discover thoughtfully designed 3D printed creations, personalized gifts,
                and custom-made objects crafted with precision in Dubai.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                  <Link
                    href="/shop"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#F45A00] hover:bg-[#D94E00] text-white px-6 py-3.5 text-sm font-semibold whitespace-nowrap shadow-xs transition-colors text-center"
                  >
                    <span>Explore Products</span>
                    <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                  <Link
                    href="/custom-print"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#0D1B35]/20 bg-white hover:border-[#0D1B35] text-[#0D1B35] px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors text-center"
                  >
                    Create Something Custom
                  </Link>
                </motion.div>
              </div>

              <div className="pt-4 border-t border-[#0D1B35]/10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#737373]">
                <span>Local Dubai Production</span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span>2–4 Day Turnaround</span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span>Bespoke &amp; Corporate Orders</span>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-[#0D1B35]/10 shadow-xl min-h-[300px] lg:min-h-[440px]">
                <SafeImage
                  src={HERO_IMAGE}
                  alt="Curated arrangement of 3D printed sculptural vase, glowing Voronoi sphere lamp, faceted orange fox, and geometric phone stand in Dubai sunlight"
                  fallbackTitle={`${settings.storeName} Collection`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. Category Showcase */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B35]">
                Shop by Category
              </h2>
              <p className="text-sm text-[#737373] mt-1">
                Explore curated collections crafted for homes, desks, and thoughtful gifting.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#963200] hover:text-[#0D1B35] whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              <span>View Full Catalogue</span>
              <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
              >
                <Link
                  href={`/shop?category=${cat.id}`}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#0D1B35]/10 text-left card-hover-elevate block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F45A00]"
                >
                  <SafeImage
                    src={cat.imageUrl || cat.image}
                    alt={cat.name}
                    fallbackTitle={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0D1B35]/90 via-[#0D1B35]/35 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 flex items-end justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-lg font-bold text-white truncate">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-[11px] sm:text-xs text-[#FCF2EC]/85 mt-0.5 line-clamp-1 hidden sm:block">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 group-hover:bg-[#F45A00] text-white inline-flex items-center justify-center transition-colors shrink-0">
                      <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* C. Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.45 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B35]">
              Best Sellers
            </h2>
            <p className="text-sm text-[#737373] mt-1">
              Popular 3D printed creations from our Dubai studio catalogue.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D1B35] hover:text-[#F45A00] whitespace-nowrap self-start sm:self-auto"
          >
            <span>Browse All Creations</span>
            <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </Link>
        </motion.div>

        {isCatalogLoading ? (
          <div className="py-12 text-center text-sm text-[#737373]">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#F45A00] border-r-transparent mb-3" />
            <p>Loading studio creations...</p>
          </div>
        ) : bestSellers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#0D1B35]/10 p-8 sm:p-12 text-center space-y-4">
            <h3 className="font-display text-xl font-bold text-[#0D1B35]">
              {isCatalogUnavailable ? 'Catalogue Temporarily Offline' : 'New Creations Releasing Soon'}
            </h3>
            <p className="text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
              {isCatalogUnavailable
                ? 'Our online catalogue is temporarily undergoing scheduled maintenance. For active 3D printing orders, reach out via custom quote or contact our studio directly.'
                : 'Our Dubai studio is currently preparing our latest batch of ready-to-order creations. In the meantime, we accept custom 3D printing and prototyping orders.'}
            </p>
            <div className="pt-2">
              <Link
                href="/custom-print"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F45A00] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#D94E00] transition-colors"
              >
                <span>Request Custom 3D Print</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {bestSellers.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* D. Custom Printing CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl bg-[#FCE3CB]/60 border border-[#0D1B35]/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
        >
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-5">
            <p className="text-xs font-semibold text-[#963200]">
              Bespoke Fabrication &amp; Prototyping
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B35] leading-tight [text-wrap:balance]">
              Have an Idea? Let&apos;s Bring It to Life.
            </h2>
            <p className="text-base text-[#0D1B35]/75 leading-relaxed max-w-lg">
              From personalized gifts to prototypes and unique creations, we turn your
              ideas into physical objects. Upload your 3D CAD file or reference sketch
              for a tailored Dubai studio quote.
            </p>
            <div className="pt-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="inline-block">
                <Link
                  href="/custom-print"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B35] hover:bg-[#F45A00] text-white px-6 py-3.5 text-sm font-semibold transition-colors"
                >
                  <span>Request a Custom Print</span>
                  <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[280px] lg:min-h-[380px]">
            <SafeImage
              src={WORKSHOP_IMAGE}
              alt="Clean 3D printing creative workshop desk with architectural prototypes and filament spools"
              fallbackTitle={`${settings.storeName} Prototyping Studio`}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* E. Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B35]">
            Why Choose {settings.storeName}
          </h2>
          <p className="text-sm text-[#737373] mt-1">
            Crafted locally with calibrated hardware and design-first finishing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="rounded-2xl bg-white border border-[#0D1B35]/10 p-5 sm:p-6 flex flex-col justify-between card-hover-elevate"
              >
                <div>
                  <Icon className="w-5 h-5 text-[#F45A00] mb-3.5" aria-hidden="true" />
                  <h3 className="font-display text-base font-bold text-[#0D1B35] leading-snug">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[#525252] leading-relaxed mt-2.5">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* F. Instagram Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.45 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c13584] via-[#e1306c] via-[#fd1d1d] to-[#f77737] text-white inline-flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <InstagramIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B35]">
                Follow Our Creations
              </h2>
              <p className="text-sm text-[#737373] mt-0.5">
                Daily studio builds and custom client deliveries · {settings.instagramHandle}
              </p>
            </div>
          </div>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#c13584] to-[#e1306c] hover:brightness-105 active:scale-95 text-white px-5 py-2.5 text-sm font-semibold shadow-xs hover:shadow-md transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <InstagramIcon className="w-4 h-4 text-white" />
            <span>Follow Us on Instagram</span>
          </motion.a>
        </motion.div>

        {galleryList.length === 0 ? (
          <div className="rounded-2xl bg-[#FCF2EC] border border-[#0D1B35]/10 p-8 sm:p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#c13584] shadow-xs">
              <InstagramIcon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0D1B35]">
              Join Our Dubai Studio on Instagram
            </h3>
            <p className="text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
              Follow {settings.instagramHandle} for daily behind-the-scenes multi-color 3D prints, client deliveries, and studio timelapses.
            </p>
            <div className="pt-2">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#c13584] to-[#e1306c] text-white px-6 py-2.5 text-sm font-semibold hover:brightness-105 transition-all shadow-xs"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Visit {settings.instagramHandle}</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryList.map((post, idx) => (
              <motion.a
                key={post.id}
                href={post.postUrl || settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={post.caption}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-[#0D1B35]/10"
              >
                <SafeImage
                  src={post.imageUrl}
                  alt={post.caption}
                  fallbackTitle={settings.instagramHandle}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-tr from-[#c13584]/60 via-[#e1306c]/60 to-[#f77737]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"
                >
                  <InstagramIcon className="w-6 h-6 text-white" />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
