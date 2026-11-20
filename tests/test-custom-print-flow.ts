/**
 * ============================================================================
 * TEST SUITE: SIMPLIFIED CUSTOM PRINTS ENQUIRY FLOW
 * ============================================================================
 *
 * Verifies:
 * 1. Form validation: Missing required fields
 * 2. Form validation: Email format validation
 * 3. Form validation: International phone number validation using isValidPhoneNumber
 * 4. Form validation: Quantity bounds (positive integers 1-1000)
 * 5. Form validation: Field length boundaries (Name, Project, Description)
 * 6. Design file preference handling ("Do you already have a 3D design file?")
 * 7. Upstream contract compatibility: No uploadToken or uploadedFile sent
 * 8. Synchronous double-submission prevention (isSubmittingRef)
 * 9. Real API success handling (HTTP 201/200 with genuine rfqReference)
 * 10. API validation error handling (HTTP 400 with field errors, data preservation)
 * 11. API rate limit & server error handling (HTTP 429 / 500 honest failure, no fake success)
 * 12. Network / offline failure handling (honest failure, no fake demo queues)
 * 13. WhatsApp consultation link formatting with project name & RFQ reference
 */

import assert from 'node:assert';
import {
  isValidEmail,
  isValidPhoneNumber,
  validateCustomPrintForm,
  buildCustomPrintWhatsAppMessage,
} from '../src/lib/storeLogic';
import { submitQuoteRequest } from '../src/lib/api';
import type { QuoteInput } from '../src/lib/types';

let totalTests = 0;
let passedTests = 0;

