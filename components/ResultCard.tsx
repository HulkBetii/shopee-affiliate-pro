'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Tag, ShieldCheck, ArrowUpRight, CheckCircle2, Heart } from 'lucide-react';
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
      // Trên iOS: Thẻ <a> sử dụng target="_self" dẫn tới Universal Link
    }
  };

  // Hiển thị Sticky CTA Bar khi nút mở App chính bị cuộn khỏi tầm nhìn
  useEffect(() => {
    if (!ctaRef.current) return;

    let isCtaAbove = false;
    let isFooterInView = false;

    const updateStickyState = () => {
      setShowStickyBar(isCtaAbove && !isFooterInView);
    };

    const ctaObserver = new IntersectionObserver(
      ([entry]) => {
        isCtaAbove = entry.boundingClientRect.bottom < 0;
        updateStickyState();
      },
      { threshold: 0 }
    );

    ctaObserver.observe(ctaRef.current);

    const footerEl = document.getElementById('app-footer');
    let footerObserver: IntersectionObserver | null = null;

    if (footerEl) {
      footerObserver = new IntersectionObserver(
        ([entry]) => {
          isFooterInView = entry.isIntersecting;
          updateStickyState();
        },
        { threshold: 0.05 }
      );
      footerObserver.observe(footerEl);
    }

    return () => {
      ctaObserver.disconnect();
      if (footerObserver) {
        footerObserver.disconnect();
      }
    };
  }, []);

  const handleCopyLink = async () => {
    trackCopyLink(data.slug);
    try {
      await navigator.clipboard.writeText(fullGoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
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
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="card-warm relative overflow-hidden border border-[#D6BDA5]/70 bg-[#FFFDF8] p-4 sm:p-6 shadow-warm-lg text-[#725541]">
          {/* Header Thông báo Thành công */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6BDA5]/40 pb-3 sm:pb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D6BDA5] bg-[#EFE0CE]/60 px-3 py-1 text-xs font-bold text-[#725541]">
              <Heart className="h-3.5 w-3.5 text-[#A68165] fill-[#A68165]" />
              <span>Link mua hàng đã sẵn sàng ♡</span>
            </div>

            <div className="inline-flex items-center gap-1 text-[11px] text-[#A68165] font-medium">
              <Sparkles className="h-3 w-3" />
              <span>Kèm ưu đãi đối tác 25%</span>
            </div>
          </div>

          {/* Link Info */}
          <div className="mt-3.5 space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs text-[#8E7764]">
              <span>Sản phẩm bạn đã chọn:</span>
              {data.itemId && (
                <span className="text-[11px] text-[#A68F7E]">
                  Mã SP: #{data.itemId}
                </span>
              )}
            </div>
            <div className="truncate rounded-xl border border-[#D6BDA5]/50 bg-[#F8F0E5]/70 p-2.5 font-mono text-xs text-[#725541]">
              {data.cleanUrl}
            </div>
          </div>

          {/* 3 Bước Đơn Giản Nhận Hàng Trong App */}
          <div className="mt-3.5 rounded-xl border border-[#D6BDA5]/40 bg-[#F8F0E5]/50 p-3 text-left">
            <div className="text-[11px] font-bold text-[#725541] mb-2 flex items-center gap-1">
              <span>🌸</span>
              <span>Chỉ 3 bước đơn giản thôi nhé:</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-[#8E7764] sm:grid-cols-3">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#A68165] mt-0.5 shrink-0" />
                <span>1. Bấm nút <strong>Mở Shopee</strong></span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#A68165] mt-0.5 shrink-0" />
                <span>2. Chọn <strong>Mở App</strong></span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#A68165] mt-0.5 shrink-0" />
                <span>3. Thêm vào <strong>Giỏ hàng</strong></span>
              </div>
            </div>
          </div>

          {/* Main CTA: Mở App Shopee Nâu Sữa Ấm Áp */}
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:gap-3">
            <a
              ref={ctaRef}
              href={data.targetWithVoucherUrl}
              target={isMobile ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={handleOpenShopeeApp}
              className="group relative flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#A68165] via-[#967055] to-[#725541] p-3.5 text-center text-sm sm:text-base font-bold text-white shadow-warm-btn transition-all hover:brightness-105 active:scale-95"
            >
              <Tag className="h-4 w-4 transition-transform group-hover:rotate-12" />
              <span>MỞ XEM SẢN PHẨM TRÊN SHOPEE</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            {/* Secondary Actions: Sao chép link & Mở Web */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={handleCopyLink}
                className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[#D6BDA5] bg-[#EFE0CE]/50 px-4 py-2 text-xs font-semibold text-[#725541] transition-all hover:bg-[#EFE0CE] active:scale-95 shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Đã sao chép link rồi nhé!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#A68165]" />
                    <span>Sao chép link mua hàng</span>
                  </>
                )}
              </button>

              <a
                href={data.targetWithVoucherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[#D6BDA5]/60 bg-[#FFFDF8] px-4 py-2 text-xs font-semibold text-[#8E7764] transition-all hover:border-[#A68165] hover:text-[#725541] active:scale-95 shadow-2xs"
              >
                <ExternalLink className="h-4 w-4 text-[#A68F7E]" />
                <span>Xem trên trình duyệt Web</span>
              </a>
            </div>

            {/* Trợ giúp Deep Link khi Safari chưa tự mở */}
            {isMobile && (
              <div className="pt-1 text-center">
                <span className="text-[11px] text-[#A68F7E]">
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
                    className="font-semibold text-[#A68165] underline underline-offset-2 hover:text-[#725541]"
                  >
                    Bấm vào đây để mở App nhé
                  </a>
                </span>
              </div>
            )}
          </div>

          {/* Security & Guarantee Note */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#8E7764]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Thanh toán trực tiếp trong Shopee App &bull; Giữ nguyên bảo hành chính hãng</span>
          </div>
        </div>
      </div>

      {/* Sticky Floating CTA Bar trên Mobile khi cuộn xuống dưới */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#D6BDA5]/60 bg-[#FFFDF8]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,16px))] shadow-warm-lg backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="mx-auto flex max-w-md items-center gap-2.5">
            <div className="hidden xs:flex flex-col text-left pl-1">
              <span className="text-[11px] font-bold text-[#725541]">Link mua hàng sẵn sàng ♡</span>
              <span className="text-[10px] text-[#A68F7E]">Mở app nhận mã 25%</span>
            </div>
            <a
              href={data.targetWithVoucherUrl}
              target={isMobile ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={handleOpenShopeeApp}
              className="flex flex-1 min-h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A68165] via-[#967055] to-[#725541] px-4 py-2 text-sm font-bold text-white shadow-warm-btn active:scale-95"
            >
              <Tag className="h-4 w-4" />
              <span>MỞ XEM TRÊN SHOPEE</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
