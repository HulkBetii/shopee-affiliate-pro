'use client';

import React, { useState } from 'react';
import { Flame, Ticket, Copy, Check, Clock } from 'lucide-react';
import { trackCopyVoucher } from '@/lib/analytics';

interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discount: string;
  condition: string;
  tag: string;
  expires: string;
}

const HOT_VOUCHERS: VoucherItem[] = [
  {
    id: 'v1',
    code: 'METAPARTNER25',
    title: 'Voucher Toàn Sàn Đối Tác Meta',
    discount: 'Giảm 25% (Tối đa 500k)',
    condition: 'Áp dụng cho mọi đơn hàng khi mở qua ShopeeLink Pro',
    tag: 'Độc Quyền',
    expires: 'Hôm nay',
  },
  {
    id: 'v2',
    code: 'SHOPEEVIDEO15',
    title: 'Mã Giảm Giá Shopee Video',
    discount: 'Giảm 15% (Tối đa 70k)',
    condition: 'Đơn từ 100k, áp dụng hàng thời trang & đời sống',
    tag: 'Hot Video',
    expires: 'Còn 12h',
  },
  {
    id: 'v3',
    code: 'FREESHIPXTRA',
    title: 'Miễn Phí Vận Chuyển Toàn Quốc',
    discount: 'Freeship 0đ (Tối đa 300k)',
    condition: 'Áp dụng cho tất cả gian hàng FreeShip Xtra',
    tag: 'FreeShip',
    expires: 'Không giới hạn',
  },
  {
    id: 'v4',
    code: 'MALLPRO10',
    title: 'Ưu Đãi Chính Hãng Shopee Mall',
    discount: 'Giảm 10% (Tối đa 100k)',
    condition: 'Hàng chính hãng 100% Shopee Mall',
    tag: 'Chính Hãng',
    expires: 'Hôm nay',
  },
];

export const TopVouchers: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    trackCopyVoucher(code);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.warn('Không thể sao chép mã voucher:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-[#EE4D2D] shrink-0">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white sm:text-base">Top Voucher Hot Hôm Nay</h3>
            <p className="text-[11px] text-slate-400">Tự động kích hoạt khi mở App Shopee</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Vuốt ngang &rarr;</span>
        </div>
      </div>

      {/* Swipeable Carousel on Mobile, 2-col Grid on Desktop */}
      <div className="mt-4 flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
        {HOT_VOUCHERS.map((voucher) => {
          const isCopied = copiedCode === voucher.code;

          return (
            <div
              key={voucher.id}
              className="glass-panel relative flex min-w-[260px] max-w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl p-4 transition-all hover:border-orange-500/40 sm:min-w-0 sm:max-w-none sm:shrink"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                    {voucher.tag}
                  </span>
                  <span className="text-[10px] text-slate-400">{voucher.expires}</span>
                </div>

                <div className="mt-2 text-sm font-bold text-slate-100">{voucher.discount}</div>
                <div className="text-xs text-slate-400">{voucher.title}</div>
                <div className="mt-1 text-[11px] text-slate-500">{voucher.condition}</div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span className="font-mono text-xs font-semibold text-orange-300">{voucher.code}</span>
                <button
                  onClick={() => handleCopyCode(voucher.code)}
                  className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white active:scale-95"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Đã lưu</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-slate-400" />
                      <span>Chép mã</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
