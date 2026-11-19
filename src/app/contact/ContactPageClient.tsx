'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  InstagramIcon,
  LoadingIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '@/components/ui/icons';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useStore } from '@/context/StoreContext';
import { isValidEmail } from '@/lib/storeLogic';

export default function ContactPageClient() {
  const searchParams = useSearchParams();
  const defaultProduct = searchParams.get('product') || '';

  const { settings, submitProductEnquiry } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(
    defaultProduct ? `Enquiry: ${defaultProduct}` : 'General Studio Enquiry'
  );
  const [message, setMessage] = useState(
    defaultProduct
      ? `Hello 3D Studio, I am interested in inquiring about ${defaultProduct}. Please share more details on availability, material options, and delivery in Dubai.`
      : ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultProduct) {
      setSubject(`Enquiry: ${defaultProduct}`);
      setMessage(
        `Hello 3D Studio, I am interested in inquiring about ${defaultProduct}. Please share more details on availability, material options, and delivery in Dubai.`
      );
    }
  }, [defaultProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Please enter your full name.';
    if (!email.trim() || !isValidEmail(email))
      nextErrors.email = 'Please enter a valid email address.';
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7)
      nextErrors.phone = 'Please enter a valid phone or WhatsApp number.';
    if (!message.trim()) nextErrors.message = 'Please enter your enquiry message.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      const record = await submitProductEnquiry({
        customerName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productName: subject,
        quantity: 1,
        message: message.trim(),
      });
      setSubmittedRef(record.referenceCode);
    } catch (err) {
      setServerError('An error occurred submitting your enquiry. Please connect directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-20 space-y-10">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold text-[#F45A00] uppercase tracking-wider">Get in Touch</p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#0D1B35] tracking-tight">
          Contact Our Dubai Studio
        </h1>
        <p className="text-base text-[#737373] leading-relaxed">
          Have questions about corporate bulk orders, material finishes, or courier dispatch in the
          UAE? Connect with our Al Quoz workshop team directly or submit a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Coordinates & Channels */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-white border border-[#0D1B35]/10 p-6 space-y-5 shadow-xs">
            {/* Location with Google Maps directions */}
            <div className="flex items-start gap-3.5">
              <MapPinIcon className="w-5 h-5 text-[#F45A00] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-[#0D1B35]">Studio Location</h2>
                <p className="text-sm text-[#737373] mt-0.5">{settings.storeLocation}</p>
                <a
                  href="https://maps.google.com/?q=Al+Quoz+Creative+District+Dubai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#F45A00] hover:underline font-semibold inline-flex items-center gap-1 mt-1.5"
                >
                  <span>Directions on Google Maps</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3.5">
              <ClockIcon className="w-5 h-5 text-[#F45A00] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-[#0D1B35]">Workshop Hours</h2>
                <p className="text-sm text-[#525252] mt-0.5">{settings.businessHours}</p>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  Overnight additive printing runs 24/7
                </p>
              </div>
            </div>

            {/* Phone Line */}
            <div className="flex items-start gap-3.5">
              <PhoneIcon className="w-5 h-5 text-[#F45A00] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-[#0D1B35]">Phone Line</h2>
                <a
                  href={`tel:${settings.whatsappNumber.replace(/[^0-9+]/g, '')}`}
                  className="text-sm text-[#737373] hover:text-[#F45A00] transition-colors mt-0.5 block font-mono"
                >
                  {settings.whatsappNumber}
                </a>
              </div>
            </div>

            {/* Studio Email */}
            <div className="flex items-start gap-3.5">
              <MailIcon className="w-5 h-5 text-[#F45A00] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-[#0D1B35]">Studio Email</h2>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="text-sm text-[#737373] hover:text-[#F45A00] transition-colors mt-0.5 block"
                >
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            {/* Instagram Link */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#c13584] via-[#e1306c] via-[#fd1d1d] to-[#f77737] text-white inline-flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <InstagramIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-display text-sm font-bold text-[#0D1B35]">Instagram Showcase</h2>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#E1306C] hover:underline mt-0.5 inline-block font-semibold"
                >
                  {settings.instagramHandle}
                </a>
              </div>
            </div>
          </div>

          {/* Instant WhatsApp Support Banner */}
          <div className="rounded-2xl bg-[#0D1B35] text-[#FCF2EC] p-6 space-y-4 shadow-sm">
            <h2 className="font-display text-lg font-bold">Direct WhatsApp Consultation</h2>
            <p className="text-xs text-[#FCF2EC]/80 leading-relaxed">
              Connect directly with our Dubai studio team for quick quotes, custom gifts, and material guidance.
            </p>
            <WhatsAppButton
              message={`Hello ${settings.storeName}! I have an inquiry about 3D printing services in Dubai.`}
              label="Chat on WhatsApp"
              variant="primary"
              className="w-full justify-center"
              showPlaceholderNote
            />
          </div>
        </div>

        {/* Right Column: Contact Enquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#0D1B35]/10 p-6 sm:p-8 shadow-xs">
          {submittedRef ? (
            <div className="space-y-4 py-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center border border-emerald-500/20">
                <CheckCircleIcon className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#0D1B35]">
                Enquiry Recorded Successfully
              </h2>
              <p className="text-sm text-[#0D1B35]">
                Reference Code: <span className="font-mono font-bold text-[#F45A00]">{submittedRef}</span>
              </p>
              <p className="text-sm text-[#737373] leading-relaxed">
                Your message has been forwarded to our Dubai studio engineering queue. Our team typically replies within 2 to 4 business hours. For immediate assistance, feel free to message us on WhatsApp.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <WhatsAppButton
                  message={`Hello ${settings.storeName}, I submitted an enquiry (Ref: ${submittedRef}). Connecting to follow up.`}
                  label="Connect via WhatsApp"
                  variant="primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setName('');
                    setEmail('');
                    setPhone('');
                    setMessage('');
                    setSubmittedRef(null);
                  }}
                  className="rounded-xl border border-[#0D1B35]/20 hover:border-[#0D1B35] text-[#0D1B35] px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <h2 className="font-display text-xl font-bold text-[#0D1B35]">
                Send Us a Message
              </h2>

              {serverError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600">
                  <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 000 0000"
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="General Studio Enquiry">General Studio Enquiry</option>
                    <option value="Corporate Bulk Gifting">Corporate Bulk Gifting</option>
                    <option value="Custom Order Follow-up">Custom Order Follow-up</option>
                    <option value="Studio Visit Appointment">Studio Visit Appointment</option>
                    {defaultProduct && (
                      <option value={`Enquiry: ${defaultProduct}`}>Enquiry: {defaultProduct}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-msg" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                  Message *
                </label>
                <textarea
                  id="contact-msg"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our Dubai 3D printing engineering team help?"
                  className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors resize-none"
                />
                {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-[#F45A00] hover:bg-[#D94E00] disabled:opacity-50 text-white px-7 py-3 text-sm font-semibold press-feedback cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <LoadingIcon className="w-4 h-4 animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <span>Send Enquiry</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
