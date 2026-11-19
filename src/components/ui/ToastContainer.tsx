'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from '@/components/ui/icons';

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      duration={4000}
      closeButton={true}
      icons={{
        success: <CheckCircleIcon className="w-5 h-5 text-[#F45A00]" />,
        info: <InfoIcon className="w-5 h-5 text-[#0D1B35]" />,
        error: <AlertCircleIcon className="w-5 h-5 text-red-600" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!bg-white !text-[#0D1B35] !border !border-[#0D1B35]/12 !shadow-xl !rounded-2xl !p-4 !font-sans',
          title: '!font-display !font-bold !text-sm !text-[#0D1B35]',
          description: '!text-[#737373] !text-xs !mt-1 !leading-relaxed',
        },
      }}
    />
  );
}

export default ToastContainer;
