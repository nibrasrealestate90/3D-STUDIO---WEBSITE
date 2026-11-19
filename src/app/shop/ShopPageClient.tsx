'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronRightIcon,
  CloseIcon,
  RotateLeftIcon,
  SearchIcon,
  SlidersIcon,
} from '@/components/ui/icons';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';
import type { SortOption } from '@/lib/types';
import { filterAndSortProducts, formatAed } from '@/lib/storeLogic';

export function ShopPageClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const { products, categories, isCatalogLoading, isCatalogUnavailable } = useStore();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategoryId(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = filterAndSortProducts(products, {
    search: searchQuery,
    categoryId: selectedCategoryId,
    maxPrice: maxPrice > 0 ? maxPrice : undefined,
    sortBy,
    includeUnavailable: false,
  });

  const activeCategoryName =
    selectedCategoryId === 'all'
      ? 'All Creations'
      : categoryMap.get(selectedCategoryId) ||
        categories.find((c) => c.slug === selectedCategoryId)?.name ||
        'Catalogue';

  const hasActiveFilters =
    selectedCategoryId !== 'all' || searchQuery.trim().length > 0 || maxPrice > 0;

  const handleResetFilters = () => {
    setSelectedCategoryId('all');
    setSearchQuery('');
    setMaxPrice(0);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-20 space-y-6 sm:space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#737373]">
        <Link href="/" className="hover:text-[#0D1B35] transition-colors">
          Home
        </Link>
        <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[#0D1B35] font-medium">Shop</span>
        {selectedCategoryId !== 'all' && (
          <>
            <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-[#F45A00] font-medium">{activeCategoryName}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#0D1B35]/10 pb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B35]">
            Explore Our Creations
          </h1>
          <p className="text-sm sm:text-base text-[#737373] mt-2 max-w-2xl">
            Browse ready-to-customize 3D printed home decor, gifts, and desk pieces crafted in
            Dubai. All prices listed in AED.
          </p>
        </div>
        <p className="text-sm font-medium text-[#0D1B35] tabular-nums shrink-0">
          Showing {filteredProducts.length} of {products.length} {products.length === 1 ? 'creation' : 'creations'}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#0D1B35]/10 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          <div className="md:col-span-5 relative">
            <SearchIcon
              className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, material, or SKU..."
              className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 pl-10 pr-4 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersIcon className="w-4 h-4 text-[#737373] shrink-0" aria-hidden="true" />
            <label htmlFor="shop-price-filter" className="sr-only">
              Filter by maximum price
            </label>
            <select
              id="shop-price-filter"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors cursor-pointer"
            >
              <option value={0}>All Price Ranges</option>
              <option value={50}>Up to {formatAed(50)}</option>
              <option value={100}>Up to {formatAed(100)}</option>
              <option value={150}>Up to {formatAed(150)}</option>
              <option value={250}>Up to {formatAed(250)}</option>
              <option value={500}>Up to {formatAed(500)}</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="shop-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 pt-1 border-t border-[#0D1B35]/8 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className="relative px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-150"
          >
            {selectedCategoryId === 'all' && (
              <motion.div
                layoutId="activeCategoryPill"
                className="absolute inset-0 bg-[#0D1B35] rounded-xl shadow-xs"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-150 ${
                selectedCategoryId === 'all' ? 'text-white' : 'text-[#0D1B35] hover:text-[#F45A00]'
              }`}
            >
              All Categories
            </span>
          </button>
          {categories.map((cat) => {
            const isCatActive =
              selectedCategoryId === cat.id ||
              selectedCategoryId === cat.slug ||
              selectedCategoryId.replace(/^cat-/, '') === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className="relative px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-150"
              >
                {isCatActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-[#F45A00] rounded-xl shadow-xs"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors duration-150 ${
                    isCatActive ? 'text-white' : 'text-[#0D1B35] hover:text-[#F45A00]'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filter Badges */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#0D1B35]/8 text-xs overflow-hidden"
            >
              <span className="text-[#737373] font-medium">Active filters:</span>

              {selectedCategoryId !== 'all' && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCF2EC] border border-[#0D1B35]/15 px-2.5 py-1 text-[#0D1B35] font-medium">
                  <span>Category: {activeCategoryName}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('all')}
                    aria-label="Remove category filter"
                    className="hover:text-[#F45A00] cursor-pointer"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery.trim().length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCF2EC] border border-[#0D1B35]/15 px-2.5 py-1 text-[#0D1B35] font-medium">
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search filter"
                    className="hover:text-[#F45A00] cursor-pointer"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {maxPrice > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCF2EC] border border-[#0D1B35]/15 px-2.5 py-1 text-[#0D1B35] font-medium">
                  <span>Price: Up to {formatAed(maxPrice)}</span>
                  <button
                    type="button"
                    onClick={() => setMaxPrice(0)}
                    aria-label="Remove price filter"
                    className="hover:text-[#F45A00] cursor-pointer"
                  >
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[#F45A00] hover:underline font-semibold ml-auto cursor-pointer"
              >
                <RotateLeftIcon className="w-3 h-3" />
                <span>Clear All Filters</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Grid or Empty State */}
      <h2 className="sr-only">Studio Catalogue Creations</h2>
      {isCatalogLoading ? (
        <div className="rounded-2xl bg-white border border-[#0D1B35]/10 p-12 text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F45A00] border-r-transparent align-[-0.125em]" />
          <p className="text-sm font-medium text-[#737373]">Loading studio catalogue...</p>
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-[#0D1B35]/10 p-10 sm:p-14 text-center space-y-4 shadow-sm"
        >
          <p className="font-display text-xl sm:text-2xl font-bold text-[#0D1B35]">
            {isCatalogUnavailable ? 'Catalogue Temporarily Unavailable' : 'Catalogue Releasing Soon'}
          </p>
          <p className="text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
            {isCatalogUnavailable
              ? 'Our online catalogue is temporarily undergoing scheduled maintenance. If you require custom 3D printing or prototypes, you can submit a custom print request directly.'
              : 'Our studio is preparing our new batch of commercial creations. You can submit custom 3D print requests with your CAD files or project description.'}
          </p>
          <div className="pt-2">
            <Link
              href="/custom-print"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F45A00] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#D94E00] transition-colors"
            >
              <span>Request Custom 3D Print</span>
            </Link>
          </div>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-[#0D1B35]/10 p-10 sm:p-14 text-center space-y-4 shadow-sm"
        >
          <p className="font-display text-xl sm:text-2xl font-bold text-[#0D1B35]">
            No creations matched your criteria
          </p>
          <p className="text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
            Try resetting your search query or selecting a different category. If you have a specific bespoke design in mind, our Dubai studio can fabricate it custom.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D1B35] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#F45A00] transition-colors cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" aria-hidden="true" />
              <span>Clear All Filters</span>
            </button>
            <Link
              href="/custom-print"
              className="rounded-xl border border-[#0D1B35]/20 bg-[#FCF2EC]/60 px-5 py-2.5 text-sm font-semibold text-[#0D1B35] hover:border-[#F45A00] transition-colors"
            >
              Request Custom 3D Print
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                <ProductCard
                  product={product}
                  categoryName={categoryMap.get(product.categoryId) ?? '3D Printed'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default ShopPageClient;
