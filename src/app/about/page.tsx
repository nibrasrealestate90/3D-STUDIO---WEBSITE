import React from 'react';
import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About Our Dubai Workshop — 3D Studio',
  description:
    'Learn about 3D Studio in Dubai, UAE. Multi-material additive printing, precision hardware, and local UAE delivery.',
  openGraph: {
    title: 'About 3D Studio Dubai',
    description:
      'Learn about 3D Studio in Dubai, UAE. Multi-material additive printing, precision hardware, and local UAE delivery.',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
