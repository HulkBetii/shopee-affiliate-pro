'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, HelpCircle, Heart, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onScrollToGuide?: () => void;
  onScrollToShelf?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollToGuide, onScrollToShelf }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D6BDA5]/40 bg-[#FFFDF8]/90 backdrop-blur-md transition-all shadow-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-3.5 sm:px-6">
        {/* Brand Logo with Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-[#D6BDA5] shadow-sm">
            <Image
              src="/images/avatar-ngan-va-sua.jpg"
              alt="Mẹ Ngân và bé Sữa"
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-brand italic text-base sm:text-lg font-bold tracking-tight text-[#725541] leading-tight">
              Nàng thơ làm mẹ <span className="text-[#A68165] text-xs font-normal">♡</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#A68F7E] font-medium tracking-wide">
              Chuyện nhỏ của mẹ Ngân & Sữa
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onScrollToShelf && (
            <button
              onClick={onScrollToShelf}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#D6BDA5]/60 bg-[#EFE0CE]/50 px-2.5 py-1 text-[11px] font-medium text-[#725541] transition-all hover:bg-[#EFE0CE] active:scale-95"
            >
              <ShoppingBag className="h-3 w-3 text-[#A68165]" />
              <span className="hidden xs:inline">Tủ Đồ</span> Bé Sữa
            </button>
          )}

          {onScrollToGuide && (
            <button
              onClick={onScrollToGuide}
              className="inline-flex items-center gap-1 rounded-full border border-[#D6BDA5]/60 bg-[#FFFDF8] px-2.5 py-1 text-[11px] font-medium text-[#8E7764] transition-all hover:border-[#A68165] hover:text-[#725541] active:scale-95 shadow-2xs"
            >
              <HelpCircle className="h-3 w-3 text-[#A68165]" />
              <span>Cách Dùng</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
