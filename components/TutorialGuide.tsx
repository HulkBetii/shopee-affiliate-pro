'use client';

import React from 'react';
import { Share2, ArrowDownCircle, ShoppingCart, CheckCircle2, Shield } from 'lucide-react';

export const TutorialGuide: React.FC = () => {
  return (
    <div id="tutorial-guide" className="w-full max-w-2xl scroll-mt-24 text-left">
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-white sm:text-xl">
          3 Bước Săn Mã Giảm Giá Shopee Đơn Giản
        </h3>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Tiết kiệm ngay 20% - 25% cho bất kỳ sản phẩm nào bạn muốn mua
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* Bước 1 */}
        <div className="glass-panel relative rounded-2xl p-4 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-[#EE4D2D]">
            <Share2 className="h-5 w-5" />
          </div>
          <div className="mt-3 text-xs font-bold text-orange-400">BƯỚC 1</div>
          <h4 className="mt-1 text-sm font-bold text-slate-200">Sao Chép Link Sản Phẩm</h4>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Mở App Shopee &rarr; Bấm biểu tượng <strong>Chia sẻ (↗)</strong> ở góc trên bên phải ảnh sản phẩm &rarr; Chọn <strong>Sao chép liên kết</strong>.
          </p>
        </div>

        {/* Bước 2 */}
        <div className="glass-panel relative rounded-2xl p-4 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
          <div className="mt-3 text-xs font-bold text-purple-400">BƯỚC 2</div>
          <h4 className="mt-1 text-sm font-bold text-slate-200">Dán Link Kích Hoạt</h4>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Mở ShopeeLink Pro, bấm <strong>Dán Nhanh</strong> &rarr; Nhấn <strong>LẤY MÃ GIẢM 25%</strong> để hệ thống tiêm voucher vào liên kết.
          </p>
        </div>

        {/* Bước 3 */}
        <div className="glass-panel relative rounded-2xl p-4 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="mt-3 text-xs font-bold text-emerald-400">BƯỚC 3</div>
          <h4 className="mt-1 text-sm font-bold text-slate-200">Mở App & Thanh Toán</h4>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Bấm <strong>MỞ APP SHOPEE</strong> để quay lại ứng dụng. Mã giảm 25% độc quyền sẽ tự áp dụng tại mục Shopee Voucher trong giỏ hàng.
          </p>
        </div>
      </div>

      {/* Cam kết an toàn & Quyền lợi */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 sm:p-5">
        <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
          <Shield className="h-4 w-4 text-orange-400" />
          <span>Tại sao mua qua ShopeeLink Pro an toàn 100%?</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
            <div className="font-semibold text-slate-200">✅ Thanh toán tại App Shopee</div>
            <p className="mt-1 text-[11px] text-slate-400">Đăng nhập và thanh toán trên chính app Shopee của bạn, tuyệt đối bảo mật thông tin.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
            <div className="font-semibold text-slate-200">✅ Áp song song mã FreeShip</div>
            <p className="mt-1 text-[11px] text-slate-400">Được dùng chung mã Miễn phí vận chuyển, Voucher Shop và tích lũy Shopee Xu.</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
            <div className="font-semibold text-slate-200">✅ Giữ nguyên bảo hành 15 ngày</div>
            <p className="mt-1 text-[11px] text-slate-400">Đầy đủ quyền lợi trả hàng hoàn tiền 15 ngày miễn phí theo chính sách chính hãng Shopee.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
