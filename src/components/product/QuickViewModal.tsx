'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, LayersIcon, RulerIcon, SparklesIcon } from '@/components/ui/icons';
import { useStore } from '@/context/StoreContext';
import { buildProductWhatsAppMessage, formatAed, getEffectivePrice } from '@/lib/storeLogic';
import { Modal } from '../ui/Modal';
import { SafeImage } from '../ui/SafeImage';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, setEnquiryModalState, categories } = useStore();

  if (!quickViewProduct) return null;

  const categoryName =
    categories.find((c) => c.id === quickViewProduct.categoryId)?.name ||
    '3D Printed';

  const effectivePrice = getEffectivePrice(quickViewProduct);
  const waMessage = buildProductWhatsAppMessage(
    quickViewProduct.name,
    effectivePrice,
    1,
    undefined,
    quickViewProduct.sku
  );

  return (
    <Modal
      open={Boolean(quickViewProduct)}
      onClose={() => setQuickViewProduct(null)}
      title={quickViewProduct.name}
      subtitle={`${categoryName} · SKU ${quickViewProduct.sku}`}
      maxWidthClass="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FCF2EC] border border-[#0D1B35]/10">
          <SafeImage
            src={quickViewProduct.images[0]}
            alt={quickViewProduct.name}
            fallbackTitle={quickViewProduct.name}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline gap-3 tabular-nums">
            <span className="font-display text-2xl font-bold text-[#0D1B35]">
              {formatAed(effectivePrice)}
            </span>
            {effectivePrice < quickViewProduct.price && (
              <span className="text-sm text-[#737373] line-through">
                {formatAed(quickViewProduct.price)}
              </span>
            )}
            <span className="text-xs text-[#737373]">Indicative studio price</span>
          </div>

          <p className="text-sm text-[#525252] leading-relaxed">{quickViewProduct.description}</p>

          <div className="space-y-2 pt-2 border-t border-[#0D1B35]/10 text-xs text-[#0D1B35]">
            <div className="flex items-center gap-2">
              <LayersIcon className="w-4 h-4 text-[#F45A00]" aria-hidden="true" />
              <span>
                <strong>Material:</strong> {quickViewProduct.material}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RulerIcon className="w-4 h-4 text-[#F45A00]" aria-hidden="true" />
              <span>
                <strong>Dimensions:</strong> {quickViewProduct.dimensions}
              </span>
            </div>
            {quickViewProduct.colors.length > 0 && (
              <div className="pt-1">
                <strong className="block mb-1.5">Available Finishes:</strong>
                <p className="text-[#525252]">{quickViewProduct.colors.join(' · ')}</p>
              </div>
            )}
            {quickViewProduct.supportsPersonalization && (
              <div className="flex items-center gap-2 text-[#963200] font-semibold pt-1">
                <SparklesIcon className="w-3.5 h-3.5 text-[#F45A00]" aria-hidden="true" />
                <span>Custom text or monogram personalizable upon request</span>
              </div>
            )}
          </div>

          <div className="pt-3 flex flex-col gap-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const p = quickViewProduct;
                  setQuickViewProduct(null);
                  setEnquiryModalState({ product: p });
                }}
                className="rounded-xl bg-[#0D1B35] hover:bg-[#F45A00] text-white px-4 py-3 text-sm font-semibold press-feedback cursor-pointer text-center shadow-xs"
              >
                Send Enquiry
              </button>
              <WhatsAppButton
                message={waMessage}
                label="Enquire on WhatsApp"
                variant="whatsapp"
              />
            </div>

            <p className="text-xs text-[#525252] text-center leading-relaxed">
              Order and delivery details confirmed directly via WhatsApp. No online checkout required.
            </p>

            <Link
              href={`/products/${quickViewProduct.slug}`}
              onClick={() => setQuickViewProduct(null)}
              className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#0D1B35] hover:text-[#F45A00] py-1 transition-colors"
            >
              <span>View Full Product Details &amp; Gallery</span>
              <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default QuickViewModal;
