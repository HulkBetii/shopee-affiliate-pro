'use client';

import React from 'react';
import { ShoppingBag, Sparkles, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onScrollToGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollToGuide }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-3 sm:h-14 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#EE4D2D] to-orange-500 text-white shadow-md shadow-[#EE4D2D]/20 sm:h-9 sm:w-9 sm:rounded-xl">
            <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black tracking-tight text-white text-sm sm:text-base">
              <span>ShopeeLink</span>
              <span className="rounded bg-gradient-to-r from-[#EE4D2D] to-amber-500 px-1 py-0.5 text-[10px] font-black text-white sm:text-xs">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge & Guide CTA */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <span>Mã Live</span>
          </div>

          {onScrollToGuide && (
            <button
              onClick={onScrollToGuide}
              className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              <HelpCircle className="h-3 w-3 text-amber-400" />
              <span>Cách Dùng</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
