'use client';

import React, { useState, useRef } from 'react';
import { Clipboard, ArrowRight, X, AlertCircle, Loader2, Sparkles, Heart } from 'lucide-react';
import { ConvertApiResponse } from '@/app/api/convert/route';
import { trackConvertAttempt } from '@/lib/analytics';

interface ConvertFormProps {
  onSuccess: (data: NonNullable<ConvertApiResponse['data']>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initialUrl?: string;
}

export const ConvertForm: React.FC<ConvertFormProps> = ({
  onSuccess,
  isLoading,
  setIsLoading,
  initialUrl,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Tự động kích hoạt khi có initialUrl truyền vào (từ Web Share Target hoặc Clipboard Detector)
  React.useEffect(() => {
    if (initialUrl && initialUrl.trim() && initialUrl !== inputUrl) {
      setInputUrl(initialUrl.trim());
      triggerConvert(initialUrl.trim());
    }
  }, [initialUrl]);

  // Xử lý nút "Dán nhanh" từ Clipboard
  const handlePasteClipboard = async () => {
    setErrorMessage(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputUrl(text.trim());
          if (/shopee\.vn|shp\.ee/i.test(text)) {
            triggerConvert(text.trim());
          }
          return;
        }
      }
      inputRef.current?.focus();
    } catch (err) {
      inputRef.current?.focus();
    }
  };

  const triggerConvert = async (urlToConvert: string) => {
    if (!urlToConvert.trim()) {
      setErrorMessage('Bạn chưa dán link sản phẩm Shopee rồi ♡');
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
          subIds: ['nganvasua_web', 'tiktok_bio'],
        }),
      });

      const json: ConvertApiResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        setErrorMessage(json.message || 'Link này chưa đúng dạng Shopee. Bạn kiểm tra lại giúp mình nhé!');
        return;
      }

      onSuccess(json.data);
    } catch (err) {
      setErrorMessage('Chưa thể kết nối lúc này. Bạn thử lại sau một chút nhé ♡');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerConvert(inputUrl);
  };

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="card-warm relative p-3.5 sm:p-5 shadow-warm transition-all border border-[#D6BDA5]/60 focus-within:border-[#A68165] focus-within:ring-2 focus-within:ring-[#A68165]/20">
          {/* Header tiêu đề khối */}
          <div className="mb-3 text-center sm:text-left flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-[#A68165] fill-[#A68165]/20" />
              <h2 className="font-heading font-bold text-sm sm:text-base text-[#725541]">
                Tạo link mua hàng cùng Ngân ♡
              </h2>
            </div>
            <span className="hidden xs:inline-block text-[11px] text-[#A68F7E] font-medium">
              Không cần đăng nhập
            </span>
          </div>

          {/* Textarea nhập link Shopee với nút Dán tích hợp */}
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
              placeholder="Dán link sản phẩm Shopee tại đây..."
              className="w-full resize-none rounded-xl bg-[#F8F0E5]/70 border border-[#D6BDA5]/60 p-3 pr-24 text-[15px] sm:text-sm text-[#725541] placeholder-[#A68F7E] outline-none transition-colors focus:bg-[#FFFDF8] focus:border-[#A68165]"
              disabled={isLoading}
            />

            {/* Nút hành động góc phải trong ô input */}
            <div className="absolute right-2 top-2.5 flex items-center gap-1">
              {!inputUrl ? (
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#D6BDA5] bg-[#EFE0CE] px-2.5 py-1 text-[11px] font-bold text-[#725541] transition-all hover:bg-[#D6BDA5]/50 active:scale-95 disabled:opacity-50 shadow-2xs"
                  title="Dán nhanh từ bộ nhớ tạm"
                >
                  <Clipboard className="h-3 w-3 text-[#A68165]" />
                  <span>Dán</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('');
                    setErrorMessage(null);
                  }}
                  className="rounded-lg p-1.5 text-[#A68F7E] transition-colors hover:bg-[#EFE0CE] hover:text-[#725541]"
                  title="Xóa nội dung"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Nút CTA Nâu Sữa Tạo Link Ngay */}
          <div className="mt-3">
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A68165] via-[#967055] to-[#725541] px-4 py-2.5 text-sm sm:text-base font-bold text-white shadow-warm-btn transition-all hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Đang chuẩn bị link cho bạn...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#F8EBE6]" />
                  <span>TẠO LINK MUA HÀNG NGAY</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Ghi chú chân form */}
          <div className="mt-2.5 text-center text-[11px] text-[#A68F7E]">
            <span>Nhanh chóng &bull; Hoàn toàn miễn phí &bull; Mở thẳng App Shopee</span>
          </div>
        </div>

        {/* Thông báo lỗi với ngôn từ nhẹ nhàng */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#EED7D0] bg-[#F8EBE6] p-3 text-left text-xs text-[#8E5D52] animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#C27364]" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
};
