'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircleIcon, CheckCircleIcon, LoadingIcon } from '@/components/ui/icons';
import { useStore } from '@/context/StoreContext';
import {
  buildProductWhatsAppMessage,
  formatAed,
  getEffectivePrice,
  validateProductEnquiryForm,
} from '@/lib/storeLogic';
import { Modal } from '../ui/Modal';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export function EnquiryModal() {
  const { enquiryModalState, setEnquiryModalState, submitProductEnquiry } = useStore();
  const product = enquiryModalState.product;
  const initialQuantity = enquiryModalState.quantity || 1;

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState<number | string>(initialQuantity);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (product) {
      setQuantity(initialQuantity);
      setSubmittedRef(null);
      setErrors({});
      setServerError(null);
      setMessage(`Hello, I would like to inquire about availability and custom finishing for ${product.name}.`);
    }
  }, [product, initialQuantity]);

  if (!product) return null;

  const effectivePrice = getEffectivePrice(product);

  const handleClose = () => {
    if (!isSubmitting) {
      setEnquiryModalState({ product: null });
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    const formErrors = validateProductEnquiryForm({
      customerName,
      email,
      phone,
      quantity,
      message,
    });

    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setServerError(null);

    const parsedQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 1;

    try {
      const record = await submitProductEnquiry({
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productId: product.id,
        productName: product.name,
        quantity: parsedQty,
        message: message.trim(),
      });
      setSubmittedRef(record.referenceCode);
    } catch (err: any) {
      if (err?.errors && typeof err.errors === 'object') {
        const mappedErrors: Record<string, string> = {};
        if (err.errors.customerName) mappedErrors.customerName = err.errors.customerName;
        if (err.errors.customerEmail) mappedErrors.email = err.errors.customerEmail;
        if (err.errors.email) mappedErrors.email = err.errors.email;
        if (err.errors.customerPhone) mappedErrors.phone = err.errors.customerPhone;
        if (err.errors.phone) mappedErrors.phone = err.errors.phone;
        if (err.errors.message) mappedErrors.message = err.errors.message;
        if (err.errors.quantity) mappedErrors.quantity = err.errors.quantity;
        setErrors((prev) => ({ ...prev, ...mappedErrors }));
      }
      setServerError(
        err?.message || 'An unexpected issue occurred while submitting. Please chat directly on WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const parsedQtyNumber = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 1;

  return (
    <Modal
      open={Boolean(product)}
      onClose={handleClose}
      title={submittedRef ? 'Enquiry Received' : `Enquire About ${product.name}`}
      subtitle={
        submittedRef
          ? `Reference: ${submittedRef}`
          : `${formatAed(effectivePrice)} per unit · Indicative Studio Price`
      }
      maxWidthClass="max-w-lg"
    >
      {submittedRef ? (
        <div className="space-y-5">
          <div className="rounded-2xl bg-[#FCF2EC] border border-[#0D1B35]/10 p-5 flex items-start gap-3.5">
            <CheckCircleIcon className="w-6 h-6 text-[#F45A00] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#737373]">
                  Studio Reference
                </span>
                <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-[#0D1B35]/15 text-[#0D1B35]">
                  {submittedRef}
                </span>
              </div>
              <p className="font-display font-bold text-[#0D1B35] text-base">
                Your enquiry has been registered in our Dubai studio queue.
              </p>
              <p className="text-sm text-[#525252] leading-relaxed">
                Thank you! Our studio team will review your specifications for <strong>{product.name}</strong> (Qty: {parsedQtyNumber}) and confirm scheduling and lead time. For immediate confirmation, you can continue directly on WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <WhatsAppButton
              message={
                buildProductWhatsAppMessage(
                  product.name,
                  effectivePrice,
                  parsedQtyNumber,
                  undefined,
                  product.sku
                ) + ` [Ref: ${submittedRef}]`
              }
              label="Continue on WhatsApp"
              variant="primary"
              className="flex-1 justify-center"
            />
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#0D1B35]/20 px-5 py-3 text-sm font-semibold text-[#0D1B35] hover:bg-[#FCF2EC] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 space-y-2.5"
            >
              <div className="flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="space-y-1">
                  <p className="font-semibold">{serverError}</p>
                  <p className="text-[11px] text-red-600/90 leading-normal">
                    Your entered details are preserved below. You can make adjustments and retry, or reach out to us directly on WhatsApp.
                  </p>
                </div>
              </div>
              <div className="pt-1">
                <WhatsAppButton
                  message={buildProductWhatsAppMessage(
                    product.name,
                    effectivePrice,
                    parsedQtyNumber,
                    undefined,
                    product.sku
                  )}
                  label="Connect via WhatsApp Instead"
                  variant="whatsapp"
                  className="w-full text-xs py-2 justify-center"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enq-name" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                Full Name *
              </label>
              <input
                id="enq-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  handleFieldChange('customerName', e.target.value);
                }}
                aria-invalid={Boolean(errors.customerName)}
                aria-describedby={errors.customerName ? 'enq-name-error' : undefined}
                placeholder="e.g. Layla Al Hashimi"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:bg-white focus:outline-none transition-colors ${
                  errors.customerName
                    ? 'border-red-500 bg-red-50/50 focus:border-red-500'
                    : 'border-[#0D1B35]/15 bg-[#FCF2EC]/40 focus:border-[#F45A00]'
                }`}
              />
              {errors.customerName && (
                <p id="enq-name-error" role="alert" className="text-xs text-red-600 mt-1 font-medium">
                  {errors.customerName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="enq-phone" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                WhatsApp / Phone *
              </label>
              <input
                id="enq-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  handleFieldChange('phone', e.target.value);
                }}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'enq-phone-error' : undefined}
                placeholder="+971 50 000 0000"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:bg-white focus:outline-none transition-colors ${
                  errors.phone
                    ? 'border-red-500 bg-red-50/50 focus:border-red-500'
                    : 'border-[#0D1B35]/15 bg-[#FCF2EC]/40 focus:border-[#F45A00]'
                }`}
              />
              {errors.phone && (
                <p id="enq-phone-error" role="alert" className="text-xs text-red-600 mt-1 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="enq-email" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                Email Address *
              </label>
              <input
                id="enq-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleFieldChange('email', e.target.value);
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'enq-email-error' : undefined}
                placeholder="name@example.com"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:bg-white focus:outline-none transition-colors ${
                  errors.email
                    ? 'border-red-500 bg-red-50/50 focus:border-red-500'
                    : 'border-[#0D1B35]/15 bg-[#FCF2EC]/40 focus:border-[#F45A00]'
                }`}
              />
              {errors.email && (
                <p id="enq-email-error" role="alert" className="text-xs text-red-600 mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="enq-qty" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                Quantity *
              </label>
              <input
                id="enq-qty"
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuantity(val === '' ? '' : parseInt(val, 10));
                  if (errors.quantity) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.quantity;
                      return next;
                    });
                  }
                }}
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={errors.quantity ? 'enq-qty-error' : undefined}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0D1B35] focus:bg-white focus:outline-none transition-colors tabular-nums ${
                  errors.quantity
                    ? 'border-red-500 bg-red-50/50 focus:border-red-500'
                    : 'border-[#0D1B35]/15 bg-[#FCF2EC]/40 focus:border-[#F45A00]'
                }`}
              />
              {errors.quantity && (
                <p id="enq-qty-error" role="alert" className="text-xs text-red-600 mt-1 font-medium">
                  {errors.quantity}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="enq-msg" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
              Message / Customization Notes *
            </label>
            <textarea
              id="enq-msg"
              rows={3}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleFieldChange('message', e.target.value);
              }}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'enq-msg-error' : undefined}
              placeholder="Include details about custom requirements, sizing, or delivery in Dubai..."
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:bg-white focus:outline-none transition-colors resize-none ${
                errors.message
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500'
                  : 'border-[#0D1B35]/15 bg-[#FCF2EC]/40 focus:border-[#F45A00]'
              }`}
            />
            {errors.message && (
              <p id="enq-msg-error" role="alert" className="text-xs text-red-600 mt-1 font-medium">
                {errors.message}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 rounded-xl bg-[#F45A00] hover:bg-[#D94E00] disabled:opacity-50 text-white px-5 py-3 text-sm font-semibold press-feedback cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <LoadingIcon className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Product Enquiry</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl border border-[#0D1B35]/15 px-4 py-3 text-sm font-semibold text-[#0D1B35] hover:bg-[#FCF2EC] press-feedback cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default EnquiryModal;
