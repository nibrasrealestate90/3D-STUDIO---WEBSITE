'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CloseIcon } from '@/components/ui/icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-2xl',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1B35]/65 backdrop-blur-[6px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className={`w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#0D1B35]/10 shadow-2xl text-[#0D1B35]`}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#0D1B35]/10 sticky top-0 bg-white z-10">
              <div>
                <h2 id="modal-title" className="font-display text-xl font-bold text-[#0D1B35]">
                  {title}
                </h2>
                {subtitle && <p className="text-sm text-[#737373] mt-0.5">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-[#737373] hover:text-[#0D1B35] hover:bg-[#FCF2EC] press-feedback shrink-0 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
