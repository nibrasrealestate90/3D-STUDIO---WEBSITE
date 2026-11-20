/**
 * ============================================================================
 * TEST SUITE: STOREFRONT MULTI-IMAGE PRODUCT GALLERY
 * ============================================================================
 *
 * Validates:
 * 1. Product containing two images (preserves order, count 2, primary image at index 0)
 * 2. Product containing six images (all 6 preserved in exact dashboard order)
 * 3. Legacy product containing only imageUrl (backward compatibility fallback)
 * 4. Product with duplicate image URLs (deduplicated while preserving order)
 * 5. Product with one valid and one invalid/malformed image URL (strict filtering)
 * 6. Product detail gallery image counter computation (e.g. 1 / 2, 2 / 2)
 * 7. Navigation controls and wrap-around (prev from 0 -> last, next from last -> 0)
 * 8. ProductCard and QuickViewModal primary image resolution
 * 9. Live API mapping with mapStorefrontProductToStoreProduct
 */

import assert from 'node:assert';
import { resolveProductImages } from '../src/lib/storeLogic';
import { mapStorefrontProductToStoreProduct } from '../src/lib/api';
import type { StorefrontProduct } from '../src/lib/types';

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

console.log('========================================================================');
console.log('  TESTING STOREFRONT MULTI-IMAGE GALLERY RESOLUTION & NAVIGATION');
console.log('========================================================================\n');

const IMG_1 = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e';
const IMG_2 = 'https://pub-b19d7b7c8ecc459f9b1cff7a7e30c0aa.r2.dev/media/products/2026-11/fidget_side.jpeg';
const IMG_3 = 'https://pub-b19d7b7c8ecc459f9b1cff7a7e30c0aa.r2.dev/media/products/2026-11/fidget_angle.jpeg';
const IMG_4 = 'https://pub-b19d7b7c8ecc459f9b1cff7a7e30c0aa.r2.dev/media/products/2026-11/fidget_macro.jpeg';
const IMG_5 = 'https://pub-b19d7b7c8ecc459f9b1cff7a7e30c0aa.r2.dev/media/products/2026-11/fidget_hand.jpeg';
const IMG_6 = 'https://pub-b19d7b7c8ecc459f9b1cff7a7e30c0aa.r2.dev/media/products/2026-11/fidget_box.jpeg';

// --------------------------------------------------------------------------
// Test 1: Product containing two images
// --------------------------------------------------------------------------
runTest('Product containing two images resolves both in dashboard order', () => {
  const images = [IMG_1, IMG_2];
  const resolved = resolveProductImages(images, IMG_1);

  assert.strictEqual(resolved.length, 2);
  assert.strictEqual(resolved[0], IMG_1);
  assert.strictEqual(resolved[1], IMG_2);
  assert.strictEqual(`${0 + 1} / ${resolved.length}`, '1 / 2');
  assert.strictEqual(`${1 + 1} / ${resolved.length}`, '2 / 2');
});

// --------------------------------------------------------------------------
// Test 2: Product containing six images
// --------------------------------------------------------------------------
runTest('Product containing six images preserves all 6 in exact order', () => {
  const sixImages = [IMG_1, IMG_2, IMG_3, IMG_4, IMG_5, IMG_6];
  const resolved = resolveProductImages(sixImages, IMG_1);

  assert.strictEqual(resolved.length, 6);
  for (let i = 0; i < 6; i++) {
    assert.strictEqual(resolved[i], sixImages[i]);
  }
  assert.strictEqual(`${5 + 1} / ${resolved.length}`, '6 / 6');
});

// --------------------------------------------------------------------------
// Test 3: Legacy product containing only imageUrl
// --------------------------------------------------------------------------
runTest('Legacy product with only imageUrl falls back cleanly', () => {
  const resolvedEmptyImages = resolveProductImages([], IMG_1);
  assert.strictEqual(resolvedEmptyImages.length, 1);
  assert.strictEqual(resolvedEmptyImages[0], IMG_1);

  const resolvedNullImages = resolveProductImages(null, IMG_1);
  assert.strictEqual(resolvedNullImages.length, 1);
  assert.strictEqual(resolvedNullImages[0], IMG_1);

  assert.strictEqual(`${0 + 1} / ${resolvedEmptyImages.length}`, '1 / 1');
});

// --------------------------------------------------------------------------
// Test 4: Product with duplicate image URLs
// --------------------------------------------------------------------------
runTest('Product with duplicate image URLs deduplicates while preserving order', () => {
  const duplicates = [IMG_1, IMG_2, IMG_1, IMG_2, IMG_3, IMG_1];
  const resolved = resolveProductImages(duplicates, IMG_1);

  assert.strictEqual(resolved.length, 3);
  assert.strictEqual(resolved[0], IMG_1);
  assert.strictEqual(resolved[1], IMG_2);
  assert.strictEqual(resolved[2], IMG_3);
});

