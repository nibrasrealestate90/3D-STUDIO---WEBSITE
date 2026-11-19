'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRightIcon, CheckCircleIcon, MapPinIcon } from '@/components/ui/icons';
import { SafeImage } from '@/components/ui/SafeImage';
import { useStore } from '@/context/StoreContext';
import { COVER_REFERENCE_IMAGE, STUDIO_LOGO_IMAGE, WORKSHOP_IMAGE } from '@/lib/mockData';

export default function AboutPageClient() {
  const { settings } = useStore();

  const capabilities = [
    'Multi-material FDM & SLA resin printing calibrated in-house',
    'Personalized English & Arabic raised typography and monograms',
    'Small-batch corporate gifting for Dubai conferences & hospitality',
    'Same-week prototyping & courier dispatch across all UAE Emirates',
  ];

  const steps = [
    {
      step: '01',
      title: 'Share Your Idea or CAD File',
      description:
        'Submit your project brief with dimensions or share your 3D CAD model (.STL, .STEP, .3MF) for confidential engineering review.',
    },
    {
      step: '02',
      title: 'Design & Material Review',
      description:
        'Our Dubai engineers inspect wall thicknesses, slicing orientation, and suggest the ideal filament (PLA+, PETG, ABS, or Resin).',
    },
    {
      step: '03',
      title: 'Calibrated Printing & Inspection',
      description:
        'Fabricated with calibrated hardware at 0.12–0.16mm layer resolution, followed by surface deburring and manual dimensional checks.',
    },
    {
      step: '04',
      title: 'Studio Pickup or UAE Courier',
      description:
        'Securely packaged and dispatch-boxed for direct collection at our Al Quoz workshop or express delivery across Dubai and the UAE.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-20 space-y-16 sm:space-y-20">
      {/* 1. Hero Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <p className="text-xs font-semibold text-[#963200] uppercase tracking-wider">
            About {settings.storeName}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#0D1B35] leading-tight [text-wrap:balance]">
            Crafted Layer by Layer in the Heart of Dubai.
          </h1>
          <p className="text-base text-[#525252] leading-relaxed [text-wrap:pretty]">
            {settings.storeName} bridges modern additive manufacturing with warm, tactile
            product design. Based in {settings.storeLocation}, we produce limited-run home
            decor, personalized gifts, executive desk accessories, and bespoke prototypes
            for individuals and businesses across the UAE.
          </p>
          <ul className="space-y-2.5 pt-2">
            {capabilities.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#0D1B35]">
                <CheckCircleIcon className="w-4 h-4 text-[#F45A00] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F45A00] hover:bg-[#D94E00] text-white px-6 py-3 text-sm font-semibold press-feedback cursor-pointer shadow-xs"
            >
              <span>Explore Catalogue</span>
              <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/custom-print"
              className="rounded-xl border border-[#0D1B35]/20 bg-white hover:border-[#0D1B35] px-6 py-3 text-sm font-semibold text-[#0D1B35] press-feedback cursor-pointer"
            >
              Start a Custom Print
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#0D1B35]/10 shadow-sm">
            <SafeImage
              src={WORKSHOP_IMAGE}
              alt={`${settings.storeName} prototyping desk and studio printers`}
              fallbackTitle="Dubai Studio Workbench"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden bg-white border border-[#0D1B35]/10 shadow-sm">
            <SafeImage
              src={COVER_REFERENCE_IMAGE}
              alt={`${settings.storeName} Dubai visual identity showcase`}
              fallbackTitle="Dubai Brand Banner"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* 2. Studio Workflow / Process Section */}
      <section className="space-y-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#F45A00] uppercase tracking-wider">
            Our Studio Workflow
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B35] mt-1">
            How We Fabricate Your Creations
          </h2>
          <p className="text-sm text-[#737373] mt-2">
            A reliable 4-step sequence ensuring precise tolerances, verified materials, and smooth finishes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="rounded-2xl bg-white border border-[#0D1B35]/10 p-6 space-y-2.5 shadow-xs hover:border-[#F45A00]/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-[#963200] uppercase tracking-wider">
                  Phase {s.step}
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-[#0D1B35]">
                {s.title}
              </h3>
              <p className="text-xs text-[#525252] leading-relaxed [text-wrap:pretty]">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Verified Statistics / Infrastructure Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-[#0D1B35] text-[#FCF2EC] p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-lg"
      >
        <div className="md:col-span-3 flex justify-center">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-white ring-4 ring-white/20 shadow-xl">
            <SafeImage
              src={STUDIO_LOGO_IMAGE}
              alt={`${settings.storeName} studio emblem`}
              fallbackTitle={settings.storeName}
              className="w-full h-full object-cover scale-[1.185]"
            />
          </div>
        </div>
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="font-display text-3xl font-bold text-[#F45A00] tabular-nums">0.12 mm</p>
            <p className="text-sm font-semibold mt-1">Calibrated Layer Height</p>
            <p className="text-xs text-[#FCF2EC]/70 mt-1">
              Smooth tactile surfaces with minimal visible layer lines on curved forms.
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-[#FCE3CB] tabular-nums">2–4 Days</p>
            <p className="text-sm font-semibold mt-1">Local Dubai Turnaround</p>
            <p className="text-xs text-[#FCF2EC]/70 mt-1">
              No overseas shipping delays—printed, cured, and finished in Al Quoz.
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-white flex items-center gap-2">
              <MapPinIcon className="w-6 h-6 text-[#F45A00]" aria-hidden="true" />
              <span>UAE Delivery</span>
            </p>
            <p className="text-sm font-semibold mt-1">Courier &amp; Studio Pickup</p>
            <p className="text-xs text-[#FCF2EC]/70 mt-1">
              Direct delivery across Dubai, Abu Dhabi, Sharjah, and Northern Emirates.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
