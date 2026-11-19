'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  HeartIcon,
  LayersIcon,
  MaximizeIcon,
  MinusIcon,
  PlusIcon,
  RulerIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WeightIcon,
  WrenchIcon,
} from '@/components/ui/icons';
import { ProductCard } from '@/components/product/ProductCard';
import { SafeImage } from '@/components/ui/SafeImage';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';
import {
  buildProductWhatsAppMessage,
  formatAed,
  getEffectivePrice,
} from '@/lib/storeLogic';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { products, categories, wishlistIds, toggleWishlist, setEnquiryModalState } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [personalizationText, setPersonalizationText] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors[0] ?? 'Standard');
      setQuantity(1);
      setPersonalizationText('');
    }
  }, [product]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const category = categories.find((c) => c.id === product.categoryId);
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const effectivePrice = getEffectivePrice(product);
  const hasSale = effectivePrice < product.price;
  const isSaved = wishlistIds.includes(product.id);

  // Filter genuine related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.isAvailable)
    .sort((a, b) => (a.categoryId === product.categoryId ? -1 : 1))
    .slice(0, 4);

  const indicativeTotal = effectivePrice * quantity;
  const whatsappMsg = buildProductWhatsAppMessage(
    product.name,
    effectivePrice,
    quantity,
    selectedColor,
    product.sku,
    personalizationText
  );

  const images = product.images.length > 0 ? product.images : ['/assets/images/hero_creations_dubai_1794842125042.jpg'];
  const activeImage = images[activeImageIndex] ?? images[0];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-20 space-y-12 sm:space-y-16">
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#737373]">
        <Link href="/" className="hover:text-[#0D1B35] transition-colors">
          Home
        </Link>
        <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
        <Link href="/shop" className="hover:text-[#0D1B35] transition-colors">
          Shop
        </Link>
        {category && (
          <>
            <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <Link href={`/shop?category=${category.id}`} className="hover:text-[#0D1B35] transition-colors">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[#0D1B35] font-medium truncate">{product.name}</span>
      </nav>

      {/* 2. Main Contiguous Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#0D1B35]/10 shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.7 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <SafeImage
                  src={activeImage}
                  alt={`${product.name} — view ${activeImageIndex + 1}`}
                  fallbackTitle={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </motion.div>
            </AnimatePresence>

            {/* Lightbox Trigger Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Open full-screen image viewer"
              className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border border-[#0D1B35]/10 text-[#0D1B35] hover:text-[#F45A00] inline-flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            >
              <MaximizeIcon className="w-4 h-4" />
            </motion.button>

            {/* Mobile / Swipe Arrow Controls */}
            {images.length > 1 && (
              <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="w-9 h-9 rounded-full bg-white/85 text-[#0D1B35] hover:bg-white inline-flex items-center justify-center shadow-sm pointer-events-auto transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="w-9 h-9 rounded-full bg-white/85 text-[#0D1B35] hover:bg-white inline-flex items-center justify-center shadow-sm pointer-events-auto transition-colors cursor-pointer"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <motion.button
                  key={`${img}-${idx}`}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Select angle ${idx + 1} of ${product.name}`}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#F45A00] ring-2 ring-[#F45A00]/20'
                      : 'border-transparent hover:border-[#0D1B35]/20 opacity-80 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.name} angle ${idx + 1}`}
                    fallbackTitle={product.name}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Order / Enquiry Module */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#0D1B35]/10 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Header & Hierarchy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#F45A00]">
                {category?.name ?? '3D Studio'} · SKU {product.sku}
              </span>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => toggleWishlist(product.id)}
                aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
                aria-pressed={isSaved}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#737373] hover:text-[#F45A00] transition-colors cursor-pointer"
              >
                <motion.div
                  animate={isSaved ? { scale: [1, 1.35, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <HeartIcon
                    className={`w-4 h-4 transition-colors ${isSaved ? 'fill-[#F45A00] text-[#F45A00]' : ''}`}
                    aria-hidden="true"
                  />
                </motion.div>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </motion.button>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B35] leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1 tabular-nums">
              <span className="font-display text-3xl font-bold text-[#0D1B35]">
                {formatAed(effectivePrice)}
              </span>
              {hasSale && (
                <span className="text-base text-[#737373] line-through">
                  {formatAed(product.price)}
                </span>
              )}
              <span className="text-xs text-[#737373]">Indicative price per unit</span>
            </div>

            {/* Verified Availability */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
              <span className="font-medium text-[#0D1B35]">
                {product.isAvailable
                  ? 'Available to order · In-studio batches & custom finishing'
                  : 'Currently in scheduled production'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-2 border-t border-[#0D1B35]/10 text-sm text-[#525252] leading-relaxed">
            {product.description}
          </div>

          {/* Color / Finish Selection */}
          {product.colors.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-[#0D1B35]/10">
              <span className="block text-xs font-semibold text-[#0D1B35]">
                Select Finish / Color: <span className="text-[#963200] font-bold">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const active = selectedColor === color;
                  return (
                    <motion.button
                      key={color}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                        active
                          ? 'border-[#F45A00] bg-[#FCF2EC] text-[#0D1B35] ring-2 ring-[#F45A00]/20'
                          : 'border-[#0D1B35]/15 bg-white text-[#525252] hover:border-[#0D1B35]/40'
                      }`}
                    >
                      {active && <CheckIcon className="w-3.5 h-3.5 text-[#F45A00]" aria-hidden="true" />}
                      <span>{color}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Personalization Input (only when supported) */}
          {product.supportsPersonalization && (
            <div className="space-y-1.5 pt-2 border-t border-[#0D1B35]/10">
              <label htmlFor="product-personalization" className="block text-xs font-semibold text-[#0D1B35]">
                Custom Name / Lettering to Print <span className="text-[#963200] font-normal">(Optional)</span>
              </label>
              <input
                id="product-personalization"
                type="text"
                maxLength={30}
                value={personalizationText}
                onChange={(e) => setPersonalizationText(e.target.value)}
                placeholder="e.g. SARAH (Arabic or English raised relief)"
                className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#525252]/60 focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
              />
              <p className="text-xs text-[#525252]">
                Our studio prints custom lettering directly into the bio-polymer surface.
              </p>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="pt-2 border-t border-[#0D1B35]/10 flex items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-semibold text-[#0D1B35]">Quantity</span>
              <span className="text-xs text-[#525252]">
                Total: <strong className="text-[#0D1B35] font-mono">{formatAed(indicativeTotal)}</strong>
              </span>
            </div>
            <div className="inline-flex items-center rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/50 overflow-hidden">
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-10 inline-flex items-center justify-center text-[#0D1B35] hover:text-[#F45A00] cursor-pointer"
              >
                <MinusIcon className="w-4 h-4" />
              </motion.button>
              <div className="w-10 overflow-hidden text-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={quantity}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 8, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="block text-sm font-bold tabular-nums"
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                aria-label="Increase quantity"
                className="w-10 h-10 inline-flex items-center justify-center text-[#0D1B35] hover:text-[#F45A00] cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <WhatsAppButton
              message={whatsappMsg}
              label={`Enquire via WhatsApp · ${formatAed(indicativeTotal)}`}
              variant="whatsapp"
              className="w-full justify-center"
            />

            <button
              type="button"
              onClick={() => setEnquiryModalState({ product, quantity, color: selectedColor })}
              className="w-full rounded-xl bg-[#0D1B35] hover:bg-[#F45A00] text-white px-5 py-3 text-sm font-semibold press-feedback cursor-pointer shadow-xs"
            >
              Submit Studio Enquiry
            </button>

            <p className="text-xs text-[#525252] text-center leading-relaxed pt-1">
              Order and delivery details are confirmed directly with our Dubai studio team via WhatsApp. No online checkout required.
            </p>
          </div>

          {/* Clean Specifications Table */}
          <div className="space-y-3 pt-4 border-t border-[#0D1B35]/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D1B35]">
              Product Specifications
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl bg-[#FCF2EC]/60 p-3 space-y-0.5">
                <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                  <LayersIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                  Material
                </dt>
                <dd className="font-semibold text-[#0D1B35]">{product.material}</dd>
              </div>

              <div className="rounded-xl bg-[#FCF2EC]/60 p-3 space-y-0.5">
                <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                  <RulerIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                  Dimensions
                </dt>
                <dd className="font-semibold text-[#0D1B35] tabular-nums">{product.dimensions}</dd>
              </div>

              {product.weightGrams && (
                <div className="rounded-xl bg-[#FCF2EC]/60 p-3 space-y-0.5">
                  <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                    <WeightIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                    Weight
                  </dt>
                  <dd className="font-semibold text-[#0D1B35] tabular-nums">{product.weightGrams} grams</dd>
                </div>
              )}

              {product.finish && (
                <div className="rounded-xl bg-[#FCF2EC]/60 p-3 space-y-0.5">
                  <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                    <WrenchIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                    Finish
                  </dt>
                  <dd className="font-semibold text-[#0D1B35]">{product.finish}</dd>
                </div>
              )}

              {product.careInstructions && (
                <div className="sm:col-span-2 rounded-xl bg-[#FCF2EC]/60 p-3 space-y-0.5">
                  <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                    Care Instructions
                  </dt>
                  <dd className="font-medium text-[#0D1B35]">{product.careInstructions}</dd>
                </div>
              )}

              {product.supportsPersonalization && (
                <div className="sm:col-span-2 rounded-xl bg-[#FCE3CB]/50 border border-[#F45A00]/20 p-3 flex items-start gap-2">
                  <SparklesIcon className="w-4 h-4 text-[#F45A00] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#0D1B35] block">Personalization Available</span>
                    <span className="text-[#737373] text-[11px]">
                      Custom Arabic or English raised typography, monograms, or corporate branding can be added.
                    </span>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* 3. Related Creations Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-[#0D1B35]/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0D1B35]">
                Related Creations
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                More designs from our Dubai additive studio
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[#F45A00] hover:underline"
            >
              Browse All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {relatedProducts.map((rel, idx) => (
              <div
                key={rel.id}
                className="stagger-card"
                style={{ '--stagger-index': Math.min(idx, 4) } as React.CSSProperties}
              >
                <ProductCard
                  product={rel}
                  categoryName={categoryMap.get(rel.categoryId) ?? '3D Printed'}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} image viewer`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0D1B35]/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
              <span className="text-xs text-white/70 font-mono">
                {activeImageIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Close image viewer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center"
            >
              <SafeImage
                src={activeImage}
                alt={`${product.name} high-resolution view`}
                fallbackTitle={product.name}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white inline-flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductDetailClient;
