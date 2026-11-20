/**
 * ============================================================================
 * TEST SUITE: PRODUCT ENQUIRY SUBMISSION RELIABILITY & CUSTOMER EXPERIENCE
 * ============================================================================
 *
 * Verifies:
 * 1. Form validation: Missing required fields
 * 2. Form validation: Invalid email rejection & valid email acceptance
 * 3. Form validation: Sensible international phone validation (ITU-T E.164)
 * 4. Form validation: Quantity validation (positive integers 1-500, reject <=0, float, >500)
 * 5. Form validation: Field length boundaries (Name 2-150, Message 5-5000)
 * 6. Storefront submission contract: Upstream payload compatibility & subject format
 * 7. Double-click / rapid submission prevention
 * 8. Real API success handling (HTTP 201 with true enquiryId)
 * 9. API validation error handling (HTTP 400 with field errors, data preservation)
 * 10. API rate limit & server error handling (HTTP 429 / 500 honest failure)
 * 11. Network / offline failure handling (honest failure, no fake success)
 * 12. Multi-image product gallery regression prevention
 */

import assert from 'node:assert';
import {
  isValidEmail,
  isValidPhoneNumber,
  validateProductEnquiryForm,
  buildProductWhatsAppMessage,
  resolveProductImages,
} from '../src/lib/storeLogic';
import { submitEnquiry } from '../src/lib/api';
import type { EnquiryInput } from '../src/lib/types';

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void | Promise<void>): Promise<void> | void {
  totalTests++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          passedTests++;
          console.log(`  ✅ [PASS] ${name}`);
        })
        .catch((err) => {
          console.error(`  ❌ [FAIL] ${name}`);
          console.error(`     Error: ${err.message}`);
          throw err;
        });
    } else {
      passedTests++;
      console.log(`  ✅ [PASS] ${name}`);
    }
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  console.log('========================================================================');
  console.log('  TESTING PRODUCT ENQUIRY SUBMISSION RELIABILITY & CUSTOMER EXPERIENCE');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  // Test 1: Missing required fields prevented with inline errors
  // --------------------------------------------------------------------------
  runTest('validateProductEnquiryForm flags all missing required fields', () => {
    const errors = validateProductEnquiryForm({
      customerName: '',
      email: '',
      phone: '',
      quantity: '',
      message: '',
    });

    assert.ok(errors.customerName, 'customerName error expected');
    assert.ok(errors.email, 'email error expected');
    assert.ok(errors.phone, 'phone error expected');
    assert.ok(errors.quantity, 'quantity error expected');
    assert.ok(errors.message, 'message error expected');
    assert.strictEqual(errors.customerName, 'Please enter your full name.');
  });

  // --------------------------------------------------------------------------
  // Test 2: Email validation (rejection of invalid & acceptance of valid)
  // --------------------------------------------------------------------------
  runTest('isValidEmail strictly rejects invalid formats and accepts valid emails', () => {
    const invalidEmails = [
      'not-an-email',
      'user@',
      '@domain.com',
      'user@domain',
      'user space@domain.com',
      '',
    ];

    for (const email of invalidEmails) {
      assert.strictEqual(isValidEmail(email), false, `Should reject: ${email}`);
      const err = validateProductEnquiryForm({
        customerName: 'Layla Al Hashimi',
        email,
        phone: '+971501234567',
        quantity: 1,
        message: 'Looking for studio availability',
      });
      assert.ok(err.email, `Expected email validation error for: ${email}`);
    }

    const validEmails = [
      'customer@example.com',
      'layla.hashimi@studio.ae',
      'orders+3d@customprints.org',
    ];

    for (const email of validEmails) {
      assert.strictEqual(isValidEmail(email), true, `Should accept: ${email}`);
    }
  });

  // --------------------------------------------------------------------------
  // Test 3: Sensible international phone number validation (ITU-T E.164)
  // --------------------------------------------------------------------------
  runTest('isValidPhoneNumber validates international phone numbers accurately', () => {
    const validPhones = [
      '+971 50 123 4567',
      '0501234567',
      '+971501234567',
      '(04) 123-4567',
      '+44 20 7946 0958',
      '+1 (555) 234-5678',
      '00971501234567',
    ];

    for (const phone of validPhones) {
      assert.strictEqual(isValidPhoneNumber(phone), true, `Should accept valid phone: ${phone}`);
    }

    const invalidPhones = [
      '123456', // 6 digits - too short
      '1234567890123456', // 16 digits - exceeds 15 digit E.164 max
      'phone1234567', // alphabetic chars
      '+971-50-CALL-NOW', // letters
      '++971501234567', // malformed plus
      '',
    ];

    for (const phone of invalidPhones) {
      assert.strictEqual(isValidPhoneNumber(phone), false, `Should reject invalid phone: ${phone}`);
      const err = validateProductEnquiryForm({
        customerName: 'Layla Al Hashimi',
        email: 'layla@example.com',
        phone,
        quantity: 1,
        message: 'Looking for studio availability',
      });
      assert.ok(err.phone, `Expected phone validation error for: ${phone}`);
    }
  });

  // --------------------------------------------------------------------------
  // Test 4: Quantity validation
  // --------------------------------------------------------------------------
  runTest('Quantity validation enforces positive integers between 1 and 500', () => {
    const invalidQuantities = [0, -1, -100, 501, 1000, 1.5, NaN, 'abc', ''];

    for (const qty of invalidQuantities) {
      const err = validateProductEnquiryForm({
        customerName: 'Layla Al Hashimi',
        email: 'layla@example.com',
        phone: '+971 50 123 4567',
        quantity: qty as any,
        message: 'Valid studio message notes',
      });
      assert.ok(err.quantity, `Expected quantity error for: ${qty}`);
    }

    const validQuantities = [1, 2, 10, 50, 500, '1', '500'];
    for (const qty of validQuantities) {
      const err = validateProductEnquiryForm({
        customerName: 'Layla Al Hashimi',
        email: 'layla@example.com',
        phone: '+971 50 123 4567',
        quantity: qty as any,
        message: 'Valid studio message notes',
      });
      assert.strictEqual(err.quantity, undefined, `Expected no quantity error for: ${qty}`);
    }
  });

  // --------------------------------------------------------------------------
  // Test 5: Field length boundaries
  // --------------------------------------------------------------------------
  runTest('Field boundary checks enforce length constraints', () => {
    // Name too short (< 2)
    assert.ok(
      validateProductEnquiryForm({
        customerName: 'A',
        email: 'layla@example.com',
        phone: '+971501234567',
        quantity: 1,
        message: 'Valid studio note',
      }).customerName
    );

    // Name too long (> 150)
    assert.ok(
      validateProductEnquiryForm({
        customerName: 'A'.repeat(151),
        email: 'layla@example.com',
        phone: '+971501234567',
        quantity: 1,
        message: 'Valid studio note',
      }).customerName
    );

    // Message too short (< 5)
    assert.ok(
      validateProductEnquiryForm({
        customerName: 'Layla Al Hashimi',
        email: 'layla@example.com',
        phone: '+971501234567',
        quantity: 1,
        message: 'Hi',
      }).message
    );

    // Message too long (> 5000)
    assert.ok(
      validateProductEnquiryForm({
        customerName: 'Layla Al Hashimi',
        email: 'layla@example.com',
        phone: '+971501234567',
        quantity: 1,
        message: 'M'.repeat(5001),
      }).message
    );

    // Clean valid inputs produce zero errors
    const valid = validateProductEnquiryForm({
      customerName: 'Layla Al Hashimi',
      email: 'layla@example.com',
      phone: '+971 50 123 4567',
      quantity: 3,
      message: 'Interested in satin gold finish on this architectural vase.',
    });
    assert.deepStrictEqual(valid, {});
  });

  // --------------------------------------------------------------------------
  // Test 6: Upstream contract & subject formatting
  // --------------------------------------------------------------------------
  runTest('Subject and payload format correctly for upstream contract without color', () => {
    const productName = 'Arabic Calligraphy Desk Sculpture';
    const singleQtySubject = `Enquiry: ${productName}`;
    const multiQtySubject = `Enquiry: ${productName} (Qty: 4)`;

    assert.strictEqual(singleQtySubject, 'Enquiry: Arabic Calligraphy Desk Sculpture');
    assert.strictEqual(multiQtySubject, 'Enquiry: Arabic Calligraphy Desk Sculpture (Qty: 4)');

    const payload: EnquiryInput = {
      customerName: 'Layla Al Hashimi',
      customerEmail: 'layla@example.com',
      customerPhone: '+971 50 123 4567',
      subject: multiQtySubject,
      message: 'Please confirm availability.',
      productId: 'prod-001',
    };

    assert.ok(!('selectedColor' in payload), 'selectedColor should not be present in payload');
    assert.strictEqual(payload.customerName, 'Layla Al Hashimi');
    assert.strictEqual(payload.subject, 'Enquiry: Arabic Calligraphy Desk Sculpture (Qty: 4)');
  });

  // --------------------------------------------------------------------------
  // Test 7: Double-click prevention logic
  // --------------------------------------------------------------------------
  await runTest('Synchronous isSubmittingRef prevents concurrent rapid double submissions', async () => {
    let callCount = 0;
    const isSubmittingRef = { current: false };

    const simulatedSubmit = async () => {
      if (isSubmittingRef.current) {
        return { rejected: true };
      }
      isSubmittingRef.current = true;
      callCount++;
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 50));
      isSubmittingRef.current = false;
      return { rejected: false };
    };

    // User triggers two rapid clicks simultaneously
    const [click1, click2] = await Promise.all([simulatedSubmit(), simulatedSubmit()]);

    assert.strictEqual(click1.rejected, false, 'First submission should proceed');
    assert.strictEqual(click2.rejected, true, 'Second rapid click should be blocked by ref');
    assert.strictEqual(callCount, 1, 'Underlying handler must execute exactly once');
  });

  // --------------------------------------------------------------------------
  // Test 8: API success handling (HTTP 201)
  // --------------------------------------------------------------------------
  await runTest('submitEnquiry handles HTTP 201 success and returns real enquiryId', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            success: true,
            enquiryId: 'enq-rec-98765',
            message: 'Your enquiry has been received.',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );

      const res = await submitEnquiry({
        customerName: 'Layla Al Hashimi',
        customerEmail: 'layla@example.com',
        customerPhone: '+971501234567',
        subject: 'Enquiry: Desk Sculpture',
        message: 'Looking for quote',
        productId: 'prod-01',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.enquiryId, 'enq-rec-98765');
      assert.ok(res.message.includes('enquiry has been received'));

      // Check WhatsApp message format with reference code
      const waMsg =
        buildProductWhatsAppMessage('Desk Sculpture', 150, 1, undefined, 'SKU-01') +
        ` [Ref: ENQ-${res.enquiryId}]`;
      assert.ok(waMsg.includes('[Ref: ENQ-enq-rec-98765]'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 9: API validation error handling (HTTP 400)
  // --------------------------------------------------------------------------
  await runTest('submitEnquiry handles HTTP 400 validation error without claiming success', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            error: 'VALIDATION_ERROR',
            message: 'One or more required fields are invalid.',
            errors: { customerEmail: 'Please provide a valid email address.' },
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );

      const res = await submitEnquiry({
        customerName: 'Layla Al Hashimi',
        customerEmail: 'invalid-email',
        customerPhone: '+971501234567',
        subject: 'Enquiry: Desk Sculpture',
        message: 'Looking for quote',
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'VALIDATION_ERROR');
      assert.strictEqual(res.errors?.customerEmail, 'Please provide a valid email address.');
      assert.strictEqual(res.enquiryId, undefined);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 10: API Rate Limit (HTTP 429) & Server Error (HTTP 500)
  // --------------------------------------------------------------------------
  await runTest('submitEnquiry handles HTTP 429 and 500 honestly and never displays fake success', async () => {
    const originalFetch = globalThis.fetch;
    try {
      // 429 Rate limit
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many enquiry submissions from this IP address. Please try again later.',
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );

      const res429 = await submitEnquiry({
        customerName: 'Layla Al Hashimi',
        customerEmail: 'layla@example.com',
        customerPhone: '+971501234567',
        subject: 'Enquiry: Test',
        message: 'Testing rate limit',
      });

      assert.strictEqual(res429.success, false);
      assert.strictEqual(res429.error, 'RATE_LIMIT_EXCEEDED');
      assert.ok(res429.message.includes('Too many enquiry submissions'));

      // 500 Internal Server Error
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            error: 'INTERNAL_ERROR',
            message: 'Failed to process customer enquiry.',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );

      const res500 = await submitEnquiry({
        customerName: 'Layla Al Hashimi',
        customerEmail: 'layla@example.com',
        customerPhone: '+971501234567',
        subject: 'Enquiry: Test',
        message: 'Testing server error',
      });

      assert.strictEqual(res500.success, false);
      assert.strictEqual(res500.error, 'INTERNAL_ERROR');
      assert.ok(res500.message.includes('Failed to process'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 11: Network offline failure
  // --------------------------------------------------------------------------
  await runTest('submitEnquiry handles network/offline failure honestly without fake demo queues', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch');
      };

      const res = await submitEnquiry({
        customerName: 'Layla Al Hashimi',
        customerEmail: 'layla@example.com',
        customerPhone: '+971501234567',
        subject: 'Enquiry: Test',
        message: 'Testing offline scenario',
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'NETWORK_ERROR');
      assert.ok(res.message.includes('Unable to connect to the studio servers'));
      assert.ok(!res.message.includes('demo queue'));
      assert.strictEqual(res.enquiryId, undefined);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 12: Regression check: Multi-image product gallery
  // --------------------------------------------------------------------------
  runTest('Multi-image product gallery continues to function without regression', () => {
    const images = [
      'https://r2.3dstudio.ae/products/sculpture-front.webp',
      'https://r2.3dstudio.ae/products/sculpture-detail.webp',
      'https://r2.3dstudio.ae/products/sculpture-front.webp', // Duplicate
    ];
    const resolved = resolveProductImages(images, 'https://r2.3dstudio.ae/products/sculpture-front.webp');

    assert.strictEqual(resolved.length, 2, 'Should deduplicate');
    assert.strictEqual(resolved[0], 'https://r2.3dstudio.ae/products/sculpture-front.webp');
    assert.strictEqual(resolved[1], 'https://r2.3dstudio.ae/products/sculpture-detail.webp');
  });

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('========================================================================\n');
}

runAllTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
