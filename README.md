# ShopeeLink Pro - Hệ Thống Shopee Affiliate Converter & Voucher Injection

> Dự án tự động hóa chuyển đổi link Shopee Affiliate, tích hợp cơ chế kích hoạt Voucher độc quyền (Meta Partner / Shopee Video / Live) và tối ưu phễu chuyển đổi từ mạng xã hội (TikTok, Facebook Reels, Shorts).

---

## 📌 1. Tổng quan Dự án

Hệ thống cho phép người dùng dán bất kỳ đường link sản phẩm Shopee nào và nhận lại một **Link Mua Hàng Ưu Đãi** đã được:
1. Gắn mã tiếp thị liên kết (**Shopee Affiliate Tracking**) chính chủ qua Shopee Open API.
2. Tự động kích hoạt các tầng giảm giá sâu (**Voucher 20% - 25% tối đa 300k - 500k** từ chương trình Meta Partner hoặc Video/Live).
3. Đánh thức trực tiếp ứng dụng Shopee (Universal Deep Link) mà không bị kẹt trong trình duyệt nhúng (In-App WebView) của TikTok/Facebook.

---

## 🏗️ 2. Tech Stack Lựa chọn

* **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons (Tối ưu Mobile-first, Dark Mode).
* **Backend**: Next.js Serverless API Routes / Node.js runtime.
* **Core API**: Shopee Open API (GraphQL endpoint chính thức `https://open-api.affiliate.shopee.vn/graphql`).
* **Caching & Storage**: Upstash Redis (Free tier) hoặc SQLite / In-memory cache để giảm tải Shopee rate-limit.
* **Deployment**: Vercel (Miễn phí, CI/CD tự động từ GitHub, tích hợp Edge Functions).
* **Notification Bot (Mở rộng)**: Telegram Bot (`telegraf` hoặc Python `aiogram`) thông báo đối soát doanh thu mỗi ngày.

---

## 📂 3. Cấu trúc Tài liệu Dự án

Tất cả các tài liệu kỹ thuật và định hướng chuyên sâu được lưu trữ tại thư mục [`docs/`](./docs/):

| Tài liệu | Nội dung chính |
| :--- | :--- |
| **[`docs/PROJECT_PLAN.md`](./docs/PROJECT_PLAN.md)** | Kế hoạch triển khai 5 Phase, phân rã WBS 13 tasks, estimate thời gian và 2 rủi ro kỹ thuật lớn nhất. |
| **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** | Kiến trúc kỹ thuật chi tiết: Flow dữ liệu, module bóc tách URL, cơ chế Shim Redirect và Deep Link. |
| **[`docs/SHOPEE_API_SPEC.md`](./docs/SHOPEE_API_SPEC.md)** | Đặc tả kỹ thuật Shopee Open API GraphQL, thuật toán ký số SHA256, code mẫu Node.js/Python, và Data API gắn tag. |
| **[`docs/FUNNEL_AND_STRATEGY.md`](./docs/FUNNEL_AND_STRATEGY.md)** | Chiến lược phễu TikTok $\rightarrow$ Web/Zalo, kịch bản video hook 3s, giữ chân khách và chính sách chống đóng băng hoa hồng. |
| **[`docs/REPOS_AND_ECOSYSTEM.md`](./docs/REPOS_AND_ECOSYSTEM.md)** | Đánh giá các mã nguồn mở liên quan (GitHub repos, MCP servers, `bcat95/shopee-aff`, `zca-js`, `addlivetag`). |

---

## 🚀 4. Lộ trình Triển khai Nhanh (Roadmap)

```
[Phase 1: Setup & Shopee Auth Core] ──► [Phase 2: Link Engine & Voucher Shim]
                                                          │
[Phase 4: Telegram Automation]      ◄── [Phase 3: Mobile-First Frontend Web]
         │
         ▼
[Phase 5: In-App WebView Test & Vercel Deploy] ──► GO-LIVE
```

---

## ⚙️ 5. Bắt đầu Cài đặt (Getting Started)

1. Sao chép cấu hình môi trường:
   ```bash
   cp .env.example .env.local
   ```
2. Điền các tham số `SHOPEE_APP_ID`, `SHOPEE_SECRET_KEY` lấy từ trang Shopee Affiliate Console.
3. Cài đặt dependencies và chạy dev server:
   ```bash
   npm install
   npm run dev
   ```
