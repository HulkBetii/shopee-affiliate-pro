'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Copy, Check, ExternalLink } from 'lucide-react';

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
    } catch (err) {
      console.warn('Không thể sao chép URL trang:', err);
    }
  };

  if (!isInAppWebView || dismissed) return null;

  return (
    <div className="relative mx-auto mb-4 w-full max-w-xl rounded-2xl border border-[#D6BDA5] bg-[#FFFDF8]/95 p-3 text-left shadow-warm backdrop-blur-md">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2 text-xs text-[#725541] leading-relaxed">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#A68165] mt-0.5" />
          <div>
            <span>
              Mẹo nhỏ: Bạn đang mở trong <strong>{appName}</strong>. Hãy bấm biểu tượng <strong>⋯</strong> ở góc trên và chọn <strong>"Mở bằng trình duyệt Safari/Chrome"</strong> để vào thẳng App Shopee nhé ♡
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyPageUrl}
            className="inline-flex items-center gap-1 rounded-lg border border-[#D6BDA5] bg-[#EFE0CE]/60 px-2 py-1 text-[11px] font-semibold text-[#725541] transition-all hover:bg-[#EFE0CE] active:scale-95"
            title="Sao chép link trang"
          >
            {copiedLink ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-700">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-[#A68165]" />
                <span>Chép link</span>
              </>
            )}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-[#A68F7E] hover:bg-[#EFE0CE] hover:text-[#725541]"
            title="Đóng thông báo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
