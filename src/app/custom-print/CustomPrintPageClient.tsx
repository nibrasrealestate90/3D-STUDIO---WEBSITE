'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FileIcon,
  LayersIcon,
  LoadingIcon,
  ShieldCheckIcon,
} from '@/components/ui/icons';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { useStore } from '@/context/StoreContext';
import type { MaterialOption } from '@/lib/types';
import {
  buildCustomPrintWhatsAppMessage,
  validateCustomPrintForm,
} from '@/lib/storeLogic';

const MATERIALS: MaterialOption[] = [
  'PLA',
  'PETG',
  'ABS',
  'Resin',
  'Not Sure — Recommend for Me',
];

const COLORS = ['White', 'Black', 'Orange', 'Red', 'Blue', 'Custom Color'];

export function CustomPrintPageClient() {
  const { submitCustomPrintRequest, settings } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [cadLink, setCadLink] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState<MaterialOption>('PLA');
  const [color, setColor] = useState('Orange');
  const [customColorText, setCustomColorText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [budgetRangeAed, setBudgetRangeAed] = useState('AED 200 – 500');
  const [requiredDate, setRequiredDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const resolvedColor =
      color === 'Custom Color' && customColorText.trim()
        ? `Custom: ${customColorText.trim()}`
        : color;

    const validationErrors = validateCustomPrintForm({
      fullName,
      email,
      whatsappNumber,
      projectName,
      projectDescription,
      dimensions,
      material,
      color: resolvedColor,
      quantity,
      budgetRangeAed,
      requiredDate,
    });

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      const fullDesc = [
        projectDescription.trim(),
        cadLink.trim() ? `CAD/Cloud Link: ${cadLink.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const record = await submitCustomPrintRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        whatsappNumber: whatsappNumber.trim(),
        projectName: projectName.trim(),
        projectDescription: fullDesc,
        dimensions: dimensions.trim() || 'Standard Studio Sizing',
        material,
        color: resolvedColor,
        quantity,
        budgetRangeAed,
        requiredDate,
        additionalNotes: additionalNotes.trim(),
      });
      setSubmittedRef(record.referenceCode);
    } catch (err) {
      setServerError('Could not submit request over the network. You can discuss your project directly with our studio team on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setFullName('');
    setEmail('');
    setWhatsappNumber('');
    setProjectName('');
    setProjectDescription('');
    setCadLink('');
    setDimensions('');
    setMaterial('PLA');
    setColor('Orange');
    setCustomColorText('');
    setQuantity(1);
    setBudgetRangeAed('AED 200 – 500');
    setRequiredDate('');
    setAdditionalNotes('');
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-10">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold text-[#963200] uppercase tracking-wider">
          Custom Fabrication &amp; Rapid Prototyping
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#0D1B35] tracking-tight">
          Request a Custom 3D Print Quote
        </h1>
        <p className="text-base text-[#525252] leading-relaxed max-w-2xl [text-wrap:pretty]">
          From personalized corporate gifting to mechanical prototypes, our Dubai studio transforms your 3D models into physical reality. Fill out your project brief below for an itemized pro-forma quote in AED.
        </p>
      </div>

      {submittedRef ? (
        <div className="rounded-3xl bg-white border border-[#0D1B35]/10 p-8 sm:p-12 text-center space-y-6 shadow-sm max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center border border-emerald-500/20">
            <CheckCircleIcon className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B35]">
              Quote Request Submitted
            </h2>
            <p className="text-sm text-[#0D1B35]">
              RFQ Reference:{' '}
              <span className="font-mono font-bold text-[#963200]">{submittedRef}</span>
            </p>
          </div>

          <div className="border-l-2 border-[#F45A00] pl-4 text-left text-xs text-[#0D1B35] space-y-2 py-1">
            <p className="font-semibold text-sm text-[#0D1B35]">What happens next?</p>
            <ul className="space-y-1.5 list-disc pl-4 text-[#525252]">
              <li>Our Dubai engineering team will review your model geometry, slicing orientation, and volume.</li>
              <li>You will receive an itemized quote with material recommendations and lead time within 2 to 4 business hours.</li>
              <li>If you have 3D files (.STL, .STEP, .3MF) to share, you can attach them directly to our studio WhatsApp.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <WhatsAppButton
              message={buildCustomPrintWhatsAppMessage(projectName, submittedRef)}
              label="Follow Up on WhatsApp"
              variant="primary"
            />
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-[#0D1B35]/20 px-5 py-3 text-sm font-semibold text-[#0D1B35] hover:bg-[#FCF2EC] transition-colors cursor-pointer"
            >
              Submit Another Project
            </button>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[#737373] hover:text-[#0D1B35] px-3 py-2"
            >
              Browse Catalogue
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-8 bg-white rounded-2xl border border-[#0D1B35]/10 p-6 sm:p-8 space-y-6 shadow-sm"
          >
            {serverError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600">
                <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* 1. Contact Details */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0D1B35] pb-2 border-b border-[#0D1B35]/10">
                1. Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cp-name" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="cp-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Al Maktoum"
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cp-email" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="cp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.ae"
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="cp-whatsapp" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                  WhatsApp Number *
                </label>
                <input
                  id="cp-whatsapp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+971 50 000 0000"
                  className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                />
                {errors.whatsappNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.whatsappNumber}</p>
                )}
              </div>
            </div>

            {/* 2. Project Details & CAD Sharing */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0D1B35] pb-2 border-b border-[#0D1B35]/10">
                2. Project Brief &amp; 3D File
              </h2>

              <div>
                <label htmlFor="cp-project" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                  Project Title *
                </label>
                <input
                  id="cp-project"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Sensor Enclosure Prototype Rev B or Bespoke Trophy"
                  className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                />
                {errors.projectName && (
                  <p className="text-xs text-red-600 mt-1">{errors.projectName}</p>
                )}
              </div>

              <div>
                <label htmlFor="cp-desc" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                  Project Description &amp; Technical Requirements *
                </label>
                <textarea
                  id="cp-desc"
                  rows={4}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your design, mechanical expectations, surface finish, structural loading, or intended environment (indoor/outdoor)..."
                  className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors resize-none"
                />
                {errors.projectDescription && (
                  <p className="text-xs text-red-600 mt-1">{errors.projectDescription}</p>
                )}
              </div>

              {/* Secure CAD File Sharing Alternative Container */}
              <div className="rounded-2xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <FileIcon className="w-5 h-5 text-[#F45A00] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D1B35]">
                      CAD Model &amp; File Sharing
                    </h3>
                    <p className="text-xs text-[#737373] leading-relaxed">
                      To protect private CAD assets with maximum confidentiality, provide a secure cloud link below (Google Drive, WeTransfer, OneDrive, or Onshape), or share your <span className="font-mono font-semibold text-[#0D1B35]">.STL, .STEP, or .3MF</span> file directly to our engineers on WhatsApp after submitting.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="cp-cad-link" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Cloud Download / Viewer Link (Optional)
                  </label>
                  <input
                    id="cp-cad-link"
                    type="url"
                    value={cadLink}
                    onChange={(e) => setCadLink(e.target.value)}
                    placeholder="https://wetransfer.com/... or https://drive.google.com/..."
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-white px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Specifications & Timeline */}
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[#0D1B35] pb-2 border-b border-[#0D1B35]/10">
                3. Specifications &amp; Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cp-dimensions" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Desired Dimensions (L x W x H)
                  </label>
                  <input
                    id="cp-dimensions"
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 150 x 80 x 40 mm"
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="cp-material" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Material Preference
                  </label>
                  <select
                    id="cp-material"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as MaterialOption)}
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors cursor-pointer"
                  >
                    {MATERIALS.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#0D1B35] mb-2">
                  Color Preference
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-pressed={color === c}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border press-feedback cursor-pointer ${
                        color === c
                          ? 'border-[#F45A00] bg-[#F45A00] text-white shadow-xs'
                          : 'border-[#0D1B35]/15 bg-[#FCF2EC]/40 text-[#0D1B35] hover:border-[#0D1B35]/40'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {color === 'Custom Color' && (
                  <input
                    type="text"
                    value={customColorText}
                    onChange={(e) => setCustomColorText(e.target.value)}
                    placeholder="Specify Pantone, RAL, or dual-color silk..."
                    aria-label="Custom color description"
                    className="mt-2.5 w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="cp-qty" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Quantity *
                  </label>
                  <input
                    id="cp-qty"
                    type="number"
                    min={1}
                    max={1000}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm tabular-nums text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                  {errors.quantity && (
                    <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cp-budget" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Budget Range (AED)
                  </label>
                  <select
                    id="cp-budget"
                    value={budgetRangeAed}
                    onChange={(e) => setBudgetRangeAed(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Under AED 200">Under AED 200</option>
                    <option value="AED 200 – 500">AED 200 – 500</option>
                    <option value="AED 500 – 1,000">AED 500 – 1,000</option>
                    <option value="AED 1,000 – 2,500">AED 1,000 – 2,500</option>
                    <option value="AED 2,500+ (Corporate/Batch)">AED 2,500+ (Corporate/Batch)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cp-date" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                    Target Deadline
                  </label>
                  <input
                    id="cp-date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2.5 text-sm text-[#0D1B35] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cp-notes" className="block text-xs font-semibold text-[#0D1B35] mb-1.5">
                  Additional Notes / Tolerances (Optional)
                </label>
                <textarea
                  id="cp-notes"
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Brass threaded inserts, heat resistance requirements, packaging preferences..."
                  className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 px-3.5 py-2 text-sm text-[#0D1B35] placeholder:text-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-[#F45A00] hover:bg-[#D94E00] disabled:opacity-50 text-white px-8 py-3.5 text-sm font-semibold press-feedback cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <LoadingIcon className="w-4 h-4 animate-spin" />
                    <span>Submitting Quote Request...</span>
                  </>
                ) : (
                  <span>Submit Custom Quote Request</span>
                )}
              </button>
            </div>
          </form>

          {/* Right Sidebar: Guide & Support */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* WhatsApp Support Box */}
            <div className="rounded-2xl bg-[#0D1B35] text-[#FCF2EC] p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#F45A00]">
                <ClockIcon className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Fast WhatsApp Review</span>
              </div>
              <h2 className="font-display text-lg font-bold">Have an STL File Ready?</h2>
              <p className="text-xs text-[#FCF2EC]/80 leading-relaxed">
                Connect directly with our workshop engineers. Send your CAD model, request material advice, or ask questions on WhatsApp.
              </p>
              <WhatsAppButton
                message={buildCustomPrintWhatsAppMessage(projectName)}
                label="Direct WhatsApp Consultation"
                variant="primary"
                className="w-full justify-center"
              />
            </div>

            {/* Material Guide */}
            <div className="rounded-2xl bg-white border border-[#0D1B35]/10 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-[#F45A00]">
                <LayersIcon className="w-5 h-5" />
                <h2 className="font-display text-sm font-bold text-[#0D1B35]">
                  Dubai Studio Materials
                </h2>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="border-b border-[#0D1B35]/8 pb-2.5">
                  <p className="font-bold text-[#0D1B35]">PLA+ Bio-Polymer</p>
                  <p className="text-[#737373] mt-0.5">
                    Best for decorative pieces, vases, desk organizers, and architectural models. Clean, rigid finish.
                  </p>
                </div>

                <div className="border-b border-[#0D1B35]/8 pb-2.5">
                  <p className="font-bold text-[#0D1B35]">PETG (Polyethylene)</p>
                  <p className="text-[#737373] mt-0.5">
                    High impact strength, UV-resistant, and heat-tolerant up to 75°C. Ideal for brackets and enclosures.
                  </p>
                </div>

                <div className="border-b border-[#0D1B35]/8 pb-2.5">
                  <p className="font-bold text-[#0D1B35]">ABS / ASA Engineering</p>
                  <p className="text-[#737373] mt-0.5">
                    Tough, thermally resilient up to 95°C for automotive and outdoor functional fixtures.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-[#0D1B35]">High-Resolution SLA Resin</p>
                  <p className="text-[#737373] mt-0.5">
                    Smooth microscopic 0.05mm layer precision for detailed jewelry masters, miniatures, and presentation prototypes.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#0D1B35]/8 flex items-center gap-2 text-xs text-[#525252]">
                <ShieldCheckIcon className="w-4 h-4 text-[#F45A00] shrink-0" />
                <span>All prints inspected in our Al Quoz studio before dispatch.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomPrintPageClient;
