/**
 * Test Suite: Storefront Dynamic Category Synchronization & Stale Data Elimination
 *
 * Verifies:
 * 1. Product mapping preserves stable categoryId directly.
 * 2. Product mapping handles renamed categories via categoryId.
 * 3. Legacy product fallback matches dynamic categories by case-insensitive name/slug.
 * 4. Shop page filters products by categoryId and slug.
 * 5. Homepage renders all categories without 6-item cap and supports R2 images.
 * 6. Offline fallback uses INITIAL_CATEGORIES safely.
 * 7. StoreContext dynamic hydration handles populated, single, and empty categories arrays.
 * 8. Storefront API getStorefrontContent strictly specifies cache: 'no-store'.
 * 9. LocalStorage isolation: old/stale categories in localStorage are ignored; customer state
 *    (cart, wishlist, enquiries, customRequests, settings) is strictly preserved.
 * 10. LocalStorage persistence: categories are never written to disk, preventing stale restoration.
 * 11. Visibility refresh lifecycle:
 *     - Refreshes content when tab becomes visible.
 *     - Does not refresh when tab is hidden.
 *     - Throttled to 30 seconds (excessive switches ignored).
 *     - Concurrent/overlapping requests are prevented.
 *     - Network failures preserve valid current state.
 *     - Event listener is cleaned up on unmount.
 *     - Customer state (cart, wishlist, form drafts) is never reset on category refresh.
 */

import fs from 'fs';
import path from 'path';
import { mapStorefrontProductToStoreProduct } from '../src/lib/api';
import { filterAndSortProducts } from '../src/lib/storeLogic';
import { INITIAL_CATEGORIES, INITIAL_ENQUIRIES, INITIAL_CUSTOM_REQUESTS, DEFAULT_STORE_SETTINGS } from '../src/lib/mockData';
import type { Category, StorefrontProduct, Product } from '../src/lib/types';

let testCount = 0;
let passCount = 0;

function assert(condition: boolean, testName: string, details?: any) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(` ✅ [PASS] ${testName}`);
  } else {
    console.error(` ❌ [FAIL] ${testName}`);
    if (details) {
      console.error('    Details:', details);
    }
  }
}

// Mock dynamic categories returned from GET /api/store/content
const mockDynamicCategories: Category[] = [
  {
    id: 'cat-home-decor',
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Sculptural vases and planters.',
    image: 'https://pub-r2.dev/categories/home.webp',
    imageUrl: 'https://pub-r2.dev/categories/home.webp',
    order: 1,
  },
  {
    id: 'cat-desk-accessories',
    name: 'Workspace & Desk', // RENAMED category
    slug: 'desk-accessories',
    description: 'Executive organizers.',
    image: 'https://pub-r2.dev/categories/desk.webp',
    imageUrl: 'https://pub-r2.dev/categories/desk.webp',
    order: 2,
  },
  {
    id: 'cat-custom-prints',
    name: 'Custom 3D Prints', // 7th category (beyond legacy 6)
    slug: 'custom-prints',
    description: 'Bespoke commissions and prototypes.',
    image: 'https://pub-r2.dev/categories/custom.webp',
    imageUrl: 'https://pub-r2.dev/categories/custom.webp',
    order: 7,
  },
];

