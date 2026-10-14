'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Sparkles, Star, ArrowUpRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { CURATED_PRODUCTS, STAGE_TABS, CuratedProduct } from '@/lib/marketing/curated-products';
import { trackOpenShopeeApp } from '@/lib/analytics';

interface CuratedShelfProps {
  onSelectProduct?: (shopeeUrl: string) => void;
}

export const CuratedShelf: React.FC<CuratedShelfProps> = ({ onSelectProduct }) => {
  const [activeTab, setActiveTab] = useState<CuratedProduct['stage']>('0_6m');
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const filteredProducts = CURATED_PRODUCTS.filter((p) => p.stage === activeTab);

  const handleOpenProduct = async (product: CuratedProduct) => {
    setLoadingProductId(product.id);
    try {
      // Gọi API convert để sinh link affiliate chuẩn và kích hoạt voucher đối tác
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: product.shopeeUrl,
          subIds: ['nganvasua_curated', product.stage],
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        trackOpenShopeeApp(json.data.slug, json.data.discountPercentage);
        if (typeof window !== 'undefined') {
          const isAndroid = /Android/i.test(navigator.userAgent);
          if (isAndroid && json.data.androidIntent) {
            window.location.href = json.data.androidIntent;
          } else {
            window.location.href = json.data.targetWithVoucherUrl;
          }
        }
      } else {
        // Fallback: Mở link Shopee trực tiếp
        window.open(product.shopeeUrl, '_blank');
      }
    } catch {
      window.open(product.shopeeUrl, '_blank');
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <section id="curated-shelf" className="w-full max-w-4xl scroll-mt-16 text-left">
      {/* Tiêu đề khu vực */}
      <div className="mb-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D6BDA5] bg-[#EFE0CE]/60 px-3 py-0.5 text-xs font-semibold text-[#725541]">
          <Heart className="h-3 w-3 text-[#A68165] fill-[#A68165]" />
          <span>Tủ đồ của bé Sữa ♡</span>
        </div>

        <h2 className="mt-1.5 font-heading text-xl sm:text-2xl font-bold text-[#725541]">
          Những Món Mẹ Ngân Đã Chọn Lọc Kỹ Lưỡng
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#8E7764]">
          Đều là những món đồ mẹ Ngân đã dùng thật, bé Sữa đồng hành mỗi ngày và thấy thật sự hữu ích
        </p>
      </div>

      {/* Tabs tháng tuổi (4 Tabs vùng ngón cái) */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar sm:grid sm:grid-cols-4">
        {STAGE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CuratedProduct['stage'])}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-left transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#725541] text-white shadow-warm-btn font-bold'
                  : 'bg-[#FFFDF8] border border-[#D6BDA5]/60 text-[#725541] hover:bg-[#EFE0CE]'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm leading-tight">{tab.label}</span>
                <span
                  className={`text-[10px] ${
                    isActive ? 'text-[#D6BDA5]' : 'text-[#A68F7E]'
                  }`}
                >
                  {tab.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid danh sách sản phẩm (2 cột mobile, 4 cột desktop) */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {filteredProducts.map((product) => {
          const isLoading = loadingProductId === product.id;

          return (
            <div
              key={product.id}
              className="card-warm group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D6BDA5]/60 bg-[#FFFDF8] p-2.5 sm:p-3 shadow-warm transition-all hover:border-[#A68165] hover:shadow-warm-lg"
            >
              <div>
                {/* Ảnh Thumbnail Sản Phẩm */}
                <div
                  className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#EFE0CE]/40"
                  style={{ position: 'relative', aspectRatio: '1 / 1', width: '100%' }}
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Tag góc ảnh */}
                  <span className="absolute top-1.5 left-1.5 rounded-md bg-[#725541]/90 backdrop-blur-xs px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
                    {product.tag}
                  </span>
                </div>

                {/* Tiêu đề & Đánh giá */}
                <h3 className="mt-2 line-clamp-2 text-xs sm:text-sm font-semibold text-[#725541] leading-snug">
                  {product.name}
                </h3>

                <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] text-[#A68F7E]">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-[#725541]">{product.rating}</span>
                  <span>({product.reviewCount})</span>
                </div>

                {/* Giá tiền */}
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-[#A68165]">
                    {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-[#B8A494] line-through">
                      {product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Review chân thật của mẹ Ngân */}
                <div className="mt-2 rounded-xl bg-[#F8F0E5]/70 border border-[#D6BDA5]/40 p-2 text-left">
                  <p className="text-[10px] sm:text-[11px] italic text-[#725541] leading-relaxed line-clamp-3">
                    &ldquo;{product.personalNote}&rdquo;
                  </p>
                  <span className="mt-1 block text-[9px] font-bold text-[#A68165] not-italic text-right">
                    — Mẹ Sữa ♡
                  </span>
                </div>
              </div>

              {/* Nút 1-Chạm Mở Shopee App */}
              <div className="mt-3">
                <button
                  onClick={() => handleOpenProduct(product)}
                  disabled={isLoading}
                  className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#A68165] px-3 py-1.5 text-xs font-bold text-white shadow-warm-btn transition-all hover:bg-[#8E6D54] active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Đang mở...</span>
                  ) : (
                    <>
                      <span>Mở Shopee</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
