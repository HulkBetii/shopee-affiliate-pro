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
        <div className="glass-panel relative rounded-3xl p-3 shadow-2xl transition-all focus-within:border-[#EE4D2D]/60 focus-within:ring-2 focus-within:ring-[#EE4D2D]/20 sm:p-4">
          {/* Textarea nhập link linh hoạt */}
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={3}
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Dán link sản phẩm Shopee vào đây... (Ví dụ: https://s.shopee.vn/... hoặc copy từ nút Chia sẻ trong App)"
              className="w-full resize-none rounded-2xl bg-slate-900/60 p-3.5 pr-10 text-base text-slate-100 placeholder-slate-500 outline-none transition-colors"
              disabled={isLoading}
            />

            {/* Nút xóa nhanh nội dung */}
            {inputUrl && (
              <button
                type="button"
                onClick={() => {
                  setInputUrl('');
                  setErrorMessage(null);
                }}
                className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                title="Xóa nội dung"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Row: Mobile-First Layout */}
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Nút Dán Clipboard Nhanh */}
            <button
              type="button"
              onClick={handlePasteClipboard}
              disabled={isLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-700 active:scale-95 disabled:opacity-50 sm:min-h-0 sm:py-2.5"
            >
              <Clipboard className="h-4 w-4 text-orange-400" />
              <span>Dán Nhanh Từ Clipboard</span>
            </button>

            {/* Nút Submit Kích Hoạt Mã */}
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EE4D2D] via-orange-500 to-amber-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#EE4D2D]/30 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2.5 sm:text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang Kích Hoạt Mã...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>LẤY MÃ GIẢM 25%</span>
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
