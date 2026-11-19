'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircleIcon, CheckCircleIcon, LoadingIcon } from '@/components/ui/icons';
import { useStore } from '@/context/StoreContext';
import {
  buildProductWhatsAppMessage,
  formatAed,
  getEffectivePrice,
  isValidEmail,
} from '@/lib/storeLogic';
import { Modal } from '../ui/Modal';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export function EnquiryModal() {
  const { enquiryModalState, setEnquiryModalState, submitProductEnquiry } = useStore();
  const product = enquiryModalState.product;
  const initialQuantity = enquiryModalState.quantity || 1;
  const initialColor = enquiryModalState.color;

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedColor, setSelectedColor] = useState(initialColor ?? '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setQuantity(initialQuantity);
      setSelectedColor(initialColor || product.colors[0] || 'Standard');
      setSubmittedRef(null);
      setErrors({});
      setServerError(null);
      setMessage(`Hello, I would like to inquire about availability and custom finishing for ${product.name}.`);
    }
  }, [product, initialQuantity, initialColor]);

  if (!product) return null;

  const effectivePrice = getEffectivePrice(product);

  const handleClose = () => {
    if (!isSubmitting) {
      setEnquiryModalState({ product: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors: Record<string, string> = {};
    if (!customerName.trim()) nextErrors.customerName = 'Please enter your full name.';
    if (!email.trim() || !isValidEmail(email))
      nextErrors.email = 'Please enter a valid email address.';
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7)
      nextErrors.phone = 'Please enter a valid phone or WhatsApp number.';
    if (!message.trim()) nextErrors.message = 'Please add a short note about your enquiry.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      const record = await submitProductEnquiry({
        customerName: customerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productId: product.id,
        productName: product.name,
        quantity,
        selectedColor,
        message: message.trim(),
      });
      setSubmittedRef(record.referenceCode);
    } catch (err) {
      setServerError('An unexpected issue occurred while submitting. Please chat directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(product)}
      onClose={handleClose}
      title={submittedRef ? 'Enquiry Recorded' : `Enquire About ${product.name}`}
      subtitle={
        submittedRef
          ? 'Your enquiry has been received by our Dubai studio team'
          : `${formatAed(effectivePrice)} per unit · Indicative Price`
      }
      maxWidthClass="max-w-lg"
    >
      {submittedRef ? (
        <div className="space-y-5">
          <div className="rounded-2xl bg-[#FCF2EC] border border-[#0D1B35]/10 p-5 flex items-start gap-3.5">
            <CheckCircleIcon className="w-6 h-6 text-[#F45A00] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1.5">
              <p className="font-display font-bold text-[#0D1B35]">
                Reference: <span className="font-mono">{submittedRef}</span>
              </p>
              <p className="text-sm text-[#737373] leading-relaxed">
                Thank you! Your enquiry has been registered in our Dubai studio queue. For an immediate reply or to confirm color finishes, you can continue directly with our workshop team on WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <WhatsAppButton
              message={buildProductWhatsAppMessage(
                product.name,
                effectivePrice,
                quantity,
                selectedColor,
                product.sku
              )}
              label="Continue on WhatsApp"
              variant="primary"
              className="flex-1 justify-center"
            />
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[#0D1B35]/20 px-5 py-3 text-sm font-semibold text-[#0D1B35] hover:bg-[#FCF2EC] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600">
              <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
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
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Layla Al Hashimi"
                className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
              />
              {errors.customerName && (
                <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>
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
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 000 0000"
                className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="enq-email" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
              Email Address *
            </label>
            <input
              id="enq-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enq-color" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                Preferred Finish / Color
              </label>
              <select
                id="enq-color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
              >
                {product.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="enq-qty" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                Quantity
              </label>
              <input
                id="enq-qty"
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors tabular-nums"
              />
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
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Include details about color finishes, custom text, or delivery requirements in Dubai..."
              className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors resize-none"
            />
            {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
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
                  <span>Submitting Enquiry...</span>
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
