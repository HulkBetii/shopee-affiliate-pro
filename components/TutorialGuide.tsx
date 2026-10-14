'use client';

import React from 'react';
import { Share2, ArrowDownCircle, ShoppingBag, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const TutorialGuide: React.FC = () => {
  return (
    <div id="tutorial-guide" className="w-full max-w-xl scroll-mt-20 text-left">
      <div className="text-center sm:text-left mb-3">
        <h3 className="font-heading font-bold text-base sm:text-lg text-[#725541]">
          Chỉ 3 bước nhỏ thôi ♡
        </h3>
        <p className="text-xs text-[#8E7764]">
          Dễ dàng tìm lại và mua đúng món đồ mẹ Ngân chia sẻ
        </p>
      </div>

      {/* Unified Compact Stepper (Thẻ Be Kem Ấm Áp) */}
      <div className="card-warm p-4 sm:p-5 border border-[#D6BDA5]/60 bg-[#FFFDF8] shadow-warm">
        <div className="space-y-4">
          {/* Bước 1 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFE0CE] text-xs font-bold text-[#A68165]">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#725541]">
                <Share2 className="h-3.5 w-3.5 text-[#A68165]" />
                <span>Sao Chép Link Sản Phẩm</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#8E7764]">
                Mở Shopee App &rarr; Bấm nút <strong>Chia sẻ (↗)</strong> ở góc trên bên phải &rarr; Chọn <strong>Sao chép liên kết</strong>.
              </p>
            </div>
          </div>

          <div className="ml-3.5 h-3 w-px bg-[#D6BDA5]/40" />

          {/* Bước 2 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFE0CE] text-xs font-bold text-[#A68165]">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#725541]">
                <ArrowDownCircle className="h-3.5 w-3.5 text-[#A68165]" />
                <span>Dán Link Vào Góc Của Ngân</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#8E7764]">
                Quay lại đây, bấm <strong>Dán</strong> &rarr; Nhấn <strong>TẠO LINK MUA HÀNG</strong> để hệ thống chuẩn bị đường link ưu đãi.
              </p>
            </div>
          </div>

          <div className="ml-3.5 h-3 w-px bg-[#D6BDA5]/40" />

          {/* Bước 3 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFE0CE] text-xs font-bold text-[#A68165]">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#725541]">
                <ShoppingBag className="h-3.5 w-3.5 text-[#A68165]" />
                <span>Mở App Shopee & Đặt Hàng</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#8E7764]">
                Nhấn <strong>MỞ XEM TRÊN SHOPEE</strong> để vào thẳng App, thêm vào giỏ hàng và chọn mã giảm giá tại bước thanh toán.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-3.5 mb-2 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-[#D6BDA5]/50 bg-[#FFFDF8] p-2.5 text-center shadow-2xs">
          <ShieldCheck className="mx-auto h-4 w-4 text-emerald-600" />
          <div className="mt-1 text-[11px] font-bold text-[#725541]">100% Shopee App</div>
          <p className="mt-0.5 text-[9px] text-[#A68F7E] hidden xs:block">Thanh toán bảo mật</p>
        </div>

        <div className="rounded-xl border border-[#D6BDA5]/50 bg-[#FFFDF8] p-2.5 text-center shadow-2xs">
          <Sparkles className="mx-auto h-4 w-4 text-[#A68165]" />
          <div className="mt-1 text-[11px] font-bold text-[#725541]">Ưu Đãi Đối Tác</div>
          <p className="mt-0.5 text-[9px] text-[#A68F7E] hidden xs:block">Tự động gắn mã</p>
        </div>

        <div className="rounded-xl border border-[#D6BDA5]/50 bg-[#FFFDF8] p-2.5 text-center shadow-2xs">
          <Heart className="mx-auto h-4 w-4 text-[#C27364]" />
          <div className="mt-1 text-[11px] font-bold text-[#725541]">Đồ Thật Mẹ Dùng</div>
          <p className="mt-0.5 text-[9px] text-[#A68F7E] hidden xs:block">Kiểm chứng kỹ lưỡng</p>
        </div>
      </div>
    </div>
  );
};
