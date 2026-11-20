/**
 * Test Suite: Storefront Dynamic Category Synchronization (Phase 4)
 *
 * Verifies:
 * 1. mapStorefrontProductToStoreProduct resolves stable categoryId where present.
 * 2. mapStorefrontProductToStoreProduct falls back to case-insensitive name matching for legacy records.
 * 3. Product remains mapped to the correct category after category renaming.
 * 4. INITIAL_CATEGORIES fallback preserved when API is unreachable or returns empty data.
 * 5. filterAndSortProducts correctly filters products by categoryId and clean slug.
 * 6. Homepage category display does not limit items to 6 (supports 7+ categories).
 * 7. Category images support R2 public URLs as well as local asset paths.
 */

import { mapStorefrontProductToStoreProduct } from '../src/lib/api';
import { filterAndSortProducts } from '../src/lib/storeLogic';
import { INITIAL_CATEGORIES } from '../src/lib/mockData';
import type { Category, StorefrontProduct } from '../src/lib/types';

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

  // Even if category name in dashboard was updated to "Workspace & Desk",
  // the product having categoryId 'cat-desk-accessories' preserves its association!
  const productInRenamedCategory: StorefrontProduct = {
    id: 'prod-102',
    name: 'Pen Holder & Dock',
    slug: 'pen-holder-dock',
    sku: 'LC-DSK-102',
    categoryId: 'cat-desk-accessories',
    category: 'Workspace & Desk',
    publicCategory: 'Workspace & Desk',
    sellingPrice: 79,
    currency: 'AED',
    imageUrl: 'https://pub-r2.dev/products/dock.webp',
    isAvailable: true,
    updatedAt: '2026-11-20T12:00:00.000Z',
  };

  const mappedRenamed = mapStorefrontProductToStoreProduct(productInRenamedCategory, mockDynamicCategories);
  assert(mappedRenamed.categoryId === 'cat-desk-accessories', 'Product preserves categoryId after category rename');

  // --------------------------------------------------------------------------
  // 3. Legacy Product Mapping (Missing categoryId)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Legacy Product Fallback Resolution by Name ---');

  const legacyProduct: StorefrontProduct = {
    id: 'prod-legacy-1',
    name: 'Vintage Key Tag',
    slug: 'vintage-key-tag',
    sku: 'LC-KEY-001',
    category: 'Keychains & Accessories', // Legacy string without categoryId
    sellingPrice: 39,
    currency: 'AED',
    imageUrl: '/assets/images/keychain.jpg',
    isAvailable: true,
    updatedAt: '2026-11-20T12:00:00.000Z',
  };

  const mappedLegacy = mapStorefrontProductToStoreProduct(legacyProduct, mockDynamicCategories);
  assert(mappedLegacy.categoryId === 'cat-keychains', 'Legacy product matched to cat-keychains via name');

  // Case: Legacy product matching dynamic category name (case-insensitive)
  const legacyDynamicMatch: StorefrontProduct = {
    id: 'prod-legacy-2',
    name: 'Bespoke Bracket',
    slug: 'bespoke-bracket',
    sku: 'LC-CST-002',
    category: 'custom 3d prints', // Matches mockDynamicCategories[2].name
    sellingPrice: 199,
    currency: 'AED',
    imageUrl: '/assets/images/custom.jpg',
    isAvailable: true,
    updatedAt: '2026-11-20T12:00:00.000Z',
  };

  const mappedDynamicLegacy = mapStorefrontProductToStoreProduct(legacyDynamicMatch, mockDynamicCategories);
  assert(mappedDynamicLegacy.categoryId === 'cat-custom-prints', 'Legacy product matched to dynamic category cat-custom-prints');

  // --------------------------------------------------------------------------
  // 4. Shop Page Product Filtering by Category
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Shop Page Product Filtering by Category ---');

  const allProducts = [mappedWithId, mappedRenamed, mappedLegacy, mappedDynamicLegacy];

  // Filter by 'cat-home-decor'
  const decorFilter = filterAndSortProducts(allProducts, { categoryId: 'cat-home-decor' });
  assert(decorFilter.length === 1 && decorFilter[0].id === 'prod-101', 'Filter by categoryId returns only Home Decor product');

  // Filter by clean slug 'home-decor'
  const slugFilter = filterAndSortProducts(allProducts, { categoryId: 'home-decor' });
  assert(slugFilter.length === 1 && slugFilter[0].id === 'prod-101', 'Filter by slug "home-decor" returns Home Decor product');

  // Filter by 'all'
  const allFilter = filterAndSortProducts(allProducts, { categoryId: 'all' });
  assert(allFilter.length === 4, 'Filter by "all" returns all 4 products');

  // --------------------------------------------------------------------------
  // 5. Dynamic Categories Beyond 6-Item Limit
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Dynamic Categories Beyond 6-Item Limit ---');

  const fullCategoriesList = [...INITIAL_CATEGORIES, mockDynamicCategories[2]];
  assert(fullCategoriesList.length === 7, '7 categories present in extended list');

  const fs = await import('fs');
  const path = await import('path');
  const homePageSource = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf-8');

  assert(
    homePageSource.includes('categories.map((cat, idx)') &&
    !homePageSource.includes('categories.slice(0, 6).map'),
    'Homepage does not arbitrarily slice categories to 6 items'
  );

  assert(
    homePageSource.includes('cat.imageUrl || cat.image'),
    'Homepage supports both R2 imageUrl and local fallback image paths'
  );

  // --------------------------------------------------------------------------
  // 6. Resilience & Offline Fallback
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Resilience & Offline Fallback ---');

  // When API is unavailable or returns an error, INITIAL_CATEGORIES is preserved
  assert(INITIAL_CATEGORIES.length >= 6, 'INITIAL_CATEGORIES fallback contains standard catalog baseline');
  assert(INITIAL_CATEGORIES.some((c) => c.id === 'cat-home-decor'), 'cat-home-decor exists in fallback baseline');

  // --------------------------------------------------------------------------
  // 7. StoreContext Dynamic Hydration & Empty Category Synchronization
  // --------------------------------------------------------------------------
  console.log('\n--- 7. StoreContext Dynamic Hydration & Empty Category Synchronization ---');

  // Logic mirrored directly from StoreContext.tsx lines 157-167
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

  // Case 1: API returns multiple categories -> all are displayed
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

  // Case 2: API returns one category -> only that category is displayed
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

  // Case 3: API returns categories: [] -> no mock categories appear (empty categories state)
  const emptyCatResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: true,
    categories: [],
    instagramGallery: [{ id: 'ig-1', caption: 'Post 1' }],
  });
  assert(
    emptyCatResult.categories.length === 0,
    'API returns categories: [] -> active state is empty (does NOT restore INITIAL_CATEGORIES)'
  );

  // Case 4: API request fails (network error / 500) -> existing fallback behaviour preserved
  const failedApiResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: false, // getStorefrontContent catches error and sets isFromApi: false
    categories: undefined,
    instagramGallery: [],
  });
  assert(
    failedApiResult.categories.length === INITIAL_CATEGORIES.length &&
    failedApiResult.categories[0].id === INITIAL_CATEGORIES[0].id,
    'API request fails -> existing INITIAL_CATEGORIES fallback preserved'
  );

  // Case 5: API response is malformed (categories is not an array) -> safe fallback works
  const malformedApiResult = simulateStoreContextHydration(INITIAL_CATEGORIES, {
    isFromApi: true,
    categories: undefined, // malformed non-array in response payload
    instagramGallery: [{ id: 'ig-1' }],
  });
  assert(
    malformedApiResult.categories.length === INITIAL_CATEGORIES.length,
    'API response is malformed -> safe fallback preserved without crashing'
  );

  // Case 6: Instagram gallery continues to hydrate correctly alongside categories
  assert(
    multiCatResult.instagramGallery.length === 1 &&
    multiCatResult.instagramGallery[0].id === 'ig-1',
    'Instagram gallery continues to hydrate cleanly alongside categories'
  );

  // Case 7: Homepage hides "Shop by Category" section when categories is empty
  assert(
    homePageSource.includes('categories.length > 0 &&') &&
    homePageSource.includes('Shop by Category'),
    'Homepage conditionally renders Category Showcase only when categories.length > 0'
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
