'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Ticket, Copy, Check, Clock, Heart } from 'lucide-react';
import { trackCopyVoucher } from '@/lib/analytics';
import { getCurrentShopeeSlot, VoucherItem, ShopeeSaleSlot } from '@/lib/marketing/time-slots';

export const TopVouchers: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentSlot, setCurrentSlot] = useState<ShopeeSaleSlot | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const slotInfo = getCurrentShopeeSlot();
    setCurrentSlot(slotInfo.slot);

    const interval = setInterval(() => {
      const updated = getCurrentShopeeSlot();
      setCurrentSlot(updated.slot);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = async (code: string) => {
    trackCopyVoucher(code);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch (err) {
      console.warn('Không thể sao chép mã voucher:', err);
    }
  };

  const vouchers = currentSlot?.vouchers || [];

  return (
    <div className="w-full max-w-xl text-left">
      <div className="flex items-center justify-between gap-2 border-b border-[#D6BDA5]/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFE0CE] text-[#A68165] shrink-0">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading text-sm font-bold text-[#725541] sm:text-base">Mã Ưu Đãi Bỉm Sữa Hot</h3>
              {currentSlot && (
                <span className="rounded bg-[#EFE0CE] px-1.5 py-0.5 text-[10px] font-bold text-[#A68165]">
                  {currentSlot.slotTag}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A68F7E]">Tự động áp khi mở App &bull; Cập nhật theo ngày</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-[#D6BDA5]/50 bg-[#FFFDF8] px-2 py-0.5 text-[10px] text-[#8E7764] shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A68165] animate-pulse" />
          <span>Vuốt ngang &rarr;</span>
        </div>
      </div>

      {/* Swipeable Carousel on Mobile, 2-col Grid on Desktop */}
      <div className="mt-3 flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
        {mounted && vouchers.length > 0 ? (
          vouchers.map((voucher) => {
            const isCopied = copiedCode === voucher.code;

            return (
              <div
                key={voucher.id}
                className="relative flex min-w-[260px] max-w-[280px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-[#D6BDA5]/60 bg-[#FFFDF8] p-3.5 shadow-2xs transition-all hover:border-[#A68165] sm:min-w-0 sm:max-w-none sm:shrink"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#EFE0CE] px-2 py-0.5 text-[10px] font-bold text-[#725541]">
                      {voucher.tag}
                    </span>
                    <span className="text-[10px] text-[#A68F7E] flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#A68F7E]" />
                      {voucher.expires}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-bold text-[#725541]">{voucher.discount}</div>
                  <div className="text-xs text-[#8E7764]">{voucher.title}</div>
                  <div className="mt-1 text-[11px] text-[#A68F7E]">{voucher.condition}</div>
                </div>

                {/* Footer với Mã & Nút Lưu */}
                <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-[#D6BDA5]/50 pt-2.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-[#A68F7E]">Mã voucher</span>
                    <span className="font-mono text-xs font-bold text-[#A68165]">{voucher.code}</span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className="inline-flex min-h-[30px] items-center gap-1.5 rounded-lg bg-[#EFE0CE] px-3 py-1 text-[11px] font-semibold text-[#725541] transition-all hover:bg-[#D6BDA5]/50 active:scale-95"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Đã lưu!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-[#A68165]" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 h-28 w-full animate-pulse rounded-2xl border border-[#D6BDA5]/40 bg-[#FFFDF8]" />
        )}
      </div>
    </div>
  );
};