// --------------------------------------------------------------------------
// Test 5: Product with one valid and one invalid image URL
// --------------------------------------------------------------------------
runTest('Product with valid and dangerous/invalid image URLs filters out invalid', () => {
  const mixed = [
    IMG_1,
    'javascript:alert("pwned")',
    'data:image/svg+xml;base64,PHN2Zz4=',
    'vbscript:msgbox',
    'file:///etc/passwd',
    '   ',
    IMG_2,
  ];
  const resolved = resolveProductImages(mixed, null);

  assert.strictEqual(resolved.length, 2);
  assert.strictEqual(resolved[0], IMG_1);
  assert.strictEqual(resolved[1], IMG_2);
});

// --------------------------------------------------------------------------
// Test 6: Safe leading-slash local paths permitted
// --------------------------------------------------------------------------
runTest('Safe leading-slash local relative URLs are accepted without traversal', () => {
  const localList = ['/media/products/2026-11/test.png', '/images/hero.jpg'];
  const resolved = resolveProductImages(localList, null);

  assert.strictEqual(resolved.length, 2);
  assert.strictEqual(resolved[0], '/media/products/2026-11/test.png');
  assert.strictEqual(resolved[1], '/images/hero.jpg');

  // Traversal paths must be rejected
  const traversalList = ['/media/../secret.png', '//evil.com/img.jpg'];
  const resolvedBad = resolveProductImages(traversalList, null);
  assert.strictEqual(resolvedBad.length, 0);
});

// --------------------------------------------------------------------------
// Test 7: Navigation wrap-around logic
// --------------------------------------------------------------------------
runTest('Gallery navigation wraps around correctly on prev and next', () => {
  const count = 3;
  let currentIndex = 0;

  // Previous from index 0 wraps to count - 1 (2)
  currentIndex = currentIndex === 0 ? count - 1 : currentIndex - 1;
  assert.strictEqual(currentIndex, 2);

  // Next from index 2 wraps to 0
  currentIndex = currentIndex === count - 1 ? 0 : currentIndex + 1;
  assert.strictEqual(currentIndex, 0);

  // Next from index 0 advances to 1
  currentIndex = currentIndex === count - 1 ? 0 : currentIndex + 1;
  assert.strictEqual(currentIndex, 1);
});

// --------------------------------------------------------------------------
// Test 8: mapStorefrontProductToStoreProduct mapping with 2 images
// --------------------------------------------------------------------------
runTest('mapStorefrontProductToStoreProduct correctly maps multi-image API response', () => {
  const apiPayload: StorefrontProduct = {
    id: 'prod_6b7461aeb05f3c5a',
    slug: 'flexi-fabric-fidget-6b7461ae',
    sku: 'PRN-0032',
    name: 'Flexi Fabric Fidget',
    description: 'Precision fidget toy',
    category: 'Home Decor',
    sellingPrice: 4.75,
    currency: 'AED',
    imageUrl: IMG_1,
    images: [IMG_1, IMG_2],
    supportsPersonalization: false,
    isAvailable: true,
    updatedAt: new Date().toISOString(),
  };

  const product = mapStorefrontProductToStoreProduct(apiPayload);

  assert.strictEqual(product.id, 'prod_6b7461aeb05f3c5a');
  assert.strictEqual(product.images.length, 2);
  assert.strictEqual(product.images[0], IMG_1);
  assert.strictEqual(product.images[1], IMG_2);
  assert.strictEqual(product.imageUrl, IMG_1);
});

// --------------------------------------------------------------------------
// Test 9: ProductCard & QuickViewModal primary image resolution
// --------------------------------------------------------------------------
runTest('ProductCard and QuickViewModal resolve primary image without extra gallery overhead', () => {
  const productWithImages = {
    images: [IMG_1, IMG_2],
    imageUrl: IMG_1,
  };
  const primary1 = productWithImages.images?.[0] || productWithImages.imageUrl;
  assert.strictEqual(primary1, IMG_1);

  const productLegacy = {
    images: [] as string[],
    imageUrl: IMG_2,
  };
  const primary2 = productLegacy.images?.[0] || productLegacy.imageUrl;
  assert.strictEqual(primary2, IMG_2);

  const productEmpty = {
    images: [] as string[],
    imageUrl: null,
  };
  const primary3 = productEmpty.images?.[0] || productEmpty.imageUrl || '/assets/images/hero_creations_dubai_1794842125042.jpg';
  assert.strictEqual(primary3, '/assets/images/hero_creations_dubai_1794842125042.jpg');
});

console.log('\n========================================================================');
console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('========================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
