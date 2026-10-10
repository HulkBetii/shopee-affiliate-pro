'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Tag, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { ConvertApiResponse } from '@/app/api/convert/route';
import { trackOpenShopeeApp, trackCopyLink } from '@/lib/analytics';

interface ResultCardProps {
  data: NonNullable<ConvertApiResponse['data']>;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  // Đường link đầy đủ chuyển tiếp tới Shopee App
  const fullGoUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${data.goUrl}`
    : data.goUrl;

  const handleCopyLink = async () => {
    trackCopyLink(data.slug);
    try {
      await navigator.clipboard.writeText(fullGoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback nếu clipboard lỗi
      const textArea = document.createElement('textarea');
      textArea.value = fullGoUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        {/* Glow Background Accent */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#EE4D2D]/20 blur-3xl" />

        {/* Voucher Tag Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-3.5 py-1 text-xs font-bold text-orange-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>ĐÃ KÍCH HOẠT VOUCHER {data.discountPercentage}% (TỐI ĐA {data.maxDiscountAmount})</span>
          </div>

          {data.fromCache && (
            <span className="text-[11px] font-mono text-emerald-400">⚡ Fast Cache Hit</span>
          )}
        </div>

        {/* Product / Link Info */}
        <div className="mt-4 space-y-2 text-left">
          <div className="text-xs text-slate-400">Link sản phẩm chuẩn hóa:</div>
          <div className="truncate rounded-xl bg-slate-950/80 p-3 font-mono text-xs text-slate-300 border border-slate-800/80">
            {data.cleanUrl}
          </div>

          {(data.itemId || data.shopId) && (
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
              {data.itemId && (
                <span>Mã sản phẩm: <strong className="text-slate-200">#{data.itemId}</strong></span>
              )}
              {data.shopId && (
                <span>Mã Shop: <strong className="text-slate-200">#{data.shopId}</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Main CTA: Mở App Shopee To Bản */}
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={data.goUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOpenShopeeApp(data.slug, data.discountPercentage)}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#EE4D2D] via-orange-500 to-amber-500 p-4 text-center text-base font-extrabold text-white shadow-xl shadow-[#EE4D2D]/35 transition-all hover:scale-[1.01] hover:brightness-110 active:scale-95 sm:text-lg"
          >
            <Tag className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span>MỞ APP SHOPEE ÁP MÃ NGAY</span>
            <ArrowUpRight className="h-5 w-5" />
          </a>

          {/* Secondary Actions: Sao chép link & Mở Web */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Đã Sao Chép Link!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-orange-400" />
                  <span>Sao Chép Link Rút Gọn</span>
                </>
              )}
            </button>

            <a
              href={data.targetWithVoucherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-95"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              <span>Tiếp Tục Trên Web</span>
            </a>
          </div>
        </div>

        {/* Security & Guarantee Note */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Bảo mật 100% &bull; Mua sắm trực tiếp trên Shopee &bull; Giữ nguyên bảo hành đổi trả</span>
        </div>
      </div>
    </div>
  );
};
