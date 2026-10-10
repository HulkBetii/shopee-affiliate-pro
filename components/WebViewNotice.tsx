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
    <div className="relative mx-auto mb-4 w-full max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-xs text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="truncate">
            Đang mở trong <strong>{appName}</strong>. Bấm <strong>⋯</strong> để mở Safari/Chrome
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyPageUrl}
            className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 transition-all hover:bg-amber-500/30 active:scale-95"
            title="Sao chép link trang"
          >
            {copiedLink ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-300">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Chép link</span>
              </>
            )}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="rounded-md p-0.5 text-slate-400 hover:text-white"
            title="Đóng"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
