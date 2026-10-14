'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { WebViewNotice } from '@/components/WebViewNotice';
import { GentleSavingsTicker } from '@/components/GentleSavingsTicker';
import { ConvertForm } from '@/components/ConvertForm';
import { ResultCard } from '@/components/ResultCard';
import { CuratedShelf } from '@/components/CuratedShelf';
import { RecentConversions } from '@/components/RecentConversions';
import { TutorialGuide } from '@/components/TutorialGuide';
import { AboutMom } from '@/components/AboutMom';
import { FaqSection } from '@/components/FaqSection';
import { SocialProofToast } from '@/components/SocialProofToast';
import { ClipboardDetector } from '@/components/ClipboardDetector';
import { Heart } from 'lucide-react';
import { ConvertApiResponse } from '@/app/api/convert/route';
import { saveRecentConversion } from '@/lib/marketing/recent-history';

export default function HomePage() {
  const [result, setResult] = useState<ConvertApiResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialUrl, setInitialUrl] = useState<string>('');
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState<number>(0);
  const resultRef = useRef<HTMLDivElement>(null);

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

    // Lưu vào lịch sử cá nhân (LocalStorage)
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
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleScrollToGuide = () => {
    const el = document.getElementById('tutorial-guide');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToShelf = () => {
    const el = document.getElementById('curated-shelf');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8F0E5] text-[#725541]">
      {/* 1-Tap Clipboard Auto-Detect Toast */}
      <ClipboardDetector
        onSelectUrl={(url) => setInitialUrl(url)}
        currentConvertedUrl={result?.cleanUrl}
      />

      {/* Navbar Header */}
      <Navbar
        onScrollToGuide={handleScrollToGuide}
        onScrollToShelf={handleScrollToShelf}
      />

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-3.5 pt-3 pb-12 text-center sm:px-6 sm:pt-6 sm:pb-16">
        {/* Banner phát hiện TikTok / Facebook In-App WebView */}
        <WebViewNotice />

        {/* Hero Section: Ấm áp & Gần gũi */}
        <div className="max-w-xl px-1 pt-3 sm:pt-4">
          {/* Avatar Mẹ Ngân & Bé Sữa */}
          <div className="mx-auto mb-2.5 flex justify-center">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-[2.5px] border-[#D6BDA5] shadow-warm">
              <Image
                src="/images/avatar-ngan-va-sua.jpg"
                alt="Mẹ Ngân và Bé Sữa"
                width={96}
                height={96}
                className="object-cover h-full w-full"
                priority
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D6BDA5] bg-[#EFE0CE]/60 px-3 py-0.5 text-xs font-semibold text-[#725541]">
            <Heart className="h-3 w-3 text-[#A68165] fill-[#A68165]" />
            <span>Góc nhỏ của mẹ Ngân & Sữa ♡</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:mt-3 sm:text-4xl text-[#725541]">
            <span className="font-brand italic block font-extrabold text-[#725541]">
              Nàng thơ làm mẹ
            </span>
            <span className="text-base sm:text-2xl font-heading font-medium text-[#8E7764] block mt-1">
              Tạo Link Mua Hàng Cùng Mẹ Ngân
            </span>
          </h1>

          <p className="mt-2 text-xs text-[#8E7764] sm:mt-2.5 sm:text-sm leading-relaxed max-w-md mx-auto">
            Chào bạn đến với góc nhỏ của mẹ Sữa. Nếu bạn muốn tìm lại một món đồ mình chia sẻ, chỉ cần dán link Shopee vào đây để lấy link mua hàng nhanh chóng nhé!
          </p>
        </div>

        {/* Gentle Savings Ticker (Thông điệp sẻ chia) */}
        <div className="mt-3.5 w-full flex justify-center">
          <GentleSavingsTicker />
        </div>

        {/* Form Dán Link 1-Click */}
        <div className="mt-3.5 w-full flex justify-center">
          <ConvertForm
            onSuccess={handleConvertSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            initialUrl={initialUrl}
          />
        </div>

        {/* Result Card khi convert thành công */}
        {result && (
          <div ref={resultRef} className="mt-5 w-full flex justify-center sm:mt-6">
            <ResultCard data={result} />
          </div>
        )}

        {/* Divider */}
        <div className="my-7 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-[#D6BDA5]/50 to-transparent" />

        {/* Tủ Đồ Tuyển Chọn Bé Sữa (Curated Shelf) */}
        <div className="w-full flex justify-center">
          <CuratedShelf onSelectProduct={(url) => setInitialUrl(url)} />
        </div>

        {/* Divider */}
        <div className="my-7 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-[#D6BDA5]/50 to-transparent" />

        {/* Lịch Sử Dán Link Gần Đây */}
        <div className="w-full flex justify-center">
          <RecentConversions refreshTrigger={historyRefreshTrigger} />
        </div>

        {/* Divider */}
        <div className="my-7 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-[#D6BDA5]/50 to-transparent" />

        {/* Hướng Dẫn 3 Bước Mua Hàng */}
        <div className="w-full flex justify-center">
          <TutorialGuide />
        </div>

        {/* Divider */}
        <div className="my-7 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-[#D6BDA5]/50 to-transparent" />

        {/* Góc Về Mẹ Ngân & Bé Sữa */}
        <div className="w-full flex justify-center">
          <AboutMom />
        </div>

        {/* Divider */}
        <div className="my-7 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-[#D6BDA5]/50 to-transparent" />

        {/* Câu Hỏi Thường Gặp */}
        <div className="w-full flex justify-center">
          <FaqSection />
        </div>
      </div>

      {/* Floating Social Proof Toast */}
      <SocialProofToast />
    </div>
  );
}
