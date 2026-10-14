'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

export const GentleSavingsTicker: React.FC = () => {
  const [count, setCount] = useState<number>(842);

  useEffect(() => {
    // Dynamic soft counter based on time of day
    const now = new Date();
    const hours = now.getHours();
    const baseCount = 500 + hours * 35;
    setCount(baseCount);

    const interval = setInterval(() => {
      setCount((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-2xl border border-[#D6BDA5]/50 bg-[#FFFDF8]/90 p-2.5 sm:px-4 sm:py-2.5 shadow-warm text-left">
        <div className="flex items-center gap-2 text-xs text-[#725541]">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFE0CE] text-[#A68165]">
            <Heart className="h-3.5 w-3.5 fill-[#A68165]" />
          </span>
          <span className="font-medium">
            Hôm nay đã có <strong>{new Intl.NumberFormat('vi-VN').format(count)}</strong> mẹ tạo link mua đồ thành công ♡
          </span>
        </div>

        <div className="inline-flex items-center gap-1 text-[11px] text-[#A68165] font-semibold shrink-0">
          <Sparkles className="h-3 w-3" />
          <span>Ưu đãi đối tác 25%</span>
        </div>
      </div>
    </div>
  );
};