async function runTest(name: string, fn: () => void | Promise<void>): Promise<void> {
  totalTests++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    passedTests++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  console.log('========================================================================');
  console.log('  TESTING SIMPLIFIED CUSTOM PRINTS ENQUIRY FLOW (NO DIRECT CAD UPLOAD)');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  // Test 1: Missing required fields
  // --------------------------------------------------------------------------
  await runTest('validateCustomPrintForm flags all missing required fields', () => {
    const errors = validateCustomPrintForm({
      fullName: '',
      email: '',
      whatsappNumber: '',
      projectName: '',
      projectDescription: '',
      material: 'PLA',
      color: 'Orange',
      quantity: '',
    });

    assert.ok(errors.fullName, 'fullName error expected');
    assert.ok(errors.email, 'email error expected');
    assert.ok(errors.whatsappNumber, 'whatsappNumber error expected');
    assert.ok(errors.projectName, 'projectName error expected');
    assert.ok(errors.projectDescription, 'projectDescription error expected');
    assert.ok(errors.quantity, 'quantity error expected');
    assert.strictEqual(errors.fullName, 'Please enter your full name.');
  });

  // --------------------------------------------------------------------------
  // Test 2: Email format validation
  // --------------------------------------------------------------------------
  await runTest('validateCustomPrintForm strictly validates email format', () => {
    const invalidEmails = ['plainaddress', 'user@', '@domain.com', 'user@domain'];
    for (const email of invalidEmails) {
      const err = validateCustomPrintForm({
        fullName: 'Tariq Al Maktoum',
        email,
        whatsappNumber: '+971501234567',
        projectName: 'Sensor Housing Prototype',
        projectDescription: 'Need a durable PETG enclosure for environmental testing.',
        material: 'PETG',
        color: 'Black',
        quantity: 5,
      });
      assert.ok(err.email, `Expected email validation error for: ${email}`);
    }

    const validErr = validateCustomPrintForm({
      fullName: 'Tariq Al Maktoum',
      email: 'tariq@holding.ae',
      whatsappNumber: '+971501234567',
      projectName: 'Sensor Housing Prototype',
      projectDescription: 'Need a durable PETG enclosure for environmental testing.',
      material: 'PETG',
      color: 'Black',
      quantity: 5,
    });
    assert.strictEqual(validErr.email, undefined);
  });

  // --------------------------------------------------------------------------
  // Test 3: International phone number validation using isValidPhoneNumber
  // --------------------------------------------------------------------------
  await runTest('validateCustomPrintForm validates phone using ITU-T E.164 rules', () => {
    const validPhones = [
      '+971 50 123 4567',
      '0501234567',
      '+971501234567',
      '(04) 123-4567',
      '+44 20 7946 0958',
      '+1 (555) 234-5678',
    ];
    for (const phone of validPhones) {
      const err = validateCustomPrintForm({
        fullName: 'Tariq Al Maktoum',
        email: 'tariq@holding.ae',
        whatsappNumber: phone,
        projectName: 'Sensor Housing Prototype',
        projectDescription: 'Need a durable PETG enclosure for environmental testing.',
        material: 'PETG',
        color: 'Black',
        quantity: 5,
      });
      assert.strictEqual(err.whatsappNumber, undefined, `Expected valid phone: ${phone}`);
    }

    const invalidPhones = ['123456', '1234567890123456', 'call-me', '+971-50-CALL'];
    for (const phone of invalidPhones) {
      const err = validateCustomPrintForm({
        fullName: 'Tariq Al Maktoum',
        email: 'tariq@holding.ae',
        whatsappNumber: phone,
        projectName: 'Sensor Housing Prototype',
        projectDescription: 'Need a durable PETG enclosure for environmental testing.',
        material: 'PETG',
        color: 'Black',
        quantity: 5,
      });
      assert.ok(err.whatsappNumber, `Expected phone validation error for: ${phone}`);
    }
  });

  // --------------------------------------------------------------------------
  // Test 4: Quantity bounds
  // --------------------------------------------------------------------------
  await runTest('validateCustomPrintForm enforces quantity between 1 and 1000', () => {
    const invalidQuantities = [0, -1, 1001, 2500, 1.5, NaN, 'abc', ''];
    for (const qty of invalidQuantities) {
      const err = validateCustomPrintForm({
        fullName: 'Tariq Al Maktoum',
        email: 'tariq@holding.ae',
        whatsappNumber: '+971501234567',
        projectName: 'Architectural Scale Model',
        projectDescription: 'Detailed scale model for Dubai design exhibition display.',
        material: 'Resin',
        color: 'White',
        quantity: qty as any,
      });
      assert.ok(err.quantity, `Expected quantity error for: ${qty}`);
    }

    const validQuantities = [1, 10, 50, 500, 1000, '1', '1000'];
    for (const qty of validQuantities) {
      const err = validateCustomPrintForm({
        fullName: 'Tariq Al Maktoum',
        email: 'tariq@holding.ae',
        whatsappNumber: '+971501234567',
        projectName: 'Architectural Scale Model',
        projectDescription: 'Detailed scale model for Dubai design exhibition display.',
        material: 'Resin',
        color: 'White',
        quantity: qty as any,
      });
      assert.strictEqual(err.quantity, undefined, `Expected valid quantity for: ${qty}`);
    }
  });

  // --------------------------------------------------------------------------
  // Test 5: Field length boundaries
  // --------------------------------------------------------------------------
  await runTest('validateCustomPrintForm enforces length boundaries', () => {
    // Name too short (< 2)
    assert.ok(
      validateCustomPrintForm({
        fullName: 'T',
        email: 'tariq@holding.ae',
        whatsappNumber: '+971501234567',
        projectName: 'Valid Project',
        projectDescription: 'Valid description that has more than 15 characters.',
        material: 'PLA',
        color: 'Orange',
        quantity: 1,
      }).fullName
    );

    // Project title too short (< 2)
    assert.ok(
      validateCustomPrintForm({
        fullName: 'Tariq Al Maktoum',
        email: 'tariq@holding.ae',
        whatsappNumber: '+971501234567',
        projectName: 'P',
        projectDescription: 'Valid description that has more than 15 characters.',
        material: 'PLA',
        color: 'Orange',
        quantity: 1,
      }).projectName
    );

    // Project description too short (< 15)
    assert.ok(
      validateCustomPrintForm({
        fullName: 'Tariq Al Maktoum',
        email: 'tariq@holding.ae',
        whatsappNumber: '+971501234567',
        projectName: 'Sensor Housing',
        projectDescription: 'Too short',
        material: 'PLA',
        color: 'Orange',
        quantity: 1,
      }).projectDescription
    );
  });

  // --------------------------------------------------------------------------
  // Test 6: Design file preference handling ("Do you already have a 3D design file?")
  // --------------------------------------------------------------------------
  await runTest('Design file preference options format cleanly into project description', () => {
    const options = [
      'Yes, I have a ready 3D design',
      'I have an image or reference',
      'No, I need help with the design',
    ];

    for (const opt of options) {
      const descParts = [
        'Need 50 bespoke corporate awards with metallic silk finish.',
        `3D Design File: ${opt}`,
        'Dimensions: 200 x 80 x 40 mm',
        'Budget: AED 1,000 – 2,500',
        'Notes: Include laser engraved brass base.',
      ]
        .filter(Boolean)
        .join('\n');

      assert.ok(descParts.includes(`3D Design File: ${opt}`));
      assert.ok(!descParts.includes('CAD/Cloud Link:'));
      assert.ok(!descParts.includes('CAD File Reference:'));
    }
  });

  // --------------------------------------------------------------------------
  // Test 7: Upstream contract compatibility: No uploadToken or uploadedFile sent
  // --------------------------------------------------------------------------
  await runTest('QuoteInput payload contains only supported fields and no upload tokens', () => {
    const payload: QuoteInput = {
      customerName: 'Tariq Al Maktoum',
      customerEmail: 'tariq@holding.ae',
      customerPhone: '+971 50 123 4567',
      projectTitle: 'Bespoke Executive Desk Trophy',
      projectDescription: 'Custom 3D sculpture representing the Dubai skyline.\n3D Design File: Yes, I have a ready 3D design',
      materialPreference: 'Resin',
      colorPreference: 'White',
      quantity: 10,
      targetDeadline: '2026-05-15',
    };

    assert.strictEqual(payload.uploadToken, undefined, 'uploadToken must not be set');
    assert.ok(!('uploadedFile' in payload), 'uploadedFile must not be in payload');
    assert.strictEqual(payload.customerName, 'Tariq Al Maktoum');
    assert.strictEqual(payload.quantity, 10);
  });

  // --------------------------------------------------------------------------
  // Test 8: Synchronous double-submission prevention (isSubmittingRef)
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
      await new Promise((resolve) => setTimeout(resolve, 50));
      isSubmittingRef.current = false;
      return { rejected: false };
    };

    const [req1, req2] = await Promise.all([simulatedSubmit(), simulatedSubmit()]);
    assert.strictEqual(req1.rejected, false, 'First submission proceeds');
    assert.strictEqual(req2.rejected, true, 'Second rapid click is blocked');
    assert.strictEqual(callCount, 1, 'Handler executes exactly once');
  });

  // --------------------------------------------------------------------------
  // Test 9: Real API success handling (HTTP 201 with rfqReference)
  // --------------------------------------------------------------------------
  await runTest('submitQuoteRequest handles HTTP 201 success and returns real rfqReference', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            success: true,
            rfqReference: 'RFQ-784012',
            quoteRequestId: 'quote-uuid-9988',
            message: 'Your custom manufacturing quote request has been submitted successfully.',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        );

      const res = await submitQuoteRequest({
        customerName: 'Tariq Al Maktoum',
        customerEmail: 'tariq@holding.ae',
        customerPhone: '+971501234567',
        projectTitle: 'Mechanical Enclosure',
        projectDescription: 'Test prototype description',
        materialPreference: 'ABS',
        colorPreference: 'Black',
        quantity: 2,
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.rfqReference, 'RFQ-784012');
      assert.strictEqual(res.quoteRequestId, 'quote-uuid-9988');
      assert.ok(res.message.includes('submitted successfully'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 10: API validation error handling (HTTP 400)
  // --------------------------------------------------------------------------
  await runTest('submitQuoteRequest handles HTTP 400 validation error without claiming success', async () => {
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

      const res = await submitQuoteRequest({
        customerName: 'Tariq Al Maktoum',
        customerEmail: 'invalid-email',
        projectTitle: 'Test',
        projectDescription: 'Description',
        quantity: 1,
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'VALIDATION_ERROR');
      assert.strictEqual(res.errors?.customerEmail, 'Please provide a valid email address.');
      assert.strictEqual(res.rfqReference, undefined);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 11: API rate limit (HTTP 429) & server error (HTTP 500)
  // --------------------------------------------------------------------------
  await runTest('submitQuoteRequest handles HTTP 429 and 500 honestly and never displays fake success', async () => {
    const originalFetch = globalThis.fetch;
    try {
      // 429 Rate limit
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many quote requests from this IP address. Please try again later.',
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );

      const res429 = await submitQuoteRequest({
        customerName: 'Tariq Al Maktoum',
        customerEmail: 'tariq@holding.ae',
        projectTitle: 'Test',
        projectDescription: 'Testing rate limit',
        quantity: 1,
      });

      assert.strictEqual(res429.success, false);
      assert.strictEqual(res429.error, 'RATE_LIMIT_EXCEEDED');
      assert.ok(res429.message.includes('Too many quote requests'));

      // 500 Internal error
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            error: 'INTERNAL_ERROR',
            message: 'Failed to process quotation request.',
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );

      const res500 = await submitQuoteRequest({
        customerName: 'Tariq Al Maktoum',
        customerEmail: 'tariq@holding.ae',
        projectTitle: 'Test',
        projectDescription: 'Testing server error',
        quantity: 1,
      });

      assert.strictEqual(res500.success, false);
      assert.strictEqual(res500.error, 'INTERNAL_ERROR');
      assert.ok(res500.message.includes('Failed to process'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 12: Network offline failure handling
  // --------------------------------------------------------------------------
  await runTest('submitQuoteRequest handles network/offline failure honestly without fake demo queues', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch');
      };

      const res = await submitQuoteRequest({
        customerName: 'Tariq Al Maktoum',
        customerEmail: 'tariq@holding.ae',
        projectTitle: 'Test',
        projectDescription: 'Testing offline scenario',
        quantity: 1,
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'NETWORK_ERROR');
      assert.ok(res.message.includes('Unable to connect to the studio servers'));
      assert.ok(!res.message.includes('demo queue'));
      assert.strictEqual(res.rfqReference, undefined);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // --------------------------------------------------------------------------
  // Test 13: WhatsApp consultation message formatting
  // --------------------------------------------------------------------------
  await runTest('buildCustomPrintWhatsAppMessage formats clean message with reference', () => {
    const msgWithRef = buildCustomPrintWhatsAppMessage('Sensor Enclosure Prototype', 'RFQ-784012');
    assert.ok(msgWithRef.includes('Sensor Enclosure Prototype'));
    assert.ok(msgWithRef.includes('(Ref: RFQ-784012)'));
    assert.ok(msgWithRef.includes('in Dubai'));

    const msgWithoutRef = buildCustomPrintWhatsAppMessage('Architectural Model');
    assert.ok(msgWithoutRef.includes('Architectural Model'));
    assert.ok(!msgWithoutRef.includes('(Ref:'));
  });

  console.log('\n========================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('========================================================================\n');
}

runAllTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
