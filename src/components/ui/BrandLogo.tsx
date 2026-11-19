'use client';

import { STUDIO_LOGO_IMAGE } from '@/lib/mockData';

interface BrandLogoProps {
  storeName: string;
  variant?: 'dark' | 'light';
  logoStyle?: 'geometric' | 'monogram';
}

export function BrandLogo({
  storeName,
  variant = 'dark',
  logoStyle = 'geometric',
}: BrandLogoProps) {
  const textColor = variant === 'light' ? 'text-[#FCF2EC]' : 'text-[#0D1B35]';
  const badgeRing =
    variant === 'light'
      ? 'ring-2 ring-white/25 shadow-sm'
      : 'ring-1 ring-[#0D1B35]/15 shadow-xs';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      {logoStyle === 'geometric' ? (
        <span
          className={`inline-flex items-center justify-center w-11 h-11 rounded-full overflow-hidden bg-white shrink-0 ${badgeRing}`}
        >
          <img
            src={STUDIO_LOGO_IMAGE}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover scale-[1.185] select-none pointer-events-none"
          />
        </span>
      ) : (
        <svg
          width="36"
          height="36"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect
            x="4"
            y="4"
            width="32"
            height="32"
            rx="10"
            fill={variant === 'light' ? '#F45A00' : '#0D1B35'}
          />
          <text
            x="20"
            y="24.5"
            textAnchor="middle"
            fontFamily="Outfit, sans-serif"
            fontWeight="800"
            fontSize="14"
            fill="#FCF2EC"
          >
            3D
          </text>
        </svg>
      )}
      <span className={`font-display text-lg font-bold tracking-tight ${textColor}`}>
        {storeName}
      </span>
    </span>
  );
}
