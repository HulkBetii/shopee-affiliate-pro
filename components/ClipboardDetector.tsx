'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, ClipboardPaste } from 'lucide-react';

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
      // Chỉ đọc khi trang đang được focus
      if (!document.hasFocus()) return;

      const text = await navigator.clipboard.readText();
      if (!text || typeof text !== 'string') return;

      const trimmed = text.trim();

      // Kiểm tra có chứa link Shopee không
      if (
        (trimmed.includes('shopee.vn') || trimmed.includes('shp.ee') || trimmed.includes('s.shopee.vn')) &&
        trimmed !== currentConvertedUrl
      ) {
        // Kiểm tra xem link này đã bị bỏ qua chưa
        const lastIgnored = sessionStorage.getItem('shopeelink_last_ignored_url');
        if (lastIgnored !== trimmed) {
          setDetectedUrl(trimmed);
        }
      }
    } catch {
      // Trình duyệt không cấp quyền đọc ngầm - bỏ qua trong im lặng
    }
  };

  useEffect(() => {
    // Kiểm tra sau khi mount 1.2s
    const timer = setTimeout(checkClipboard, 1200);

    // Kiểm tra khi user chuyển lại tab
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
      <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-orange-500/40 bg-slate-900/95 p-3.5 shadow-2xl shadow-orange-950/40 backdrop-blur-xl">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-[#EE4D2D]/20 blur-xl" />

        <div className="flex items-center gap-2.5 overflow-hidden text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-[#EE4D2D]">
            <ClipboardPaste className="h-5 w-5 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Phát hiện link Shopee vừa copy</span>
            </div>
            <p className="truncate text-[11px] text-slate-400 font-mono">
              {detectedUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleApply}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#EE4D2D] to-orange-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-md shadow-[#EE4D2D]/30 transition-all hover:brightness-110 active:scale-95"
          >
            <span>ÁP MÃ NGAY</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Bỏ qua"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
