'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { EyeIcon, HeartIcon, SparklesIcon } from '@/components/ui/icons';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';
import { formatAed, getEffectivePrice } from '@/lib/storeLogic';
import { SafeImage } from '../ui/SafeImage';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, setQuickViewProduct, setEnquiryModalState, categories } =
    useStore();
  const isSaved = wishlistIds.includes(product.id);
  const effectivePrice = getEffectivePrice(product);
  const hasSale = effectivePrice < product.price;

  const resolvedCategory =
    categoryName ||
    categories.find((c) => c.id === product.categoryId)?.name ||
    '3D Printed';

  const primaryImage =
    product.images?.[0] || product.imageUrl || '/assets/images/hero_creations_dubai_1794842125042.jpg';

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Do not trigger card navigation if an interactive button was clicked
    if (target.closest('button')) {
      return;
    }
    router.push(`/products/${product.slug}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-[#0D1B35]/8 overflow-hidden flex flex-col justify-between card-hover-elevate cursor-pointer focus-within:ring-2 focus-within:ring-[#F45A00]"
    >
      <div className="relative aspect-[4/3] bg-[#FCF2EC] overflow-hidden">
        <Link
          href={`/products/${product.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="w-full h-full block"
        >
          <SafeImage
            src={primaryImage}
            alt={product.name}
            fallbackTitle={product.name}
            className="w-full h-full object-cover transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.025]"
          />
        </Link>

        {/* Action Icons Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            aria-label={isSaved ? `Remove ${product.name} from saved items` : `Save ${product.name} to wishlist`}
            aria-pressed={isSaved}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/95 backdrop-blur-sm border border-[#0D1B35]/10 inline-flex items-center justify-center text-[#0D1B35] hover:text-[#F45A00] shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F45A00]"
          >
            <motion.div
              animate={isSaved ? { scale: [1, 1.4, 1], rotate: [0, -12, 12, 0] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <HeartIcon
                className={`w-4 h-4 transition-colors duration-150 ${isSaved ? 'fill-[#F45A00] text-[#F45A00]' : ''}`}
                aria-hidden="true"
              />
            </motion.div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setQuickViewProduct(product);
            }}
            aria-label={`Quick view specifications for ${product.name}`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/95 backdrop-blur-sm border border-[#0D1B35]/10 inline-flex items-center justify-center text-[#0D1B35] hover:text-[#F45A00] shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F45A00]"
          >
            <EyeIcon className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        </div>

        {/* Legitimate Personalization Badge (only when supported by product data) */}
        {product.supportsPersonalization && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D1B35]/92 backdrop-blur-sm text-[#FCF2EC] px-2.5 py-1 text-xs font-semibold tracking-normal">
              <SparklesIcon className="w-3 h-3 text-[#F45A00]" aria-hidden="true" />
              <span>Personalizable</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#525252]">
            <span className="truncate">{resolvedCategory}</span>
            {product.isBestSeller && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#B83800] whitespace-nowrap">
                  Bestseller
                </span>
              </>
            )}
          </div>

          <h3 className="mt-1 font-display text-base font-semibold text-[#0D1B35] leading-snug line-clamp-1">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-[#F45A00] transition-colors focus-visible:outline-2 focus-visible:outline-[#F45A00]"
            >
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#0D1B35]/8">
          <div className="flex items-baseline gap-1.5 sm:gap-2 tabular-nums">
            <span className="text-sm sm:text-base font-bold text-[#0D1B35]">
              {formatAed(effectivePrice)}
            </span>
            {hasSale && (
              <span className="text-xs text-[#737373] line-through">
                {formatAed(product.price)}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setEnquiryModalState({ product });
            }}
            aria-label={`Enquire about ${product.name}`}
            className="rounded-xl bg-[#0D1B35] hover:bg-[#F45A00] text-white px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F45A00] transition-colors"
          >
            Enquire
          </motion.button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
