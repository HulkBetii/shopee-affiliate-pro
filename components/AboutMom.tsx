'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, ExternalLink, Sparkles } from 'lucide-react';

export const AboutMom: React.FC = () => {
  return (
    <section className="w-full max-w-xl text-left">
      <div className="card-warm relative overflow-hidden rounded-3xl border border-[#D6BDA5]/60 bg-[#FFFDF8] p-5 sm:p-7 shadow-warm text-[#725541]">
        {/* Subtle decorative heart icon */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 text-[#EFE0CE]/60">
          <Heart className="h-32 w-32 fill-current" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          {/* Avatar Mẹ Ngân & Bé Sữa */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#D6BDA5] shadow-warm">
            <Image
              src="/images/avatar-ngan-va-sua.png"
              alt="Mẹ Ngân và bé Sữa"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D6BDA5]/70 bg-[#EFE0CE]/50 px-2.5 py-0.5 text-[11px] font-semibold text-[#725541]">
              <Sparkles className="h-3 w-3 text-[#A68165]" />
              <span>Góc tâm tình của mẹ Sữa</span>
            </div>

            <h3 className="mt-2 font-brand italic text-xl sm:text-2xl font-bold text-[#725541]">
              Xin chào, mình là Ngân ♡
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-[#8E7764] leading-relaxed">
              Mình là mẹ của em bé Sữa. <strong>&ldquo;Nàng thơ làm mẹ&rdquo;</strong> là nơi mình lưu lại hành trình nuôi nấng con, những khoảnh khắc đời thường ấm êm và những món đồ mình thấy thật sự hữu ích trong quá trình chăm sóc bé.
            </p>

            <p className="mt-2 text-xs sm:text-sm text-[#8E7764] leading-relaxed">
              Mình tạo thêm góc nhỏ này để mọi người có thể tự lấy link mua đồ tiện lợi, an tâm mua đúng hàng chính hãng và không phải chờ mình trả lời từng tin nhắn nữa nhé!
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-[#D6BDA5]/30 pt-3">
              <span className="font-brand italic text-xs font-bold text-[#A68165]">
                Thương mến, mẹ Sữa ♡
              </span>

              <a
                href="https://www.tiktok.com/@nganvasua"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-[#EFE0CE] px-3 py-1.5 text-xs font-semibold text-[#725541] transition-all hover:bg-[#D6BDA5]/50 active:scale-95"
              >
                <span>Ghé TikTok @nganvasua</span>
                <ExternalLink className="h-3 w-3 text-[#A68165]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
