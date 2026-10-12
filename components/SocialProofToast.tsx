'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Sparkles, TrendingUp } from 'lucide-react';
import { getRandomSocialProofEvent, SocialProofEvent } from '@/lib/marketing/social-proof';

export const SocialProofToast: React.FC = () => {
  const [event, setEvent] = useState<SocialProofEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (dismissed) return;

    // Bắt đầu hiển thị toast đầu tiên sau 3.5 giây vào trang
    const initialTimeout = setTimeout(() => {
      setEvent(getRandomSocialProofEvent());
      setVisible(true);
    }, 3500);

    return () => clearTimeout(initialTimeout);
  }, [dismissed]);

  useEffect(() => {
    if (!mounted || dismissed) return;

    let hideTimeout: NodeJS.Timeout;
    let nextEventTimeout: NodeJS.Timeout;

    if (visible) {
      // Tự động ẩn sau 5.5 giây
      hideTimeout = setTimeout(() => {
        setVisible(false);
      }, 5500);
    } else if (event) {
      // Sau khi ẩn, chờ 8 giây rồi bung thông báo mới
      nextEventTimeout = setTimeout(() => {
        setEvent(getRandomSocialProofEvent());
        setVisible(true);
      }, 8000);
    }

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextEventTimeout);
    };
  }, [visible, event, mounted, dismissed]);

  if (!mounted || dismissed || !event) {
    return null;
  }

  return (
    <div
      className={`fixed top-14 left-3 right-3 z-30 max-w-sm sm:top-auto sm:bottom-6 sm:left-6 sm:right-auto transition-all duration-500 ease-out ${
        visible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-4 sm:translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-orange-500/30 bg-slate-900/95 p-3 pr-8 shadow-2xl backdrop-blur-xl">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -left-4 -top-4 h-16 w-16 rounded-full bg-[#EE4D2D]/20 blur-xl" />

        {/* Icon Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EE4D2D] to-amber-500 text-white shadow-md shadow-orange-600/30">
          <ShoppingBag className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="font-bold text-orange-400">{event.phoneMasked}</span>
            <span>{event.action}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Tiết kiệm:</span>
            <span className="font-extrabold text-emerald-400">{event.savedAmount}</span>
            <span className="text-[10px] text-slate-400">&bull; {event.category}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{event.timeAgo}</span>
          </div>
        </div>

        {/* Nút đóng */}
        <button
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          aria-label="Đóng thông báo"
          className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
