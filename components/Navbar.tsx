'use client';

import React from 'react';
import { ShoppingBag, Sparkles, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onScrollToGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollToGuide }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EE4D2D] to-orange-500 text-white shadow-lg shadow-[#EE4D2D]/25">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white sm:text-lg">
              <span>ShopeeLink</span>
              <span className="rounded-md bg-gradient-to-r from-[#EE4D2D] to-amber-500 px-1.5 py-0.5 text-xs font-black text-white">
                PRO
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block">Săn Voucher 25% & Rút Gọn Link</p>
          </div>
        </div>

        {/* Status Badge & Guide CTA */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="hidden xs:inline">Mã 25%</span> Hoạt Động
          </div>

          {onScrollToGuide && (
            <button
              onClick={onScrollToGuide}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cách Dùng</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
