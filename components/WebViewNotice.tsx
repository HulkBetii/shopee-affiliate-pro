'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Copy, Check } from 'lucide-react';

export const WebViewNotice: React.FC = () => {
  const [isInAppWebView, setIsInAppWebView] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [appName, setAppName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    let detectedApp = '';

    if (/TikTok/i.test(ua)) {
      detectedApp = 'TikTok';
    } else if (/FBAN|FBAV/i.test(ua)) {
      detectedApp = 'Facebook';
    } else if (/Instagram/i.test(ua)) {
      detectedApp = 'Instagram';
    } else if (/Zalo/i.test(ua)) {
      detectedApp = 'Zalo';
    }

    if (detectedApp) {
      setIsInAppWebView(true);
      setAppName(detectedApp);
    }
  }, []);

  const handleCopyPageUrl = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!isInAppWebView || dismissed) return null;

  return (
    <div className="relative mx-auto mb-6 w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-3.5 text-left shadow-lg backdrop-blur-md sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <AlertCircle className="h-4 w-4" />
        </div>

        <div className="flex-1 pr-6">
          <h4 className="text-xs font-bold text-amber-300 sm:text-sm">
            Bạn đang mở web trong {appName} In-App Browser
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Trình duyệt nhúng của {appName} có thể chặn tự động mở Shopee App.
            <br className="hidden sm:inline" />
            👉 Hãy bấm vào dấu <strong className="text-white">⋯</strong> góc trên màn hình &rarr; chọn{' '}
            <strong className="text-amber-200">"Mở bằng trình duyệt ngoài"</strong> (Safari / Chrome) để mở App mượt mà nhất!
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleCopyPageUrl}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300 transition-all hover:bg-amber-500/30 active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-300">Đã Chép Link Web!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Sao Chép Link Để Dán Vào Safari/Chrome</span>
                </>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
