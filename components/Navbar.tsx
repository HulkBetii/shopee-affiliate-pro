'use client';

import React from 'react';
import { ShoppingBag, Sparkles, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onScrollToGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollToGuide }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-3.5 sm:h-16 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EE4D2D] to-orange-500 text-white shadow-md shadow-[#EE4D2D]/20 sm:h-10 sm:w-10 sm:shadow-lg sm:shadow-[#EE4D2D]/25">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base sm:text-lg">
              <span>ShopeeLink</span>
              <span className="rounded-md bg-gradient-to-r from-[#EE4D2D] to-amber-500 px-1.5 py-0.5 text-[11px] font-black text-white sm:text-xs">
                PRO
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block">Săn Voucher 25% & Rút Gọn Link</p>
          </div>
        </div>

        {/* Status Badge & Guide CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 sm:px-2.5 sm:py-1 sm:text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>Mã 25% Live</span>
          </div>

          {onScrollToGuide && (
            <button
              onClick={onScrollToGuide}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white sm:px-2.5"
            >
              <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] sm:text-xs">Cách Dùng</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
