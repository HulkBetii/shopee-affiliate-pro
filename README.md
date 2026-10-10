# ShopeeLink Pro - Hệ Thống Săn Voucher 25% & Rút Gọn Shopee Link

> **Website chính thức**: [https://shopee.mrhulkstore.store](https://shopee.mrhulkstore.store)  
> **Mirror Deploy (Vercel)**: [https://shopeelink-pr.vercel.app](https://shopeelink-pr.vercel.app)  
> **Shopee Partner Tracking ID**: `an_17315740682`  
> **Đơn vị phát triển**: MrHulk Store

---

## 📌 1. Tổng quan Dự án

**ShopeeLink Pro** là hệ thống tự động hóa chuyển đổi liên kết Shopee Affiliate, tích hợp cơ chế kích hoạt Voucher độc quyền (Meta Partner / Shopee Video / Live) và tối ưu hóa phễu chuyển đổi từ mạng xã hội (TikTok Bio, Facebook Reels, Shorts, Zalo).

### Điểm nổi bật:
1. **Khối Chuyển Đổi Vàng (Mobile-First Golden Block)**: 100% thao tác xem lợi ích, dán link và bấm mở App Shopee nằm trọn vẹn trong **Màn hình đầu tiên (Above-The-Fold)** trên điện thoại di động, không cần cuộn trang.
2. **Triệt tiêu lỗi iOS Auto-Zoom**: Chuẩn hóa ô nhập liệu 16px chống phóng to màn hình trên iPhone Safari.
3. **Cơ chế Universal Deep Link**: Đánh thức trực tiếp ứng dụng Shopee, tự động gắn mã giảm giá 20% - 25% (tối đa 500k) và khắc phục tình trạng kẹt trong trình duyệt nhúng của TikTok / Facebook Messenger.
4. **Kiến trúc Hybrid Tracking**: Hỗ trợ đồng thời Shopee Open API (GraphQL) và kiến trúc Non-OpenAPI Direct Tracking với mã Partner ID `an_17315740682`.
5. **Branded Domain trên Cloudflare Edge**: Tên miền thương hiệu riêng `shopee.mrhulkstore.store` giúp tăng tỷ lệ nhấp chuột (CTR), chống bị mạng xã hội quét chặn link.

---

## 🏗️ 2. Tech Stack

* **Frontend**: Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide Icons (Tối ưu Mobile-First, Dark Mode Glassmorphism).
* **Backend**: Next.js Serverless Route Handlers / Node.js runtime.
* **Core API**: Shopee Open API GraphQL (`open-api.affiliate.shopee.vn`) & Non-OpenAPI Direct Tracking Engine.
* **DNS & Hosting**: Cloudflare DNS (CNAME record) + Vercel Global Edge Network (SSL HTTPS tự động).
* **Caching & Storage**: Upstash Redis (REST API) & In-memory Fallback Cache.
* **Automation**: Telegram Bot Notifier (Báo cáo đối soát doanh thu tự động lúc 23:00 hàng ngày).

---

## 📂 3. Cấu trúc Tài liệu Dự án

Tất cả các tài liệu kỹ thuật và cẩm nang vận hành được lưu trữ tại thư mục [`docs/`](./docs/):

| Tài liệu | Nội dung chính |
| :--- | :--- |
| **[`docs/TRAFFIC_AND_SEEDING_PLAYBOOK.md`](./docs/TRAFFIC_AND_SEEDING_PLAYBOOK.md)** | **[MỚI]** Cẩm nang đi comment dạo không bị ẩn, 3 kịch bản video TikTok 15s chuyển đổi cao, quy trình kéo traffic. |
| **[`docs/PROJECT_PLAN.md`](./docs/PROJECT_PLAN.md)** | Kế hoạch triển khai 5 Phase, phân rã WBS 13 tasks và đánh giá rủi ro kỹ thuật. |
| **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** | Kiến trúc kỹ thuật chi tiết: Flow dữ liệu, module bóc tách URL, cơ chế Shim Redirect và Deep Link. |
| **[`docs/SHOPEE_API_SPEC.md`](./docs/SHOPEE_API_SPEC.md)** | Đặc tả kỹ thuật Shopee Open API GraphQL, thuật toán ký số SHA256 và Data API. |
| **[`docs/FUNNEL_AND_STRATEGY.md`](./docs/FUNNEL_AND_STRATEGY.md)** | Chiến lược phễu TikTok $\rightarrow$ Web/Zalo, kịch bản video hook 3s và chống đóng băng hoa hồng. |
| **[`docs/REPOS_AND_ECOSYSTEM.md`](./docs/REPOS_AND_ECOSYSTEM.md)** | Đánh giá các mã nguồn mở liên quan (GitHub repos, MCP servers, ecosystem). |

---

## 🧪 4. Kiểm Thử & Xác Minh (Test Suite)

Hệ thống được bảo vệ bởi 6 kịch bản kiểm thử độc lập (`26/26 tests passed`):

```bash
npm run test:all
```

* **Phase 1 Verification**: Thuật toán ký số SHA256, GraphQL mutation `generateShortLink`, query `productOfferV2`, `conversionReport`.
* **Phase 2 Verification**: Trích xuất link thô, chuẩn hóa URL, CacheService fallback, Shim voucher injection.
* **Phase 3 Verification**: Frontend payload schema, ConvertForm multiline paste, Bridge Route `/go/[slug]`.
* **Phase 4 Verification**: Doanh số GMV, formatter tiền tệ VNĐ, Telegram Bot notification dry-run.
* **Phase 5 Verification**: Analytics safe execution, SEO robots metadata, sitemap metadata, security headers.
* **Non-API Verification**: Direct tracking builder, ShopeeSessionClient graceful fallback, Non-API deep link shim.

---

## ⚙️ 5. Hướng Dẫn Cài Đặt (Local Development)

1. Clone kho lưu trữ:
   ```bash
   git clone https://github.com/HulkBetii/shopee-affiliate-pro.git
   cd shopee-affiliate-pro
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Cấu hình file môi trường `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Khởi chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 🌐 6. Triển Khai Sản Phẩm (Production Deployment)

Hệ thống được thiết lập CI/CD tự động:
- Đẩy code lên nhánh `main` của repository `shopeelink-pr` &rarr; Vercel tự động build và phát hành lên **`https://shopee.mrhulkstore.store`**.
