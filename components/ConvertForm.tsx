'use client';

import React, { useState, useRef } from 'react';
import { Clipboard, Zap, ArrowRight, X, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { ConvertApiResponse } from '@/app/api/convert/route';
import { trackConvertAttempt } from '@/lib/analytics';

interface ConvertFormProps {
  onSuccess: (data: NonNullable<ConvertApiResponse['data']>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const ConvertForm: React.FC<ConvertFormProps> = ({
  onSuccess,
  isLoading,
  setIsLoading,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Xử lý nút "Dán nhanh" từ Clipboard
  const handlePasteClipboard = async () => {
    setErrorMessage(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputUrl(text.trim());
          // Tự động kích hoạt chuyển đổi nếu phát hiện link shopee
          if (/shopee\.vn|shp\.ee/i.test(text)) {
            triggerConvert(text.trim());
          }
          return;
        }
      }
      // Fallback nếu clipboard rỗng hoặc bị chặn
      inputRef.current?.focus();
    } catch (err) {
      // Trình duyệt chặn quyền truy cập clipboard -> focus ô input để user paste bằng tay
      inputRef.current?.focus();
    }
  };

  const triggerConvert = async (urlToConvert: string) => {
    if (!urlToConvert.trim()) {
      setErrorMessage('Vui lòng dán đường link Shopee để lấy mã ưu đãi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    trackConvertAttempt(urlToConvert.trim());

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToConvert.trim(),
          subIds: ['web_tool', 'tiktok_bio'],
        }),
      });

      const json: ConvertApiResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        setErrorMessage(json.message || 'Không thể xử lý liên kết. Vui lòng kiểm tra lại link Shopee.');
        return;
      }

      onSuccess(json.data);
    } catch (err) {
      setErrorMessage('Lỗi kết nối máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerConvert(inputUrl);
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel relative rounded-2xl p-2.5 shadow-2xl transition-all focus-within:border-[#EE4D2D]/60 focus-within:ring-2 focus-within:ring-[#EE4D2D]/20 sm:rounded-3xl sm:p-3.5">
          {/* Textarea nhập link linh hoạt với nút Dán tích hợp */}
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Dán link Shopee vào đây (hoặc link chia sẻ từ App)..."
              className="w-full resize-none rounded-xl bg-slate-900/70 p-3 pr-24 text-[16px] text-slate-100 placeholder-slate-500 outline-none transition-colors sm:text-sm sm:pr-28"
              disabled={isLoading}
            />

            {/* Nút hành động góc phải trong ô input */}
            <div className="absolute right-2 top-2.5 flex items-center gap-1">
              {!inputUrl ? (
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/15 px-2.5 py-1 text-[11px] font-bold text-orange-400 transition-all hover:bg-orange-500/25 active:scale-95 disabled:opacity-50"
                  title="Dán nhanh từ bộ nhớ tạm"
                >
                  <Clipboard className="h-3 w-3" />
                  <span>Dán</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('');
                    setErrorMessage(null);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  title="Xóa nội dung"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Nút Submit Kích Hoạt Mã To Bản 1-Chạm */}
          <div className="mt-2 sm:mt-2.5">
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EE4D2D] via-orange-500 to-amber-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-[#EE4D2D]/30 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[48px] sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang Kích Hoạt Mã...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-200" />
                  <span>LẤY MÃ GIẢM 25% (MỞ APP)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {errorMessage && (
          <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-left text-xs text-rose-300 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
};
