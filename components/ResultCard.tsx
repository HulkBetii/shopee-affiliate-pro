'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Tag, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ConvertApiResponse } from '@/app/api/convert/route';
import { trackOpenShopeeApp, trackCopyLink } from '@/lib/analytics';

interface ResultCardProps {
  data: NonNullable<ConvertApiResponse['data']>;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Nhận diện thiết bị di động
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  // Đường link đầy đủ chuyển tiếp tới Shopee App
  const fullGoUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${data.goUrl}`
    : data.goUrl;

  // Xử lý mở App Shopee thông minh theo từng nền tảng
  const handleOpenShopeeApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackOpenShopeeApp(data.slug, data.discountPercentage);

    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const isAndroid = /Android/i.test(ua);

      // Trên Android, ưu tiên Intent URI để OS tự động đánh thức App Shopee
      if (isAndroid && data.androidIntent) {
        e.preventDefault();
        window.location.href = data.androidIntent;
      }
      // Trên iOS: Thẻ <a> sử dụng target="_self" dẫn tới Universal Link (targetWithVoucherUrl)
      // Cử chỉ click trực tiếp của người dùng sẽ kích hoạt iOS mở thẳng Shopee App
    }
  };

  // Hiển thị Sticky CTA Bar khi nút mở App chính bị cuộn khỏi tầm nhìn
  useEffect(() => {
    if (!ctaRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Chỉ hiện thanh ghim đáy khi nút CTA đã bị cuộn vượt quá lên trên
        const isAboveViewport = entry.boundingClientRect.bottom < 0;
        setShowStickyBar(isAboveViewport);
      },
      { threshold: 0 }
    );

    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

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
    <>
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl sm:p-7">
          {/* Glow Background Accent */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#EE4D2D]/20 blur-3xl" />

          {/* Voucher Tag Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 sm:pb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-3 py-1 text-xs font-extrabold text-orange-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>ĐÃ KÍCH HOẠT VOUCHER {data.discountPercentage}% (TỐI ĐA {data.maxDiscountAmount})</span>
            </div>

            {data.fromCache && (
              <span className="text-[10px] font-mono text-emerald-400 sm:text-[11px]">⚡ Fast Cache</span>
            )}
          </div>

          {/* Link Info */}
          <div className="mt-3.5 space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Link đích Shopee đã gắn mã:</span>
              {(data.itemId || data.shopId) && (
                <span className="text-[11px] text-slate-400">
                  {data.itemId ? `SP #${data.itemId}` : ''}
                </span>
              )}
            </div>
            <div className="truncate rounded-xl border border-slate-800/80 bg-slate-950/80 p-2.5 font-mono text-xs text-slate-300">
              {data.cleanUrl}
            </div>
          </div>

          {/* 3 Bước Áp Mã Trong 5 Giây */}
          <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-950/50 p-3 text-left">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              💡 3 Bước nhận ưu đãi trong App:
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-400 sm:grid-cols-3">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>1. Bấm nút <strong>Mở App</strong> bên dưới</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>2. Chọn <strong>Mở</strong> để vào Shopee</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                <span>3. Chọn voucher tại <strong>Giỏ Hàng</strong></span>
              </div>
            </div>
          </div>

          {/* Main CTA: Mở App Shopee To Bản */}
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:gap-3">
            <a
              ref={ctaRef}
              href={data.targetWithVoucherUrl}
              target={isMobile ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={handleOpenShopeeApp}
              className="group relative flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#EE4D2D] via-orange-500 to-amber-500 p-3.5 text-center text-base font-black text-white shadow-xl shadow-[#EE4D2D]/35 transition-all hover:scale-[1.01] hover:brightness-110 active:scale-95 sm:text-lg"
            >
              <Tag className="h-5 w-5 transition-transform group-hover:rotate-12" />
              <span>MỞ APP SHOPEE ÁP MÃ NGAY</span>
              <ArrowUpRight className="h-5 w-5" />
            </a>

            {/* Secondary Actions: Sao chép link & Mở Web */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={handleCopyLink}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Đã Sao Chép Link!</span>
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
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-95"
              >
                <ExternalLink className="h-4 w-4 text-slate-400" />
                <span>Tiếp Tục Trên Web</span>
              </a>
            </div>

            {/* Trợ giúp Deep Link cho iOS/Android khi Safari chặn Universal Link */}
            {isMobile && (
              <div className="pt-1 text-center">
                <span className="text-[11px] text-slate-400">
                  Chưa thấy mở App Shopee?{' '}
                  <a
                    href={data.deepLink}
                    onClick={(e) => {
                      trackOpenShopeeApp(data.slug, data.discountPercentage);
                      if (typeof window !== 'undefined' && /Android/i.test(navigator.userAgent) && data.androidIntent) {
                        e.preventDefault();
                        window.location.href = data.androidIntent;
                      }
                    }}
                    className="font-semibold text-orange-400 underline underline-offset-2 hover:text-orange-300"
                  >
                    Bấm vào đây để ép mở App
                  </a>
                </span>
              </div>
            )}
          </div>

          {/* Security & Guarantee Note */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 sm:text-xs">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span>Thanh toán trực tiếp trong Shopee App &bull; Giữ nguyên bảo hành chính hãng</span>
          </div>
        </div>
      </div>

      {/* Sticky Floating CTA Bar trên Mobile khi cuộn xuống dưới */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-500/30 bg-slate-950/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,16px))] shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-200">
          <div className="mx-auto flex max-w-md items-center gap-2.5">
            <div className="hidden xs:flex flex-col text-left pl-1">
              <span className="text-[11px] font-black text-orange-400">MÃ 25% ĐÃ SẴN SÀNG</span>
              <span className="text-[10px] text-slate-400">Tối đa {data.maxDiscountAmount}</span>
            </div>
            <a
              href={data.targetWithVoucherUrl}
              target={isMobile ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={handleOpenShopeeApp}
              className="flex flex-1 min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EE4D2D] via-orange-500 to-amber-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-[#EE4D2D]/35 active:scale-95"
            >
              <Tag className="h-4 w-4" />
              <span>MỞ APP SHOPEE ÁP MÃ</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
