import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Lora, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Analytics } from '@/components/Analytics';
import { PwaRegister } from '@/components/PwaRegister';

const playfair = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const lora = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shopee.mrhulkstore.store';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Nàng thơ làm mẹ ♡ | Tủ Đồ Bé Sữa & Góc Nhỏ Cùng Mẹ Ngân',
  description: 'Góc nhỏ thân tình chia sẻ những món đồ chân ái cho mẹ và bé. Tự tạo link mua hàng Shopee nhanh chóng, tiện lợi và tiết kiệm cùng mẹ Sữa.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nàng thơ làm mẹ',
  },
  keywords: [
    'nàng thơ làm mẹ',
    'ngân và sữa',
    'nganvasua',
    'đồ dùng mẹ và bé',
    'kinh nghiệm chăm con',
    'tủ đồ bé sữa',
    'mã giảm giá shopee',
    'shopee affiliate',
  ],
  authors: [{ name: 'Ngân & Bé Sữa', url: 'https://www.tiktok.com/@nganvasua' }],
  openGraph: {
    title: 'Nàng thơ làm mẹ ♡ | Tủ Đồ Bé Sữa & Góc Nhỏ Cùng Mẹ Ngân',
    description: 'Chia sẻ những món đồ hữu ích trong hành trình chăm sóc bé Sữa. Dán link để tạo link mua hàng Shopee nhanh chóng và tiện lợi.',
    url: baseUrl,
    siteName: 'Nàng thơ làm mẹ ♡',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nàng thơ làm mẹ ♡ | Tủ Đồ Bé Sữa & Góc Nhỏ Cùng Mẹ Ngân',
    description: 'Góc nhỏ thân tình chia sẻ những món đồ chân ái cho mẹ và bé.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F8F0E5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${lora.variable} ${beVietnam.variable}`}
    >
      <body className="min-h-[100dvh] bg-[#F8F0E5] text-[#725541] font-sans antialiased selection:bg-[#A68165] selection:text-white">
        <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
          {/* Gentle Sunlight Ambient Backdrop */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#EFE0CE]/70 via-[#F8EBE6]/60 to-[#FFFDF8]/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -right-32 -z-10 h-80 w-80 rounded-full bg-[#EFE0CE]/40 blur-3xl" />

          <main className="flex-1">{children}</main>

          <footer
            id="app-footer"
            className="border-t border-[#D6BDA5]/30 bg-[#EFE0CE]/40 pt-8 pb-28 sm:pb-10 safe-sticky-bottom text-center text-xs text-[#8E7764] px-4"
          >
            <p className="font-brand italic text-base font-bold text-[#725541]">
              Nàng thơ làm mẹ ♡
            </p>
            <p className="mt-1 text-xs text-[#8E7764]">
              Chia sẻ những điều nhỏ bé, bằng thật nhiều yêu thương &bull; Chuyện nhỏ của mẹ Ngân & Sữa
            </p>
            <p className="mt-3 text-[11px] text-[#A68F7E] max-w-xl mx-auto leading-relaxed">
              * Khi tạo link mua hàng qua website, đơn hàng có thể được áp dụng mã giảm giá đối tác Shopee tùy theo điều kiện giỏ hàng và ngân sách của sàn. Mẹ Ngân có thể nhận một phần hoa hồng nhỏ để duy trì góc nhỏ này.
            </p>
            <p className="mt-3 text-[10px] text-[#B8A494]">
              &copy; {new Date().getFullYear()} Nàng thơ làm mẹ &bull; Made with love for Sữa & các mẹ ♡
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
