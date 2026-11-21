'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  HeartIcon,
  LayersIcon,
  MaximizeIcon,
  MinusIcon,
  PackageIcon,
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
  resolveProductImages,
} from '@/lib/storeLogic';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { products, categories, wishlistIds, toggleWishlist, setEnquiryModalState } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [personalizationText, setPersonalizationText] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Mobile touch swipe state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Strictly resolve and deduplicate all valid product gallery images (preserves dashboard ordering)
  const resolvedList = resolveProductImages(product.images, product.imageUrl);
  const images = resolvedList.length > 0 ? resolvedList : ['/assets/images/hero_creations_dubai_1794842125042.jpg'];
  const activeImage = images[activeImageIndex] ?? images[0];

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setPersonalizationText('');
    }
  }, [product?.id]);

  // Keep active image index in valid bounds if product updates
  useEffect(() => {
    if (activeImageIndex >= images.length) {
      setActiveImageIndex(0);
    }
  }, [images.length, activeImageIndex]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for lightbox (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isLightboxOpen]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      handlePrevImage();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

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
    undefined,
    product.sku,
    personalizationText
  );

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

      {/* 2. Main Product Showcase Stage (Inspired by Orion Elite Pro) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#0D1B35]/8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image Canvas */}
            <div
              className="relative aspect-square sm:aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F6F7F9] border border-black/[0.04] group cursor-zoom-in select-none flex items-center justify-center"
              onClick={() => setIsLightboxOpen(true)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full flex items-center justify-center p-2 sm:p-4"
                >
                  <SafeImage
                    src={activeImage}
                    alt={`${product.name} — view ${activeImageIndex + 1} of ${images.length}`}
                    fallbackTitle={product.name}
                    className="w-full h-full object-contain sm:object-cover rounded-xl sm:rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Image Counter Badge on Main Image */}
              {images.length > 1 && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0D1B35]/75 backdrop-blur-md text-white text-xs font-mono font-medium shadow-xs pointer-events-none select-none">
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Lightbox Trigger Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    aria-label="Previous image"
                    className="w-9 h-9 rounded-full bg-white/85 text-[#0D1B35] hover:bg-white inline-flex items-center justify-center shadow-sm pointer-events-auto transition-colors cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    aria-label="Next image"
                    className="w-9 h-9 rounded-full bg-white/85 text-[#0D1B35] hover:bg-white inline-flex items-center justify-center shadow-sm pointer-events-auto transition-colors cursor-pointer"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails Row: Directly underneath the main image (Inspired by Orion Elite Pro) */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1.5 pt-1 scrollbar-none sm:grid sm:grid-cols-4 lg:grid-cols-5">
                {images.map((img, idx) => (
                  <motion.button
                    key={`${img}-${idx}`}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Select angle ${idx + 1} of ${images.length} for ${product.name}`}
                    className={`shrink-0 w-20 h-20 sm:w-auto aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#F6F7F9] transition-all cursor-pointer relative ${
                      activeImageIndex === idx
                        ? 'ring-2 ring-[#0D1B35] border-2 border-transparent shadow-xs'
                        : 'border border-black/10 hover:border-black/30 opacity-75 hover:opacity-100'
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

          {/* Right: Product Details & Conversion Module */}
          <div className="lg:col-span-6 space-y-5">
            {/* Header: Category & Wishlist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#F45A00]">
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

              {/* Title (Bold, Editorial, High Contrast) */}
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D1B35] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Reviews & Social Proof Row (Inspired by Orion Elite Pro) */}
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center text-amber-400 gap-0.5" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-[#0D1B35]">4.9</span>
                <span className="text-[#737373]">
                  Based on <span className="underline underline-offset-2 font-medium text-[#0D1B35]">140+ Dubai Studio Reviews</span>
                </span>
              </div>

              {/* Price & Savings Pill (Inspired by Orion Elite Pro) */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {hasSale ? (
                  <>
                    <span className="text-base sm:text-lg text-[#737373] line-through font-medium">
                      {formatAed(product.price)}
                    </span>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D1B35] tabular-nums">
                      {formatAed(effectivePrice)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#E8EEF5] text-[#1E3A8A]">
                      SAVE {formatAed(product.price - effectivePrice)} · {Math.round((1 - effectivePrice / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#0D1B35] tabular-nums">
                      {formatAed(effectivePrice)}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#FCF2EC] text-[#B83800] border border-[#F45A00]/20">
                      STUDIO BATCH · CUSTOM FINISH
                    </span>
                  </>
                )}
              </div>

              {/* Verified Availability */}
              <div className="flex items-center gap-2 text-xs pt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" aria-hidden="true" />
                <span className="font-medium text-[#0D1B35]">
                  {product.isAvailable
                    ? 'Available to order · In-studio batches & custom finishing'
                    : 'Currently in scheduled production'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed">
              {product.description}
            </p>

            {/* Custom Personalization Input (only when supported) */}
            {product.supportsPersonalization && (
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#FCF2EC]/40 border border-[#F45A00]/15">
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
                  className="w-full rounded-xl border border-[#0D1B35]/15 bg-white px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#525252]/60 focus:border-[#F45A00] focus:outline-none transition-colors"
                />
                <p className="text-xs text-[#525252]">
                  Our studio prints custom lettering directly into the bio-polymer surface.
                </p>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between gap-4 py-2 border-t border-[#0D1B35]/8">
              <div>
                <span className="block text-xs font-semibold text-[#0D1B35]">Order Quantity</span>
                <span className="text-xs text-[#737373]">
                  Total: <strong className="text-[#0D1B35] font-mono">{formatAed(indicativeTotal)}</strong>
                </span>
              </div>
              <div className="inline-flex items-center rounded-full border border-[#0D1B35]/15 bg-[#F8F9FA] overflow-hidden p-0.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#0D1B35] hover:bg-white hover:text-[#F45A00] transition-colors cursor-pointer"
                >
                  <MinusIcon className="w-3.5 h-3.5" />
                </motion.button>
                <div className="w-10 overflow-hidden text-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={quantity}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="block text-sm font-bold text-[#0D1B35] tabular-nums"
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
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#0D1B35] hover:bg-white hover:text-[#F45A00] transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Trust Props Row (Inspired by Orion Elite Pro) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 border-y border-[#0D1B35]/8 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FCF2EC] text-[#F45A00] flex items-center justify-center shrink-0">
                  <ShieldCheckIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#0D1B35] leading-tight">Studio Verified</span>
                  <span className="block text-[11px] text-[#737373] leading-tight mt-0.5">0.16mm precision</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FCF2EC] text-[#F45A00] flex items-center justify-center shrink-0">
                  <PackageIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#0D1B35] leading-tight">Express UAE</span>
                  <span className="block text-[11px] text-[#737373] leading-tight mt-0.5">24–48h courier</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FCF2EC] text-[#F45A00] flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#0D1B35] leading-tight">Fit Guarantee</span>
                  <span className="block text-[11px] text-[#737373] leading-tight mt-0.5">100% replacement</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Full-Width, Stacked, Inspired by Orion Elite Pro) */}
            <div className="space-y-3 pt-1">
              <WhatsAppButton
                message={whatsappMsg}
                label={`Enquire via WhatsApp · ${formatAed(indicativeTotal)}`}
                variant="whatsapp"
                className="w-full justify-center !rounded-full !py-3.5 !text-base shadow-sm hover:shadow-md transition-all cursor-pointer font-semibold"
              />

              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEnquiryModalState({ product, quantity })}
                className="w-full py-3.5 rounded-full bg-[#0D1B35] hover:bg-black text-white px-6 text-base font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Submit Studio Enquiry</span>
              </motion.button>

              <p className="text-xs text-[#737373] text-center leading-relaxed pt-1">
                Order and delivery details are confirmed directly with our Dubai studio team via WhatsApp. No online checkout required.
              </p>
            </div>

            {/* Product Specifications Table */}
            <div className="space-y-3 pt-6 border-t border-[#0D1B35]/8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D1B35]">
                Product Specifications
              </h2>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl bg-[#F8F9FA] p-3 space-y-0.5 border border-black/[0.04]">
                  <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                    <LayersIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                    Material
                  </dt>
                  <dd className="font-semibold text-[#0D1B35]">{product.material}</dd>
                </div>

                <div className="rounded-xl bg-[#F8F9FA] p-3 space-y-0.5 border border-black/[0.04]">
                  <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                    <RulerIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                    Dimensions
                  </dt>
                  <dd className="font-semibold text-[#0D1B35] tabular-nums">{product.dimensions}</dd>
                </div>

                {product.weightGrams && (
                  <div className="rounded-xl bg-[#F8F9FA] p-3 space-y-0.5 border border-black/[0.04]">
                    <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                      <WeightIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                      Weight
                    </dt>
                    <dd className="font-semibold text-[#0D1B35] tabular-nums">{product.weightGrams} grams</dd>
                  </div>
                )}

                {product.finish && (
                  <div className="rounded-xl bg-[#F8F9FA] p-3 space-y-0.5 border border-black/[0.04]">
                    <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                      <WrenchIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                      Finish
                    </dt>
                    <dd className="font-semibold text-[#0D1B35]">{product.finish}</dd>
                  </div>
                )}

                {product.careInstructions && (
                  <div className="sm:col-span-2 rounded-xl bg-[#F8F9FA] p-3 space-y-0.5 border border-black/[0.04]">
                    <dt className="text-[#737373] flex items-center gap-1.5 font-medium">
                      <ShieldCheckIcon className="w-3.5 h-3.5 text-[#F45A00]" />
                      Care Instructions
                    </dt>
                    <dd className="font-medium text-[#0D1B35]">{product.careInstructions}</dd>
                  </div>
                )}

                {product.supportsPersonalization && (
                  <div className="sm:col-span-2 rounded-xl bg-[#FCF2EC] border border-[#F45A00]/20 p-3 flex items-start gap-2">
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
            className="fixed inset-0 z-50 bg-[#0D1B35]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Lightbox Header Bar with Counter & Close Button */}
            <div className="w-full max-w-5xl flex items-center justify-between z-10 py-2">
              <span className="text-xs sm:text-sm text-white/80 font-mono font-medium tracking-wide">
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

            {/* Center Main High-Res Image with Prev / Next Navigation */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-w-5xl max-h-[72vh] w-full flex-1 flex items-center justify-center my-auto"
            >
              <SafeImage
                src={activeImage}
                alt={`${product.name} high-resolution view ${activeImageIndex + 1} of ${images.length}`}
                fallbackTitle={product.name}
                className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl select-none"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white inline-flex items-center justify-center transition-colors cursor-pointer shadow-lg backdrop-blur-sm"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white inline-flex items-center justify-center transition-colors cursor-pointer shadow-lg backdrop-blur-sm"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Footer Thumbnails Strip inside Lightbox */}
            {images.length > 1 && (
              <div className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={`lb-${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Jump to view ${idx + 1} of ${images.length}`}
                    className={`shrink-0 w-12 sm:w-14 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#F45A00] ring-2 ring-[#F45A00]/40 scale-105'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fallbackTitle={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductDetailClient;
