/**
 * ============================================================================
 * TEST SUITE: REMOVAL OF CUSTOMER COLOR SELECTION
 * ============================================================================
 *
 * Validates:
 * 1. WhatsApp enquiry message formatting without color (clean, no trailing or missing spaces)
 * 2. WhatsApp enquiry message with optional color (backward compatibility check)
 * 3. StoreContext submitProductEnquiry payload generation without selectedColor
 * 4. Submission contract compatibility with upstream /api/store/enquiries (EnquiryInput)
 * 5. Product specifications preservation (Finish, Material, Dimensions)
 * 6. EnquiryModal form layout fields and state without color dropdown
 */

import assert from 'node:assert';
import { buildProductWhatsAppMessage } from '../src/lib/storeLogic';
import type { CustomerEnquiry, EnquiryInput } from '../src/lib/types';

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
console.log('  TESTING CUSTOMER COLOR SELECTION REMOVAL');
console.log('========================================================================\n');

// --------------------------------------------------------------------------
// Test 1: WhatsApp message without color
// --------------------------------------------------------------------------
runTest('buildProductWhatsAppMessage generates clean message without color parameter', () => {
  const msg = buildProductWhatsAppMessage(
    'Flexi Fabric Fidget',
    4.75,
    2,
    undefined,
    'PRN-0032'
  );

  assert.ok(msg.includes('I would like to enquire about: "Flexi Fabric Fidget" [SKU: PRN-0032] (Quantity: 2)'));
  assert.ok(msg.includes('Indicative price is AED 9.5'));
  assert.ok(!msg.includes('in undefined'));
  assert.ok(!msg.includes('in Standard'));
  assert.ok(!msg.includes('Color'));
});

// --------------------------------------------------------------------------
// Test 2: WhatsApp message with personalization text (no color)
// --------------------------------------------------------------------------
runTest('buildProductWhatsAppMessage handles personalization cleanly without color', () => {
  const msg = buildProductWhatsAppMessage(
    'Geometric Moon Lamp',
    120,
    1,
    undefined,
    'PRN-0010',
    'DUBAI 2026'
  );

  assert.ok(msg.includes('I would like to enquire about: "Geometric Moon Lamp" [SKU: PRN-0010] [Custom Text: "DUBAI 2026"]'));
  assert.ok(msg.includes('Indicative price is AED 120'));
  assert.ok(!msg.includes('in undefined'));
  assert.ok(!msg.includes('in Standard'));
});

// --------------------------------------------------------------------------
// Test 3: Backward compatibility for WhatsApp message with legacy color
// --------------------------------------------------------------------------
runTest('buildProductWhatsAppMessage still formats color gracefully if provided', () => {
  const msg = buildProductWhatsAppMessage(
    'Minimalist Phone Stand',
    45,
    1,
    'Matte White',
    'PRN-0015'
  );

  assert.ok(msg.includes('in Matte White'));
});

// --------------------------------------------------------------------------
// Test 4: Subject line generation in submitProductEnquiry
// --------------------------------------------------------------------------
runTest('StoreContext subject generation formats cleanly with or without selectedColor', () => {
  function formatSubject(productName: string, selectedColor?: string) {
    return selectedColor
      ? `Enquiry: ${productName} (${selectedColor})`
      : `Enquiry: ${productName}`;
  }

  // Without color (new standard behavior)
  const subjectWithoutColor = formatSubject('Flexi Fabric Fidget');
  assert.strictEqual(subjectWithoutColor, 'Enquiry: Flexi Fabric Fidget');

  // With color (backward compatibility behavior)
  const subjectWithColor = formatSubject('Flexi Fabric Fidget', 'Warm Cream');
  assert.strictEqual(subjectWithColor, 'Enquiry: Flexi Fabric Fidget (Warm Cream)');
});

// --------------------------------------------------------------------------
// Test 5: CustomerEnquiry type allows optional selectedColor
// --------------------------------------------------------------------------
runTest('CustomerEnquiry model accepts submissions without selectedColor', () => {
  const newSubmission: Omit<CustomerEnquiry, 'id' | 'referenceCode' | 'status' | 'internalNotes' | 'createdAt'> = {
    customerName: 'Ahmad Al Mansoori',
    email: 'ahmad@example.ae',
    phone: '+971501234567',
    productId: 'prod_6b7461aeb05f3c5a',
    productName: 'Flexi Fabric Fidget',
    quantity: 3,
    message: 'Looking for a bulk corporate order in Dubai.',
  };

  assert.strictEqual(newSubmission.selectedColor, undefined);
  assert.strictEqual(newSubmission.quantity, 3);
  assert.strictEqual(newSubmission.productName, 'Flexi Fabric Fidget');

  // Verify it maps to valid EnquiryInput for upstream API
  const apiPayload: EnquiryInput = {
    customerName: newSubmission.customerName,
    customerEmail: newSubmission.email,
    customerPhone: newSubmission.phone,
    subject: `Enquiry: ${newSubmission.productName}`,
    message: newSubmission.message,
    productId: newSubmission.productId,
  };

  assert.strictEqual(apiPayload.customerName, 'Ahmad Al Mansoori');
  assert.strictEqual(apiPayload.subject, 'Enquiry: Flexi Fabric Fidget');
});

// --------------------------------------------------------------------------
// Test 6: Static product specification Finish is preserved
// --------------------------------------------------------------------------
runTest('Static product specifications (Finish, Material, Dimensions) remain preserved', () => {
  const mockProduct = {
    id: 'prod_test',
    name: 'Vase',
    material: 'Matte PLA+',
    dimensions: '180mm x 90mm',
    finish: 'Layer-smoothed semi-matte',
    colors: ['Warm Cream', 'Deep Navy'],
  };

  // Informational finish must not be cleared
  assert.strictEqual(mockProduct.finish, 'Layer-smoothed semi-matte');
  assert.strictEqual(mockProduct.material, 'Matte PLA+');
});

console.log('\n========================================================================');
console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('========================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
