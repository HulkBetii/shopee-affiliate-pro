'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { WebViewNotice } from '@/components/WebViewNotice';
import { ConvertForm } from '@/components/ConvertForm';
import { ResultCard } from '@/components/ResultCard';
import { TopVouchers } from '@/components/TopVouchers';
import { TutorialGuide } from '@/components/TutorialGuide';
import { Sparkles, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import { ConvertApiResponse } from '@/app/api/convert/route';

export default function HomePage() {
  const [result, setResult] = useState<ConvertApiResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleConvertSuccess = (data: NonNullable<ConvertApiResponse['data']>) => {
    setResult(data);
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

        {/* Form Dán Link 1-Click (Nằm trọn trong màn hình đầu tiên) */}
        <div className="mt-3 w-full flex justify-center sm:mt-5">
          <ConvertForm
            onSuccess={handleConvertSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>

        {/* Social Proof Ticker */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
          </span>
          <span>🔥 <strong>1.482</strong> người đã áp mã thành công hôm nay</span>
        </div>

        {/* Result Card khi convert thành công */}
        {result && (
          <div ref={resultRef} className="mt-5 w-full flex justify-center sm:mt-6">
            <ResultCard data={result} />
          </div>
        )}

        {/* Divider */}
        <div className="my-5 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-slate-800 to-transparent sm:my-8" />

        {/* Widget Top Voucher Hot */}
        <div className="w-full flex justify-center">
          <TopVouchers />
        </div>

        {/* Divider */}
        <div className="my-5 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-slate-800 to-transparent sm:my-8" />

        {/* Hướng Dẫn 3 Bước Săn Sale */}
        <div className="w-full flex justify-center">
          <TutorialGuide />
        </div>
      </div>
    </div>
  );
}
