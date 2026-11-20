import React from 'react';
import type { Metadata } from 'next';
import CustomPrintPageClient from '../custom-print/CustomPrintPageClient';

export const metadata: Metadata = {
  title: 'Custom 3D Printing & Prototyping — 3D Studio Dubai',
  description:
    'Request custom 3D printing and rapid prototyping for functional parts, architectural models, and bespoke gifts in Dubai, UAE.',
  alternates: {
    canonical: '/custom-print/',
  },
};

export default function CustomPage() {
  return <CustomPrintPageClient />;
}
