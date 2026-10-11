'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Ticket, Copy, Check, Clock, Sparkles } from 'lucide-react';
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

    // Cập nhật lại slot mỗi phút nếu sang khung giờ mới
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
    <div className="w-full max-w-2xl text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-[#EE4D2D] shrink-0">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white sm:text-base">Top Voucher Săn Sale Đang Mở</h3>
              {currentSlot && (
                <span className="rounded bg-orange-500/20 px-1.5 py-0.2 text-[10px] font-bold text-orange-400">
                  {currentSlot.slotTag}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Tự động kích hoạt khi mở App Shopee &bull; Cập nhật theo phiên</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Vuốt ngang &rarr;</span>
        </div>
      </div>

      {/* Swipeable Carousel on Mobile, 2-col Grid on Desktop */}
      <div className="mt-4 flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
        {mounted && vouchers.length > 0 ? (
          vouchers.map((voucher) => {
            const isCopied = copiedCode === voucher.code;

            return (
              <div
                key={voucher.id}
                className="relative flex min-w-[270px] max-w-[290px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/90 p-4 shadow-lg transition-all hover:border-orange-500/40 sm:min-w-0 sm:max-w-none sm:shrink"
              >
                {/* Ticket Notches (Vết cắt vé xem phim hai cạnh) */}
                <div className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-r border-slate-800/90 bg-slate-950" />
                <div className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-l border-slate-800/90 bg-slate-950" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                      {voucher.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {voucher.expires}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-bold text-slate-100">{voucher.discount}</div>
                  <div className="text-xs text-slate-400">{voucher.title}</div>
                  <div className="mt-1 text-[11px] text-slate-400">{voucher.condition}</div>

                  {/* Scarcity Bar (Vạch khan hiếm % đã sử dụng) */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1">
                      <span className="text-slate-400">Đã dùng:</span>
                      <span className="font-bold text-orange-400">{voucher.usedPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-[#EE4D2D]"
                        style={{ width: `${voucher.usedPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer với Mã & Nút Lưu */}
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-800/90 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">Mã voucher</span>
                    <span className="font-mono text-xs font-black text-orange-300">{voucher.code}</span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg bg-gradient-to-r from-slate-800 to-slate-800/90 px-3 py-1 text-[11px] font-medium text-slate-200 transition-all hover:from-orange-600 hover:to-orange-500 hover:text-white active:scale-95"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Đã lưu mã!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-slate-400" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 h-32 w-full animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
        )}
      </div>
    </div>
  );
};
