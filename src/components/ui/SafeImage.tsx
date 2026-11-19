'use client';

import { useState } from 'react';
import { PackageIcon } from '@/components/ui/icons';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FCF2EC] to-[#FCE3CB] text-[#0D1B35] p-4 text-center"
      >
        <PackageIcon className="w-8 h-8 text-[#F45A00]" aria-hidden="true" />
        {fallbackTitle && (
          <span className="text-xs font-medium text-[#0D1B35]/80 line-clamp-2">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