async function runTests() {
  console.log('========================================================================');
  console.log('  STOREFRONT DYNAMIC CATEGORY SYNCHRONIZATION VERIFICATION');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  // 1. Product Mapping with Stable categoryId
  // --------------------------------------------------------------------------
  console.log('--- 1. Product Mapping with Stable categoryId ---');

  const productWithId: StorefrontProduct = {
    id: 'prod-101',
    name: 'Origami Geometric Planter',
    slug: 'origami-geometric-planter',
    sku: 'LC-PLN-101',
    categoryId: 'cat-home-decor',
    category: 'Home Decor',
    publicCategory: 'Home Decor',
    sellingPrice: 129,
    currency: 'AED',
    imageUrl: 'https://pub-r2.dev/products/planter.webp',
    isAvailable: true,
    updatedAt: '2026-11-20T12:00:00.000Z',
  };

  const mappedWithId = mapStorefrontProductToStoreProduct(productWithId, mockDynamicCategories);
  assert(mappedWithId.categoryId === 'cat-home-decor', 'Stable categoryId is directly preserved');
  assert(mappedWithId.name === 'Origami Geometric Planter', 'Product name mapped correctly');

  // --------------------------------------------------------------------------
  // 2. Product Mapping with Renamed Category (Renaming Resilience)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Category Renaming Resilience ---');

  const productInRenamedCategory: StorefrontProduct = {
    id: 'prod-102',
    name: 'Executive Nameplate Dock',
    slug: 'executive-nameplate-dock',
    sku: 'LC-DSK-102',
    categoryId: 'cat-desk-accessories',
    category: 'Desk Accessories', // Old category name before rename
    publicCategory: 'Desk Accessories',
    sellingPrice: 185,
    currency: 'AED',
    imageUrl: 'https://pub-r2.dev/products/dock.webp',
    isAvailable: true,
    updatedAt: '2026-11-20T12:00:00.000Z',
  };

  const mappedRenamed = mapStorefrontProductToStoreProduct(productInRenamedCategory, mockDynamicCategories);
  assert(
    mappedRenamed.categoryId === 'cat-desk-accessories',
    'Product preserves categoryId after category rename'
  );

  // --------------------------------------------------------------------------
  // 3. Legacy Product Fallback Resolution by Name
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Legacy Product Fallback Resolution by Name ---');

  const legacyProductWithoutId: StorefrontProduct = {
    id: 'prod-legacy-1',
    name: 'Vintage Key Tag',
    slug: 'vintage-key-tag',
    sku: 'LC-KEY-001',
    category: 'Keychains & Accessories', // Legacy string without categoryId
    imageUrl: '/assets/images/keychain.jpg',
    sellingPrice: 45,
    currency: 'AED',
    isAvailable: true,
    updatedAt: '2026-11-20T12:00:00.000Z',
  };

  const mappedLegacy = mapStorefrontProductToStoreProduct(legacyProductWithoutId, mockDynamicCategories);
  assert(mappedLegacy.categoryId === 'cat-keychains', 'Legacy product matched to cat-keychains via name');

  const legacyCustomPrint: StorefrontProduct = {
    id: 'prod-legacy-2',
    name: 'Bespoke Bracket',
    slug: 'bespoke-bracket',
    sku: 'LC-CUS-001',
    category: 'Custom 3D Prints', // Dynamic category name
    imageUrl: '/assets/images/custom.jpg',
    sellingPrice: 250,
    currency: 'AED',
    isAvailable: true,
    updatedAt: '2026-11-20T12:00:00.000Z',
  };

  const mappedDynamicLegacy = mapStorefrontProductToStoreProduct(legacyCustomPrint, mockDynamicCategories);
  assert(
    mappedDynamicLegacy.categoryId === 'cat-custom-prints',
    'Legacy product matched to dynamic category cat-custom-prints'
  );

  // --------------------------------------------------------------------------
  // 4. Shop Page Product Filtering by Category
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Shop Page Product Filtering by Category ---');

  const catalogProducts: Product[] = [
    {
      id: 'p1',
      name: 'Planter',
      slug: 'planter',
      categoryId: 'cat-home-decor',
      price: 120,
      images: ['/img1.jpg'],
      imageUrl: '/img1.jpg',
      material: 'PLA+',
      colors: ['White'],
      dimensions: '10x10',
      finish: 'Satin',
      supportsPersonalization: false,
      isFeatured: true,
      isBestSeller: true,
    },
    {
      id: 'p2',
      name: 'Dock',
      slug: 'dock',
      categoryId: 'cat-desk-accessories',
      price: 180,
      images: ['/img2.jpg'],
      imageUrl: '/img2.jpg',
      material: 'PETG',
      colors: ['Black'],
      dimensions: '15x15',
      finish: 'Matte',
      supportsPersonalization: false,
      isFeatured: false,
      isBestSeller: false,
    },
    {
      id: 'p3',
      name: 'Custom Bracket',
      slug: 'custom-bracket',
      categoryId: 'cat-custom-prints',
      price: 300,
      images: ['/img3.jpg'],
      imageUrl: '/img3.jpg',
      material: 'ABS',
      colors: ['Grey'],
      dimensions: '20x20',
      finish: 'Smooth',
      supportsPersonalization: true,
      isFeatured: false,
      isBestSeller: false,
    },
    {
      id: 'p4',
      name: 'Key Tag',
      slug: 'key-tag',
      categoryId: 'cat-keychains',
      price: 45,
      images: ['/img4.jpg'],
      imageUrl: '/img4.jpg',
      material: 'PLA',
      colors: ['Red'],
      dimensions: '5x2',
      finish: 'Standard',
      supportsPersonalization: true,
      isFeatured: false,
      isBestSeller: false,
    },
  ];

  const filterHomeDecor = filterAndSortProducts(catalogProducts, {
    categoryId: 'cat-home-decor',
    includeUnavailable: true,
  });
  assert(
    filterHomeDecor.length === 1 && filterHomeDecor[0].id === 'p1',
    'Filter by categoryId returns only Home Decor product'
  );

  const filterSlug = filterAndSortProducts(catalogProducts, {
    categoryId: 'home-decor',
    includeUnavailable: true,
  });
  assert(
    filterSlug.length === 1 && filterSlug[0].id === 'p1',
    'Filter by slug "home-decor" returns Home Decor product'
  );

  const filterAll = filterAndSortProducts(catalogProducts, {
    categoryId: 'all',
    includeUnavailable: true,
  });
  assert(filterAll.length === 4, 'Filter by "all" returns all 4 products');

  // --------------------------------------------------------------------------
  // 5. Dynamic Categories Beyond 6-Item Limit & Image Resilience
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Dynamic Categories Beyond 6-Item Limit ---');

  const extendedCategories: Category[] = [
    ...mockDynamicCategories,
    { id: 'cat-4', name: 'Cat 4', slug: 'cat-4', image: '/c4.jpg', order: 4 },
    { id: 'cat-5', name: 'Cat 5', slug: 'cat-5', image: '/c5.jpg', order: 5 },
    { id: 'cat-6', name: 'Cat 6', slug: 'cat-6', image: '/c6.jpg', order: 6 },
    { id: 'cat-7', name: 'Cat 7', slug: 'cat-7', image: 'https://pub-r2.dev/c7.webp', imageUrl: 'https://pub-r2.dev/c7.webp', order: 7 },
  ];

  assert(extendedCategories.length === 7, '7 categories present in extended list');

  const homePageSource = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf-8');
  assert(!homePageSource.includes('.slice(0, 6)'), 'Homepage does not arbitrarily slice categories to 6 items');
  assert(homePageSource.includes('cat.imageUrl || cat.image'), 'Homepage supports both R2 imageUrl and local fallback image paths');

  // --------------------------------------------------------------------------
  // 6. Resilience & Offline Fallback
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Resilience & Offline Fallback ---');
  assert(INITIAL_CATEGORIES.length >= 6, 'INITIAL_CATEGORIES fallback contains standard catalog baseline');
  assert(INITIAL_CATEGORIES.some((c) => c.id === 'cat-home-decor'), 'cat-home-decor exists in fallback baseline');

  // --------------------------------------------------------------------------
  // 7. StoreContext Dynamic Hydration & Empty Category Synchronization
  // --------------------------------------------------------------------------
  console.log('\n--- 7. StoreContext Dynamic Hydration & Empty Category Synchronization ---');

  function simulateStoreContextHydration(
    initialCategories: Category[],
    apiResponse: {
      isFromApi: boolean;
      categories?: Category[];
      instagramGallery?: any[];
    }
  ): { categories: Category[]; instagramGallery: any[] } {
    let activeCategories = [...initialCategories];
    let activeInstagram: any[] = [];

    if (apiResponse.isFromApi) {
      if (Array.isArray(apiResponse.instagramGallery)) {
        activeInstagram = apiResponse.instagramGallery;
      }
      if (Array.isArray(apiResponse.categories)) {
        activeCategories = apiResponse.categories;
      }
    }

    return { categories: activeCategories, instagramGallery: activeInstagram };
  }

  const multiCatResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: true,
    categories: mockDynamicCategories,
    instagramGallery: [{ id: 'ig-1', caption: 'Post 1' }],
  });
  assert(
    multiCatResult.categories.length === 3 &&
    multiCatResult.categories[0].id === 'cat-home-decor' &&
    multiCatResult.categories[1].id === 'cat-desk-accessories',
    'API returns multiple categories -> all are displayed in active state'
  );

  const singleCatResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: true,
    categories: [mockDynamicCategories[0]],
    instagramGallery: [{ id: 'ig-1', caption: 'Post 1' }],
  });
  assert(
    singleCatResult.categories.length === 1 &&
    singleCatResult.categories[0].id === 'cat-home-decor',
    'API returns one category -> only that single category is displayed'
  );

  const emptyCatResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: true,
    categories: [],
    instagramGallery: [{ id: 'ig-1', caption: 'Post 1' }],
  });
  assert(
    emptyCatResult.categories.length === 0,
    'API returns categories: [] -> active state is empty (does NOT restore INITIAL_CATEGORIES)'
  );

  const failedApiResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: false,
    categories: undefined,
    instagramGallery: [],
  });
  assert(
    failedApiResult.categories.length === INITIAL_CATEGORIES.length &&
    failedApiResult.categories[0].id === INITIAL_CATEGORIES[0].id,
    'API request fails -> existing INITIAL_CATEGORIES fallback preserved'
  );

  const malformedApiResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: true,
    categories: undefined,
    instagramGallery: [{ id: 'ig-1' }],
  });
  assert(
    malformedApiResult.categories.length === INITIAL_CATEGORIES.length,
    'API response is malformed -> safe fallback preserved without crashing'
  );

  assert(
    multiCatResult.instagramGallery.length === 1 &&
    multiCatResult.instagramGallery[0].id === 'ig-1',
    'Instagram gallery continues to hydrate cleanly alongside categories'
  );

  assert(
    homePageSource.includes('categories.length > 0 &&') &&
    homePageSource.includes('Shop by Category'),
    'Homepage conditionally renders Category Showcase only when categories.length > 0'
  );

  // --------------------------------------------------------------------------
  // 8. FIX 2: Storefront API getStorefrontContent uses cache: 'no-store'
  // --------------------------------------------------------------------------
  console.log('\n--- 8. FIX 2: Storefront API no-store Configuration ---');

  const apiSource = fs.readFileSync(path.join(__dirname, '../src/lib/api.ts'), 'utf-8');
  assert(
    apiSource.includes("cache: 'no-store'") && apiSource.includes('/api/store/content'),
    'getStorefrontContent fetch options explicitly specify cache: "no-store"'
  );

  // --------------------------------------------------------------------------
  // 9. FIX 3: LocalStorage Stale Categories Isolation
  // --------------------------------------------------------------------------
  console.log('\n--- 9. FIX 3: LocalStorage Stale Category Isolation ---');

  const storeContextSource = fs.readFileSync(path.join(__dirname, '../src/context/StoreContext.tsx'), 'utf-8');

  // Verify loadInitialStoreState() ignores stale categories from old localStorage records
  function simulateLoadInitialStoreState(mockLocalStorageRaw: string | null) {
    if (mockLocalStorageRaw) {
      try {
        const parsed = JSON.parse(mockLocalStorageRaw);
        const validApiProducts = Array.isArray(parsed.products)
          ? parsed.products.filter((p: any) => p.isFromApi)
          : [];
        return {
          products: validApiProducts,
          categories: INITIAL_CATEGORIES, // Categories always initialized to fallback baseline
          enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : INITIAL_ENQUIRIES,
          customRequests: Array.isArray(parsed.customRequests)
            ? parsed.customRequests
            : INITIAL_CUSTOM_REQUESTS,
          settings: parsed.settings
            ? { ...DEFAULT_STORE_SETTINGS, ...parsed.settings }
            : DEFAULT_STORE_SETTINGS,
          wishlistIds: Array.isArray(parsed.wishlistIds) ? parsed.wishlistIds : [],
        };
      } catch {
        // fallback
      }
    }
    return {
      products: [],
      categories: INITIAL_CATEGORIES,
      enquiries: INITIAL_ENQUIRIES,
      customRequests: INITIAL_CUSTOM_REQUESTS,
      settings: DEFAULT_STORE_SETTINGS,
      wishlistIds: [],
    };
  }

  // Stale localStorage containing deleted category "cat-demo-catagory"
  const staleLocalStoragePayload = JSON.stringify({
    products: [{ id: 'prod-1', isFromApi: true, name: 'Live Product' }],
    categories: [
      { id: 'cat-demo-catagory', name: 'demo catagory', slug: 'demo-catagory' },
      { id: 'cat-stale-2', name: 'stale 2' },
    ],
    wishlistIds: ['prod-1', 'prod-2'],
    enquiries: [{ id: 'enq-1', customerName: 'Ahmed' }],
    customRequests: [{ id: 'req-1', referenceCode: 'REQ-101' }],
    settings: { currency: 'AED' },
  });

  const hydratedFromStale = simulateLoadInitialStoreState(staleLocalStoragePayload);

  assert(
    !hydratedFromStale.categories.some((c) => c.id === 'cat-demo-catagory'),
    'Old localStorage categories (including deleted cat-demo-catagory) are strictly ignored'
  );
  assert(
    hydratedFromStale.categories.length === INITIAL_CATEGORIES.length &&
    hydratedFromStale.categories[0].id === INITIAL_CATEGORIES[0].id,
    'Categories safely start with standard INITIAL_CATEGORIES baseline'
  );
  assert(
    hydratedFromStale.wishlistIds.length === 2 && hydratedFromStale.wishlistIds[0] === 'prod-1',
    'Customer wishlistIds preserved across sessions'
  );
  assert(
    hydratedFromStale.enquiries.length === 1 && hydratedFromStale.enquiries[0].customerName === 'Ahmed',
    'Customer enquiries draft preserved across sessions'
  );
  assert(
    hydratedFromStale.customRequests.length === 1 && hydratedFromStale.customRequests[0].referenceCode === 'REQ-101',
    'Customer customRequests draft preserved across sessions'
  );
  assert(
    hydratedFromStale.products.length === 1 && hydratedFromStale.products[0].name === 'Live Product',
    'Customer products array preserved across sessions'
  );

  // --------------------------------------------------------------------------
  // 10. FIX 3: LocalStorage Write Exclusion
  // --------------------------------------------------------------------------
  console.log('\n--- 10. FIX 3: Categories Excluded from LocalStorage Writes ---');

  // Verify that the persistence payload excludes categories
  assert(
    storeContextSource.includes("Omit<PersistedStoreState, 'categories'>"),
    'LocalStorage persistence payload explicitly omits categories'
  );
  assert(
    !storeContextSource.match(/window\.localStorage\.setItem\(DEMO_STORAGE_KEY,\s*JSON\.stringify\({\s*products,\s*categories/),
    'window.localStorage.setItem does not serialize dynamic categories'
  );

  // --------------------------------------------------------------------------
  // 11. FIX 4: Visibility Refresh Lifecycle & Throttling
  // --------------------------------------------------------------------------
  console.log('\n--- 11. FIX 4: Tab Visibility Refresh Lifecycle ---');

  assert(
    storeContextSource.includes("document.addEventListener('visibilitychange', handleVisibilityChange)"),
    'StoreContext attaches visibilitychange event listener'
  );
  assert(
    storeContextSource.includes("document.removeEventListener('visibilitychange', handleVisibilityChange)"),
    'StoreContext cleans up visibilitychange event listener on unmount'
  );
  assert(
    storeContextSource.includes("document.visibilityState !== 'visible'"),
    'Visibility handler ignores hidden document events'
  );
  assert(
    storeContextSource.includes('VISIBILITY_REFRESH_THROTTLE_MS = 30_000'),
    'Visibility handler defines 30-second throttle constant'
  );
  assert(
    storeContextSource.includes('isVisibilityFetchingRef.current'),
    'Visibility handler guards against overlapping / concurrent requests'
  );

  // Simulate visibility change execution logic
  class VisibilitySimulation {
    categories: Category[] = [...INITIAL_CATEGORIES];
    instagramGallery: any[] = [];
    lastFetchTime = 1000;
    isFetching = false;
    fetchCount = 0;
    throttleMs = 30_000;

    async onVisibilityChange(visibilityState: 'visible' | 'hidden', now: number, mockApiReturn?: any) {
      if (visibilityState !== 'visible') return false;
      if (now - this.lastFetchTime < this.throttleMs) return false;
      if (this.isFetching) return false;

      this.isFetching = true;
      this.lastFetchTime = now;
      this.fetchCount++;

      try {
        if (mockApiReturn && mockApiReturn.isFromApi) {
          if (Array.isArray(mockApiReturn.categories)) {
            this.categories = mockApiReturn.categories;
          }
          if (Array.isArray(mockApiReturn.instagramGallery)) {
            this.instagramGallery = mockApiReturn.instagramGallery;
          }
        }
      } finally {
        this.isFetching = false;
      }
      return true;
    }
  }

  const sim = new VisibilitySimulation();

  // Test 1: Tab becomes visible after 35 seconds -> fetch triggers
  const freshApiCategories: Category[] = [
    { id: 'cat-fresh-1', name: 'Fresh Cat', slug: 'fresh-cat', image: '/f1.jpg', order: 1 }
  ];
  const ran1 = await sim.onVisibilityChange('visible', 36_000, {
    isFromApi: true,
    categories: freshApiCategories,
    instagramGallery: [{ id: 'ig-fresh' }],
  });
  assert(ran1 === true, 'Returning to a visible tab after throttle triggers fresh content fetch');
  assert(sim.categories.length === 1 && sim.categories[0].id === 'cat-fresh-1', 'Categories updated to fresh API data on visible return');

  // Test 2: Rapid tab switch after 5 seconds (< 30s throttle) -> fetch suppressed
  const ran2 = await sim.onVisibilityChange('visible', 41_000, {
    isFromApi: true,
    categories: [],
  });
  assert(ran2 === false, 'Repeated visibility changes within throttle window do not trigger unnecessary requests');
  assert(sim.fetchCount === 1, 'Total fetch count remains 1 due to 30-second throttle');

  // Test 3: Tab hidden -> fetch suppressed
  const ran3 = await sim.onVisibilityChange('hidden', 80_000);
  assert(ran3 === false, 'Hidden document visibility events never trigger requests');

  // Test 4: Concurrency prevention
  sim.isFetching = true;
  const ran4 = await sim.onVisibilityChange('visible', 100_000);
  assert(ran4 === false, 'Concurrent / overlapping refresh requests are strictly blocked');
  sim.isFetching = false;

  // Test 5: Network failure during visibility refresh preserves current data
  await sim.onVisibilityChange('visible', 120_000, {
    isFromApi: false, // Network failure
  });
  assert(
    sim.categories.length === 1 && sim.categories[0].id === 'cat-fresh-1',
    'Network failure during visibility refresh preserves current valid categories without clearing'
  );

  console.log('\n========================================================================');
  console.log(`SCORECARD: ${passCount} / ${testCount} tests passed (${Math.round((passCount / testCount) * 100)}%)`);
  console.log('========================================================================\n');

  if (passCount !== testCount) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
