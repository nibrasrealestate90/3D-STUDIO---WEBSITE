'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { buildWhatsAppUrl } from '@/lib/storeLogic';

export function WhatsAppIcon({
  className = 'w-5 h-5',
  bubbleFill = 'currentColor',
  glyphFill = '#FFFFFF',
}: {
  className?: string;
  bubbleFill?: string;
  glyphFill?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M16.003 3C8.832 3 3 8.832 3 16.003c0 2.556.743 4.94 2.025 6.95L3.35 28.65l5.86-1.637A12.94 12.94 0 0 0 16.003 29C23.174 29 29 23.168 29 15.997 29 8.832 23.174 3 16.003 3Z"
        fill={bubbleFill}
      />
      <path
        d="M22.39 19.37c-.31-.155-1.833-.905-2.117-1.009-.284-.103-.49-.155-.697.155-.206.31-.8 1.008-.98 1.215-.181.207-.362.233-.672.078-.31-.155-1.31-.483-2.495-1.54-.922-.822-1.545-1.838-1.726-2.148-.18-.31-.02-.478.136-.632.14-.139.31-.362.465-.543.155-.18.207-.31.31-.517.104-.206.052-.387-.026-.542-.077-.155-.697-1.68-.955-2.3-.252-.605-.507-.523-.697-.533l-.594-.01c-.207 0-.543.077-.827.387-.284.31-1.085 1.06-1.085 2.585 0 1.525 1.11 2.999 1.266 3.206.155.207 2.186 3.338 5.295 4.68.74.32 1.317.51 1.767.653.742.236 1.418.203 1.952.123.595-.089 1.833-.749 2.091-1.473.259-.724.259-1.345.181-1.474-.077-.129-.284-.207-.594-.362Z"
        fill={glyphFill}
      />
    </svg>
  );
}

export function WhatsAppOutlineIcon({
  className = 'w-6 h-6',
  color = '#FFFFFF',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M16.003 3.5C9.097 3.5 3.5 9.097 3.5 16.003c0 2.456.714 4.748 1.946 6.68L3.83 28.17l5.636-1.574A12.44 12.44 0 0 0 16.003 28.5C22.909 28.5 28.5 22.903 28.5 15.997 28.5 9.097 22.909 3.5 16.003 3.5Z"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M21.95 19.16c-.29-.145-1.716-.847-1.982-.944-.266-.097-.459-.145-.652.145-.194.29-.75.944-.919 1.137-.169.194-.338.218-.628.073-.29-.145-1.226-.452-2.335-1.44-.863-.77-1.446-1.72-1.615-2.01-.169-.29-.018-.447.127-.592.13-.13.29-.338.435-.507.145-.17.194-.29.29-.483.097-.194.048-.363-.024-.508-.072-.145-.652-1.572-.894-2.152-.236-.567-.475-.49-.652-.499l-.556-.01c-.193 0-.508.073-.773.363-.266.29-1.016.992-1.016 2.419 0 1.427 1.04 2.806 1.185 3 .145.193 2.046 3.124 4.956 4.38.693.299 1.233.477 1.654.611.694.22 1.327.189 1.827.115.557-.083 1.715-.701 1.957-1.379.242-.677.242-1.258.17-1.379-.073-.12-.266-.193-.556-.338Z"
        fill={color}
      />
    </svg>
  );
}

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  variant?: 'primary' | 'outline' | 'navy' | 'compact' | 'whatsapp';
  className?: string;
  showPlaceholderNote?: boolean;
}

export function WhatsAppButton({
  message,
  label = 'WhatsApp Us',
  variant = 'whatsapp',
  className = '',
  showPlaceholderNote = false,
}: WhatsAppButtonProps) {
  const { settings } = useStore();
  const href = buildWhatsAppUrl(settings.whatsappNumber, message);

  const variantClasses =
    variant === 'whatsapp'
      ? 'bg-[#25D366] hover:bg-[#1EBE5B] text-white shadow-sm'
      : variant === 'primary'
      ? 'bg-[#25D366] hover:bg-[#1EBE5B] text-white shadow-sm'
      : variant === 'navy'
      ? 'bg-[#0D1B35] hover:bg-[#1B2D4E] text-[#FCF2EC]'
      : variant === 'compact'
      ? 'bg-[#25D366] hover:bg-[#1EBE5B] text-white px-4 py-2 text-sm'
      : 'border border-[#0D1B35]/20 bg-white hover:border-[#25D366] hover:text-[#128C7E] text-[#0D1B35]';

  const sizeClasses = variant === 'compact' ? '' : 'px-5 py-3 text-sm';

  return (
    <div className={showPlaceholderNote ? 'flex flex-col gap-1.5' : 'inline-flex'}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold press-feedback whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${variantClasses} ${sizeClasses} ${className}`}
      >
        <WhatsAppIcon
          className="w-5 h-5 shrink-0"
          bubbleFill={variant === 'outline' ? '#25D366' : '#FFFFFF'}
          glyphFill={variant === 'outline' ? '#FFFFFF' : '#25D366'}
        />
        <span>{label}</span>
      </a>
      {showPlaceholderNote && settings.isPlaceholderWhatsapp && (
        <span className="text-xs text-[#737373]">
          Studio WhatsApp: {settings.whatsappNumber}
        </span>
      )}
    </div>
  );
}

export function FloatingWhatsAppButton() {
  const { settings } = useStore();
  const pathname = usePathname();

  // On individual product pages, the buy/enquiry module already has a prominent primary WhatsApp CTA
  if (pathname?.startsWith('/products/')) {
    return null;
  }

  const href = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hello ${settings.storeName}! I'm browsing your Dubai 3D printing creations and would like to enquire.`
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      className="fixed bottom-4 right-4 z-30 inline-flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 sm:gap-2 rounded-full bg-[#25D366] hover:bg-[#1EBE5B] text-white text-sm font-semibold shadow-lg press-feedback focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsAppIcon className="w-6 h-6 shrink-0" bubbleFill="#FFFFFF" glyphFill="#25D366" />
      <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
    </a>
  );
}
