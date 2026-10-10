'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

export const WebViewNotice: React.FC = () => {
  const [isInAppWebView, setIsInAppWebView] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [appName, setAppName] = useState('');

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

  if (!isInAppWebView || dismissed) return null;

  return (
    <div className="relative mx-auto mb-6 w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4 text-left shadow-lg backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <AlertCircle className="h-4 w-4" />
        </div>

        <div className="flex-1 pr-6">
          <h4 className="text-sm font-semibold text-amber-300">
            Bạn đang mở web trong {appName} In-App
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Trình duyệt nhúng của {appName} có thể chặn tự động mở Shopee App.
            <br />
            👉 Hãy bấm vào biểu tượng <strong className="text-white">⋯</strong> (ở góc trên màn hình) &rarr; chọn{' '}
            <strong className="text-amber-200">"Mở bằng trình duyệt"</strong> (Safari / Chrome) để được kích hoạt mã giảm giá nhanh nhất!
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title="Đóng thông báo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
