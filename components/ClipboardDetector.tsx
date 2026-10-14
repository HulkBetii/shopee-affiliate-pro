'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, ClipboardPaste, Heart } from 'lucide-react';

interface ClipboardDetectorProps {
  onSelectUrl: (url: string) => void;
  currentConvertedUrl?: string;
}

export const ClipboardDetector: React.FC<ClipboardDetectorProps> = ({
  onSelectUrl,
  currentConvertedUrl,
}) => {
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Kiểm tra bộ nhớ tạm khi focus vào trang
  const checkClipboard = async () => {
    if (dismissed || typeof window === 'undefined' || !navigator.clipboard) return;

    try {
      if (!document.hasFocus()) return;

      const text = await navigator.clipboard.readText();
      if (!text || typeof text !== 'string') return;

      const trimmed = text.trim();

      if (
        (trimmed.includes('shopee.vn') || trimmed.includes('shp.ee') || trimmed.includes('s.shopee.vn')) &&
        trimmed !== currentConvertedUrl
      ) {
        const lastIgnored = sessionStorage.getItem('shopeelink_last_ignored_url');
        if (lastIgnored !== trimmed) {
          setDetectedUrl(trimmed);
        }
      }
    } catch {
      // Bỏ qua im lặng nếu không có quyền
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkClipboard, 1200);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkClipboard();
      }
    };

    window.addEventListener('focus', checkClipboard);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', checkClipboard);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentConvertedUrl, dismissed]);

  if (!detectedUrl || dismissed) {
    return null;
  }

  const handleApply = () => {
    onSelectUrl(detectedUrl);
    setDetectedUrl(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('shopeelink_last_ignored_url', detectedUrl);
    setDismissed(true);
    setDetectedUrl(null);
  };

  return (
    <div className="fixed top-16 left-3 right-3 z-50 mx-auto max-w-md animate-in slide-in-from-top-3 duration-300 sm:top-20">
      <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-[#D6BDA5] bg-[#FFFDF8]/95 p-3.5 shadow-warm-lg backdrop-blur-md text-[#725541]">
        <div className="flex items-center gap-2.5 overflow-hidden text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE0CE] text-[#A68165]">
            <Heart className="h-4 w-4 fill-[#A68165]/30 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#725541]">
              <Sparkles className="h-3.5 w-3.5 text-[#A68165]" />
              <span>Link Shopee bạn vừa copy ♡</span>
            </div>
            <p className="truncate text-[11px] text-[#A68F7E] font-mono">
              {detectedUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleApply}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#A68165] to-[#725541] px-3 py-1.5 text-xs font-bold text-white shadow-warm-btn transition-all hover:brightness-105 active:scale-95"
          >
            <span>TẠO LINK</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Bỏ qua"
            className="rounded-lg p-1 text-[#A68F7E] transition-colors hover:bg-[#EFE0CE] hover:text-[#725541]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
