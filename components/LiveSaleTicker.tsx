'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, Sparkles } from 'lucide-react';
import { getCurrentShopeeSlot, ShopeeSaleSlot } from '@/lib/marketing/time-slots';

export const LiveSaleTicker: React.FC = () => {
  const [slotData, setSlotData] = useState<{
    slot: ShopeeSaleSlot;
    secondsRemaining: number;
    formattedRemaining: string;
    nextSlotName: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Khởi tạo ngay lập tức
    setSlotData(getCurrentShopeeSlot());

    // Cập nhật mỗi giây
    const timer = setInterval(() => {
      setSlotData(getCurrentShopeeSlot());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted || !slotData) {
    return (
      <div className="w-full max-w-2xl animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
        <div className="h-5 w-48 rounded bg-slate-800" />
      </div>
    );
  }

  const { slot, formattedRemaining } = slotData;
  const [hours, minutes, seconds] = formattedRemaining.split(':');

  // Tính phần trăm thời gian của phiên đã diễn ra
  const slotDurationSecs = (slot.endHour - slot.startHour) * 3600;
  const elapsedSecs = Math.max(0, slotDurationSecs - slotData.secondsRemaining);
  const progressPercent = Math.min(100, Math.max(5, Math.round((elapsedSecs / slotDurationSecs) * 100)));

  return (
    <div className="w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-3 shadow-lg shadow-orange-950/20 sm:p-4">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Cột trái: Tên phiên sale & Highlight */}
          <div className="flex items-start gap-2.5 text-left">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#EE4D2D] to-amber-500 text-white shadow-md shadow-orange-600/30">
              <Flame className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-400">
                  {slot.slotTag}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Đang diễn ra
                </span>
              </div>
              <h3 className="mt-0.5 text-xs font-bold text-white sm:text-sm">
                {slot.slotName}
              </h3>
              <p className="text-[11px] text-slate-400 sm:text-xs">
                {slot.highlightText}
              </p>
            </div>
          </div>

          {/* Cột phải: Đồng hồ đếm ngược kỹ thuật số */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2 sm:flex-col sm:items-end sm:justify-center sm:py-1.5 sm:px-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              <Clock className="h-3 w-3 text-orange-400" />
              <span>Kết thúc sau</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-xs font-black text-orange-300 sm:text-sm">
              <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-white">
                {hours}
              </span>
              <span className="text-orange-500 animate-pulse">:</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-white">
                {minutes}
              </span>
              <span className="text-orange-500 animate-pulse">:</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[#EE4D2D]">
                {seconds}
              </span>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ phiên săn sale */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1">
            <span>Tiến độ phiên săn sale</span>
            <span className="font-semibold text-orange-400">Đã nhận {progressPercent}% voucher</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-[#EE4D2D] to-amber-400 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
