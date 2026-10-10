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
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-8 text-center sm:py-12">
        {/* Banner phát hiện TikTok / Facebook In-App WebView */}
        <WebViewNotice />

        {/* Hero Section */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Mã Giảm Giá 25% Độc Quyền Toàn Sàn</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-white">Dán Link Shopee</span>
            <br />
            <span className="bg-gradient-to-r from-[#EE4D2D] via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Giảm Ngay 25% Mọi Đơn Hàng
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-400 sm:text-base leading-relaxed">
            Chuyển đổi liên kết, tự động kích hoạt voucher Meta Collab tối đa 500k và mở thẳng App Shopee không lo kẹt trình duyệt.
          </p>
        </div>

        {/* Form Dán Link 1-Click */}
        <div className="mt-8 w-full flex justify-center">
          <ConvertForm
            onSuccess={handleConvertSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>

        {/* Result Card khi convert thành công */}
        {result && (
          <div ref={resultRef} className="mt-8 w-full flex justify-center">
            <ResultCard data={result} />
          </div>
        )}

        {/* Divider */}
        <div className="my-12 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Widget Top Voucher Hot */}
        <div className="w-full flex justify-center">
          <TopVouchers />
        </div>

        {/* Divider */}
        <div className="my-12 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Hướng Dẫn 3 Bước Săn Sale */}
        <div className="w-full flex justify-center">
          <TutorialGuide />
        </div>
      </main>
    </div>
  );
}
