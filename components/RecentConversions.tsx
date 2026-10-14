'use client';

import React, { useState, useEffect } from 'react';
import { History, Trash2, ArrowUpRight, Copy, Check, Sparkles, Heart } from 'lucide-react';
import { RecentConversionItem, getRecentHistory, clearRecentHistory } from '@/lib/marketing/recent-history';
import { trackOpenShopeeApp, trackCopyLink } from '@/lib/analytics';

interface RecentConversionsProps {
  onSelectRecent?: (item: RecentConversionItem) => void;
  refreshTrigger?: number;
}

export const RecentConversions: React.FC<RecentConversionsProps> = ({
  onSelectRecent,
  refreshTrigger,
}) => {
  const [history, setHistory] = useState<RecentConversionItem[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadHistory = () => {
    setHistory(getRecentHistory());
  };

  useEffect(() => {
    setMounted(true);
    loadHistory();
  }, [refreshTrigger]);

  if (!mounted || history.length === 0) {
    return null;
  }

  const handleClear = () => {
    clearRecentHistory();
    setHistory([]);
  };

  const handleCopyLink = async (item: RecentConversionItem) => {
    trackCopyLink(item.slug);
    const fullUrl = `${window.location.origin}${item.goUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(item.slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      // ignore
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffSecs = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSecs < 60) return 'Vừa xong';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return 'Hôm qua';
  };

  return (
    <div className="w-full max-w-xl text-left animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-[#D6BDA5]/40 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFE0CE] text-[#A68165]">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-[#725541] sm:text-base">Món Bạn Đã Dán Gần Đây</h3>
            <p className="text-[11px] text-[#A68F7E]">Lưu trên máy &bull; Mở lại món cũ không lo mất link</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[#A68F7E] transition-colors hover:bg-[#EFE0CE] hover:text-[#C27364]"
          title="Xóa toàn bộ lịch sử"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Xóa</span>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {history.map((item) => {
          const isCopied = copiedSlug === item.slug;

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[#D6BDA5]/60 bg-[#FFFDF8] p-3 shadow-2xs transition-all hover:border-[#A68165]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#EFE0CE] px-1.5 py-0.5 text-[10px] font-bold text-[#725541]">
                    <Sparkles className="h-2.5 w-2.5 text-[#A68165]" />
                    <span>Mã {item.discountPercentage}%</span>
                  </span>
                  <span className="text-[10px] text-[#A68F7E]">{formatTimeAgo(item.createdAt)}</span>
                </div>

                <div className="mt-2 truncate font-mono text-xs text-[#725541]">
                  {item.cleanUrl}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#D6BDA5]/30 pt-2">
                <button
                  onClick={() => handleCopyLink(item)}
                  className="flex items-center gap-1 text-[11px] text-[#8E7764] transition-colors hover:text-[#725541]"
                >
                  {isCopied ? (
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

                <a
                  href={item.targetWithVoucherUrl}
                  onClick={(e) => {
                    trackOpenShopeeApp(item.slug, item.discountPercentage);
                    if (
                      typeof window !== 'undefined' &&
                      /Android/i.test(navigator.userAgent) &&
                      item.androidIntent
                    ) {
                      e.preventDefault();
                      window.location.href = item.androidIntent;
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#A68165] px-2.5 py-1 text-[11px] font-bold text-white transition-all hover:bg-[#8E6D54] active:scale-95"
                >
                  <span>Mở App</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
