'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { WebViewNotice } from '@/components/WebViewNotice';
import { LiveSaleTicker } from '@/components/LiveSaleTicker';
import { ConvertForm } from '@/components/ConvertForm';
import { ResultCard } from '@/components/ResultCard';
import { TopVouchers } from '@/components/TopVouchers';
import { RecentConversions } from '@/components/RecentConversions';
import { TutorialGuide } from '@/components/TutorialGuide';
import { SocialProofToast } from '@/components/SocialProofToast';
import { ClipboardDetector } from '@/components/ClipboardDetector';
import { Sparkles } from 'lucide-react';
import { ConvertApiResponse } from '@/app/api/convert/route';
import { getDynamicSocialProofCount } from '@/lib/marketing/time-slots';
import { saveRecentConversion } from '@/lib/marketing/recent-history';

export default function HomePage() {
  const [result, setResult] = useState<ConvertApiResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialCount, setSocialCount] = useState<number>(1482);
  const [initialUrl, setInitialUrl] = useState<string>('');
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState<number>(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Khởi tạo số người săn sale động
  useEffect(() => {
    setSocialCount(getDynamicSocialProofCount());
    const interval = setInterval(() => {
      setSocialCount(getDynamicSocialProofCount());
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý Web Share Target API khi người dùng chia sẻ từ App Shopee sang Web
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedUrl = params.get('url') || params.get('text');
      if (
        sharedUrl &&
        (sharedUrl.includes('shopee.vn') || sharedUrl.includes('shp.ee') || sharedUrl.includes('s.shopee.vn'))
      ) {
        setInitialUrl(sharedUrl.trim());
      }
    }
  }, []);

  const handleConvertSuccess = (data: NonNullable<ConvertApiResponse['data']>) => {
    setResult(data);

    // Lưu vào lịch sử săn sale cá nhân (LocalStorage)
    saveRecentConversion({
      cleanUrl: data.cleanUrl,
      slug: data.slug,
      goUrl: data.goUrl,
      targetWithVoucherUrl: data.targetWithVoucherUrl,
      androidIntent: data.androidIntent,
      deepLink: data.deepLink,
      discountPercentage: data.discountPercentage,
      maxDiscountAmount: data.maxDiscountAmount,
      itemId: data.itemId,
    });
    setHistoryRefreshTrigger((prev) => prev + 1);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleScrollToGuide = () => {
    const el = document.getElementById('tutorial-guide');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* 1-Tap Clipboard Auto-Detect Toast */}
      <ClipboardDetector
        onSelectUrl={(url) => setInitialUrl(url)}
        currentConvertedUrl={result?.cleanUrl}
      />

      {/* Navbar Header */}
      <Navbar onScrollToGuide={handleScrollToGuide} />

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-3 py-3 text-center sm:px-4 sm:py-8">
        {/* Banner phát hiện TikTok / Facebook In-App WebView (Slim Ticker) */}
        <WebViewNotice />

        {/* Hero Section: Compact Above-The-Fold */}
        <div className="max-w-xl px-1">
          <div className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold text-orange-400 sm:text-xs">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Mã Giảm Giá 25% Độc Quyền Toàn Sàn</span>
          </div>

          <h1 className="mt-2 text-xl font-black tracking-tight sm:mt-3 sm:text-4xl">
            <span className="text-white">Dán Link Shopee</span>
            <br />
            <span className="bg-gradient-to-r from-[#EE4D2D] via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Giảm Ngay 25% Mọi Đơn Hàng
            </span>
          </h1>

          <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm leading-relaxed">
            Tự động kích hoạt voucher đối tác tối đa 500k và mở thẳng App Shopee.
          </p>
        </div>

        {/* Live Sale Ticker (Phiên Săn Sale Hiện Tại & Đồng Hồ Đếm Ngược) */}
        <div className="mt-3.5 w-full flex justify-center">
          <LiveSaleTicker />
        </div>

        {/* Form Dán Link 1-Click (Hỗ trợ tự động điền từ Share Target hoặc Clipboard) */}
        <div className="mt-3 w-full flex justify-center sm:mt-4">
          <ConvertForm
            onSuccess={handleConvertSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            initialUrl={initialUrl}
          />
        </div>

        {/* Dynamic Social Proof Ticker */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
          </span>
          <span>
            🔥 <strong>{new Intl.NumberFormat('vi-VN').format(socialCount)}</strong> người đã áp mã thành công hôm nay
          </span>
        </div>

        {/* Result Card khi convert thành công */}
        {result && (
          <div ref={resultRef} className="mt-5 w-full flex justify-center sm:mt-6">
            <ResultCard data={result} />
          </div>
        )}

        {/* Divider */}
        <div className="my-5 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-slate-800 to-transparent sm:my-8" />

        {/* Widget Top Voucher Hot (Xoay theo phiên tự động) */}
        <div className="w-full flex justify-center">
          <TopVouchers />
        </div>

        {/* Lịch Sử Săn Sale Cá Nhân (Recent Conversions) */}
        <div className="w-full flex justify-center mt-5">
          <RecentConversions refreshTrigger={historyRefreshTrigger} />
        </div>

        {/* Divider */}
        <div className="my-5 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-slate-800 to-transparent sm:my-8" />

        {/* Hướng Dẫn 3 Bước Săn Sale */}
        <div className="w-full flex justify-center">
          <TutorialGuide />
        </div>
      </div>

      {/* Floating Social Proof Toast (Thông Báo Chốt Đơn Động) */}
      <SocialProofToast />
    </div>
  );
}
