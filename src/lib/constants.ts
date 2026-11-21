/**
 * Print Studio Dubai — Brand Constants & Configuration
 */

export const BRAND_CONFIG = {
  name: 'Print Studio Dubai',
  shortName: 'Print Studio',
  tagline: 'Precision 3D Printing & Additive Manufacturing in Dubai, UAE',
  description:
    'Dubai’s premier additive manufacturing studio. Specializing in rapid functional prototyping, engineering-grade carbon composites, architectural models, and bespoke batch production with 24-48h UAE dispatch.',
  city: 'Dubai',
  country: 'United Arab Emirates',
  location: process.env.NEXT_PUBLIC_STUDIO_LOCATION || 'Dubai Industrial City, Dubai, UAE',
  email: process.env.NEXT_PUBLIC_STUDIO_EMAIL || 'info@nibrasre.com',
  phone: process.env.NEXT_PUBLIC_STUDIO_PHONE || '+971 50 468 1889',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971504681889',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || '3dstudio_dubai',
  turnaroundTime: '24-48 Hours Express Delivery across UAE',
};

export const PRODUCT_CATEGORIES = [
  'All',
  'Architectural Models',
  'Engineering & Aerospace',
  'Automotive & Marine',
  'Industrial Enclosures',
  'Medical & Dental',
  'Art & Custom Design',
] as const;

export const AVAILABLE_MATERIALS = [
  {
    name: 'PLA+ / Tough PLA',
    grade: 'Concept & Display',
    description: 'High dimensional accuracy, smooth aesthetic surface finish, bioderived polymer.',
    tempRating: '55°C',
    tensile: '50 MPa',
  },
  {
    name: 'PETG / PETG-CF (Carbon Fiber)',
    grade: 'Functional & Impact',
    description: 'Chemical-resistant, weather-tolerant with chopped carbon fiber reinforcement.',
    tempRating: '75°C',
    tensile: '68 MPa',
  },
  {
    name: 'ASA / ABS-ESD',
    grade: 'Outdoor & Automotive',
    description: 'UV-stabilized, high heat deflection, anti-static electrostatic discharge safe.',
    tempRating: '95°C',
    tensile: '55 MPa',
  },
  {
    name: 'PA12-CF (Nylon Carbon Fiber)',
    grade: 'Aerospace & Industrial',
    description: 'Superior stiffness, structural load-bearing rigidity, oil and solvent resistant.',
    tempRating: '180°C',
    tensile: '105 MPa',
  },
  {
    name: 'TPU (Flexible 95A / 85A)',
    grade: 'Elastomeric Gaskets',
    description: 'High tear strength, abrasion resistance, vibration dampening, custom seals.',
    tempRating: '80°C',
    tensile: '40 MPa',
  },
  {
    name: 'Precision SLA Resin (Tough / Clear)',
    grade: 'Micro-Detail & Medical',
    description: 'Sub-25 micron resolution, optical clarity, dental master casts, jewelry masters.',
    tempRating: '65°C',
    tensile: '60 MPa',
  },
];

/**
 * Builds direct WhatsApp URL with pre-filled message
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const number = BRAND_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const message =
    customMessage ||
    `Hello ${BRAND_CONFIG.name}, I am reaching out from your website regarding a custom 3D printing project.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds direct Instagram URL
 */
export function getInstagramUrl(): string {
  const clean = BRAND_CONFIG.instagramHandle.replace('@', '');
  return `https://instagram.com/${clean}`;
}
