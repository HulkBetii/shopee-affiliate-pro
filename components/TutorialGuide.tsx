'use client';

import React from 'react';
import { Share2, ArrowDownCircle, ShoppingCart, CheckCircle2, Shield } from 'lucide-react';

export const TutorialGuide: React.FC = () => {
  return (
    <div id="tutorial-guide" className="w-full max-w-2xl scroll-mt-20 text-left">
      <div className="text-center sm:text-left">
        <h3 className="text-base font-bold text-white sm:text-lg">
          3 Bước Săn Mã Đơn Giản
        </h3>
        <p className="text-xs text-slate-400">
          Chỉ mất 5 giây để giảm ngay 20% - 25% cho món đồ bạn yêu thích
        </p>
      </div>

      {/* Unified Compact Stepper (1 Thẻ Duy Nhất) */}
      <div className="glass-panel mt-3.5 rounded-2xl p-4 sm:p-5">
        <div className="space-y-4">
          {/* Bước 1 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-black text-orange-400">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Share2 className="h-3.5 w-3.5 text-orange-400" />
                <span>Sao Chép Link Sản Phẩm</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                Mở Shopee App &rarr; Bấm biểu tượng <strong>Chia sẻ (↗)</strong> ở góc trên bên phải &rarr; Chọn <strong>Sao chép liên kết</strong>.
              </p>
            </div>
          </div>

          <div className="ml-3.5 h-3 w-px bg-slate-800" />

          {/* Bước 2 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-black text-purple-400">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <ArrowDownCircle className="h-3.5 w-3.5 text-purple-400" />
                <span>Dán Link Nhận Mã Giảm 25%</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                Quay lại web này, bấm <strong>Dán</strong> &rarr; Nhấn <strong>LẤY MÃ GIẢM 25%</strong> để hệ thống tiêm voucher vào liên kết.
              </p>
            </div>
          </div>

          <div className="ml-3.5 h-3 w-px bg-slate-800" />

          {/* Bước 3 */}
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-400">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
                <span>Mở App Shopee & Thanh Toán</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                Bấm <strong>MỞ APP SHOPEE</strong>. Voucher 25% độc quyền sẽ tự động hiển thị trong mục <strong>Shopee Voucher</strong> khi đặt hàng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges: Hàng 3 Cột Ngang Tinh Tế */}
      <div className="mt-3.5 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5 text-center">
          <Shield className="mx-auto h-4 w-4 text-emerald-400" />
          <div className="mt-1 text-[11px] font-bold text-slate-200">100% Shopee App</div>
          <p className="mt-0.5 text-[9px] text-slate-400 hidden xs:block">Thanh toán bảo mật</p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5 text-center">
          <CheckCircle2 className="mx-auto h-4 w-4 text-orange-400" />
          <div className="mt-1 text-[11px] font-bold text-slate-200">Áp FreeShip Xtra</div>
          <p className="mt-0.5 text-[9px] text-slate-400 hidden xs:block">Dùng chung mọi mã</p>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5 text-center">
          <Shield className="mx-auto h-4 w-4 text-amber-400" />
          <div className="mt-1 text-[11px] font-bold text-slate-200">Đổi Trả 15 Ngày</div>
          <p className="mt-0.5 text-[9px] text-slate-400 hidden xs:block">Chính hãng Shopee</p>
        </div>
      </div>
    </div>
  );
};
