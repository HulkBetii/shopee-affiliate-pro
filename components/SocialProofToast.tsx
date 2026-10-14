'use client';

import React, { useState, useEffect } from 'react';
import { Heart, X, Sparkles } from 'lucide-react';
import { getRandomSocialProofEvent, SocialProofEvent } from '@/lib/marketing/social-proof';

export const SocialProofToast: React.FC = () => {
  const [event, setEvent] = useState<SocialProofEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (dismissed) return;

    // Bắt đầu hiển thị toast đầu tiên sau 4 giây vào trang
    const initialTimeout = setTimeout(() => {
      setEvent(getRandomSocialProofEvent());
      setVisible(true);
    }, 4000);

    return () => clearTimeout(initialTimeout);
  }, [dismissed]);

  useEffect(() => {
    if (!mounted || dismissed) return;

    let hideTimeout: NodeJS.Timeout;
    let nextEventTimeout: NodeJS.Timeout;

    if (visible) {
      hideTimeout = setTimeout(() => {
        setVisible(false);
      }, 5500);
    } else if (event) {
      nextEventTimeout = setTimeout(() => {
        setEvent(getRandomSocialProofEvent());
        setVisible(true);
      }, 10000);
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
      className={`fixed top-16 left-3 right-3 z-30 max-w-sm sm:top-auto sm:bottom-6 sm:left-6 sm:right-auto transition-all duration-500 ease-out ${
        visible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-4 sm:translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[#D6BDA5] bg-[#FFFDF8]/95 p-3 pr-8 shadow-warm-lg backdrop-blur-md text-[#725541]">
        {/* Icon Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFE0CE] text-[#A68165]">
          <Heart className="h-5 w-5 fill-[#A68165]/30 text-[#A68165]" />
        </div>

        {/* Content */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 text-[11px] text-[#725541]">
            <span className="font-bold text-[#A68165]">Mẹ {event.phoneMasked}</span>
            <span>{event.action}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8E7764]">Tiết kiệm:</span>
            <span className="font-bold text-[#A68165]">{event.savedAmount}</span>
            <span className="text-[10px] text-[#A68F7E]">&bull; {event.category}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-[#A68F7E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A68165]" />
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
          className="absolute right-2 top-2 rounded-lg p-1 text-[#A68F7E] transition-colors hover:bg-[#EFE0CE] hover:text-[#725541]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
