# Hướng Dẫn Triển Khai Lên Vercel & Go-Live (Deployment Guide)

> **Dự án**: ShopeeLink Pro  
> **Nền tảng**: Vercel Serverless (Next.js 14 App Router)

---

## 1. Chuẩn bị trước khi Triển khai

1. Tài khoản GitHub (để lưu trữ mã nguồn).
2. Tài khoản Vercel ([vercel.com](https://vercel.com) - Gói Hobby miễn phí hoàn toàn).
3. Tài khoản Shopee Affiliate Console (để lấy AppId & SecretKey nếu có).
4. Tên miền riêng (Custom Domain - Tùy chọn, ví dụ `shopeelink.pro` hoặc subdomain `voucher.tenmien.com`).

---

## 2. Các Bước Triển Khai (3 Bước Đơn Giản)

### Bước 1: Đẩy mã nguồn lên GitHub
Trong thư mục dự án trên máy của bạn:
```bash
git add .
git commit -m "feat: complete ShopeeLink Pro production ready"
git remote add origin https://github.com/YOUR_USERNAME/shopee-affiliate-pro.git
git branch -M main
git push -u origin main
```

### Bước 2: Import Project vào Vercel
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard).
2. Bấm nút **"Add New..."** $\rightarrow$ **"Project"**.
3. Chọn Repository `shopee-affiliate-pro` từ tài khoản GitHub của bạn $\rightarrow$ Bấm **Import**.
4. Tại mục **Environment Variables**, bấm mở rộng và điền các biến sau:

| Tên biến | Giá trị gợi ý | Bắt buộc? |
| :--- | :--- | :---: |
| `SHOPEE_APP_ID` | Mã AppId từ Shopee Console *(hoặc để trống dùng Mock)* | Tùy chọn |
| `SHOPEE_SECRET_KEY` | Khóa Secret từ Shopee Console | Tùy chọn |
| `SHOPEE_GRAPHQL_ENDPOINT` | `https://open-api.affiliate.shopee.vn/graphql` | Có |
| `SHOPEE_MOCK_MODE` | `false` *(khi có key thật)* hoặc `true` *(khi test)* | Có |
| `NEXT_PUBLIC_BASE_URL` | Domain chính thức của bạn (ví dụ `https://shopeelink.pro`) | Có |
| `CRON_SECRET` | Chuỗi ký tự ngẫu nhiên để bảo vệ API báo cáo | Có |
| `UPSTASH_REDIS_REST_URL` | URL từ Upstash Console *(nếu có)* | Tùy chọn |
| `UPSTASH_REDIS_REST_TOKEN` | Token từ Upstash Console *(nếu có)* | Tùy chọn |
| `TELEGRAM_BOT_TOKEN` | Token từ `@BotFather` | Tùy chọn |
| `TELEGRAM_CHAT_ID` | Chat ID của bạn từ `@userinfobot` | Tùy chọn |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Tùy chọn |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | Mã Pixel từ TikTok Ads Manager | Tùy chọn |

5. Bấm nút **"Deploy"**. Vercel sẽ tự động build và cấp domain `https://shopee-affiliate-pro.vercel.app` trong vòng 60 giây!

---

### Bước 3: Cấu hình Tên miền Riêng (Custom Domain)
1. Tại dự án trên Vercel $\rightarrow$ vào tab **Settings** $\rightarrow$ **Domains**.
2. Nhập tên miền của bạn (ví dụ `shopeelink.pro` hoặc `voucher.domain.com`) $\rightarrow$ Bấm **Add**.
3. Vào trang quản lý DNS tên miền của bạn (Cloudflare, Namecheap, Matbao, v.v.) và trỏ bản ghi:
   - Nếu là Root domain (`shopeelink.pro`): **A record** trỏ về IP `76.76.21.21`
   - Nếu là Subdomain (`voucher.shopee...`): **CNAME record** trỏ về `cname.vercel-dns.com`
4. Vercel sẽ tự động cấp chứng chỉ bảo mật **SSL/HTTPS miễn phí** trong vòng vài phút.

---

## 3. Kiểm tra Tính năng Tự động hóa

* **Kiểm tra Cron Job**:
  - Tại trang dự án trên Vercel $\rightarrow$ chọn tab **Settings** $\rightarrow$ **Cron Jobs**.
  - Bạn sẽ thấy Job `/api/sync-reports?sendTelegram=true` được lên lịch chạy vào **23:00 mỗi ngày**.
* **Kiểm tra SEO**:
  - Truy cập `https://your-domain.com/robots.txt`
  - Truy cập `https://your-domain.com/sitemap.xml`

Chúc bạn săn sale và phát triển doanh số Affiliate thành công rực rỡ với ShopeeLink Pro! 🚀
