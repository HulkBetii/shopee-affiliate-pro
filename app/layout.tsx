import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@/components/Analytics';
import { PwaRegister } from '@/components/PwaRegister';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shopee.mrhulkstore.store';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'ShopeeLink Pro - Săn Voucher 25% Shopee | MrHulk Store',
  description: 'Dán link Shopee bất kỳ để nhận ngay mã giảm giá 20-25% tối đa 500k. Đánh thức trực tiếp App Shopee, mua sắm an toàn không lo kẹt trình duyệt.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ShopeeLink Pro',
  },
  keywords: [
    'shopee affiliate',
    'mã giảm giá shopee',
    'voucher shopee 25%',
    'săn sale shopee',
    'shopee link rút gọn',
    'mrhulk store',
    'voucher meta partner',
  ],
  authors: [{ name: 'MrHulk Store' }],
  openGraph: {
    title: 'ShopeeLink Pro - Săn Mã Giảm Giá 25% Shopee | MrHulk Store',
    description: 'Chỉ mất 3 giây để giảm ngay 25% cho đơn hàng Shopee của bạn. Nhận mã độc quyền và mở thẳng App Shopee ngay.',
    url: baseUrl,
    siteName: 'ShopeeLink Pro - MrHulk Store',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopeeLink Pro - Săn Mã Giảm Giá 25% Shopee | MrHulk Store',
    description: 'Dán link Shopee - Giảm ngay 25% mọi đơn hàng. Mở app Shopee trực tiếp.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-[#EE4D2D] selection:text-white">
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#EE4D2D]/20 to-purple-600/20 blur-3xl" />

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-800/80 py-6 safe-bottom text-center text-xs text-slate-500 px-4">
            <p className="font-semibold text-slate-400">ShopeeLink Pro &copy; {new Date().getFullYear()} &bull; Hệ thống tối ưu chuyển đổi Affiliate & Săn Voucher</p>
            <p className="mt-1.5 text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
              * Ưu đãi đối tác 25% (tối đa 500k) được kích hoạt tự động theo ngân sách khuyến mãi và điều kiện từng ngành hàng của Shopee. Mức giảm thực tế căn cứ theo giỏ hàng tại bước thanh toán trong App Shopee.
            </p>
          </footer>
        </div>

        {/* PWA Service Worker Registration */}
        <PwaRegister />

        {/* Third-party Analytics (GA4 & TikTok Pixel) */}
        <Analytics />
      </body>
    </html>
  );
}
