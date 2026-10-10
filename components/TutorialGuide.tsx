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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Bước 1 */}
        <div className="glass-panel relative rounded-2xl p-4 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-[#EE4D2D]">
            <Share2 className="h-5 w-5" />
          </div>
          <div className="mt-3 text-xs font-bold text-orange-400">BƯỚC 1</div>
          <h4 className="mt-1 text-sm font-semibold text-slate-200">Sao Chép Link Sản Phẩm</h4>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Mở App Shopee, tìm món đồ bạn ưng ý &rarr; Bấm biểu tượng <strong>Chia sẻ</strong> &rarr; Chọn <strong>Sao chép link</strong>.
          </p>
        </div>

        {/* Bước 2 */}
        <div className="glass-panel relative rounded-2xl p-4 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
          <div className="mt-3 text-xs font-bold text-purple-400">BƯỚC 2</div>
          <h4 className="mt-1 text-sm font-semibold text-slate-200">Dán Link Kích Hoạt</h4>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Mở trang web này, bấm <strong>Dán Nhanh</strong> &rarr; Nhấn <strong>LẤY MÃ GIẢM 25%</strong> để hệ thống tiêm voucher.
          </p>
        </div>

        {/* Bước 3 */}
        <div className="glass-panel relative rounded-2xl p-4 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="mt-3 text-xs font-bold text-emerald-400">BƯỚC 3</div>
          <h4 className="mt-1 text-sm font-semibold text-slate-200">Mở App & Thanh Toán</h4>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Bấm nút <strong>MỞ APP SHOPEE</strong> để quay lại ứng dụng. Mã giảm 25% sẽ tự áp dụng tại bước thanh toán.
          </p>
        </div>
      </div>

      {/* Cam kết an toàn */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Shield className="h-4 w-4 text-orange-400" />
          <span>Tại sao phương pháp này an toàn 100%?</span>
        </div>
        <p className="mt-2 leading-relaxed">
          ShopeeLink Pro hoạt động dựa trên cơ chế kết nối chính thức của Shopee Open API. Bạn hoàn toàn thanh toán trực tiếp trong tài khoản ứng dụng Shopee của chính bạn, được tích lũy Shopee Xu, áp dụng song song mã Miễn phí vận chuyển (FreeShip) và bảo lưu toàn bộ quyền trả hàng hoàn tiền 15 ngày.
        </p>
      </div>
    </div>
  );
};
