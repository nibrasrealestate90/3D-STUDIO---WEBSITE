import React from 'react';
import type { Metadata } from 'next';
import CustomPrintPageClient from '../custom-print/CustomPrintPageClient';

export const metadata: Metadata = {
  title: 'Custom 3D Printing & Prototyping — 3D Studio Dubai',
  description:
    'Upload your 3D CAD files (.STL, .OBJ, .3MF, .STEP) for custom additive manufacturing, prototyping, and bespoke gifts in Dubai, UAE.',
};

export default function CustomPage() {
  return <CustomPrintPageClient />;
}
