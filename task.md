# Danh sách Nhiệm vụ & Tiến độ (Task Checklist)

## Phase 1: Setup & Auth Core (2.0 ngày)
- [x] **Task 1.1**: Đăng ký & lấy AppId, SecretKey từ Shopee Open API (0.5d) *(Hỗ trợ Mock Sandbox an toàn khi chưa có key)*
- [x] **Task 1.2**: Khởi tạo project Next.js 14+ TypeScript + Tailwind CSS (0.5d)
- [x] **Task 1.3**: Xây dựng module Shopee GraphQL Client & hàm ký số SHA256 (1.0d)

## Phase 2: Link Conversion Engine & Voucher Shim (2.5 ngày)
- [x] **Task 2.1**: Module bóc tách & chuẩn hóa URL (Link Expander & Parser) (0.5d)
- [x] **Task 2.2**: Tích hợp Mutation `generateShortLink` gắn SubIDs (0.5d)
- [x] **Task 2.3**: Module bọc link kích hoạt Voucher (Meta Partner Shim & Deep Link) (1.0d)
- [x] **Task 2.4**: Tích hợp Upstash Redis caching 24h (0.5d) *(kèm In-Memory fallback)*

## Phase 3: Mobile-First Frontend Web (2.0 ngày)
- [x] **Task 3.1**: UI Home, khung dán link 1-click & Modern Dark Mode (1.0d)
- [x] **Task 3.2**: Result Card & CTA nút mở App Shopee mượt mà (0.5d)
- [x] **Task 3.3**: Widget Top Voucher Hot & hướng dẫn tránh rớt đơn (0.5d)

## Phase 4: Automation & Reports (1.5 ngày)
- [x] **Task 4.1**: API đồng bộ doanh thu `conversionReportV2` (1.0d)
- [x] **Task 4.2**: Bot Telegram báo cáo hoa hồng tự động 23h mỗi ngày (0.5d) *(kèm Vercel Cron và Dry-run)*

## Phase 5: Testing, Vercel Deploy & Launch (2.0 ngày)
- [x] **Task 5.1**: Test đa thiết bị & xử lý WebView TikTok In-App (1.0d)
- [x] **Task 5.2**: Deploy lên Vercel + Gắn custom domain + HTTPS (0.5d) *(kèm tài liệu DEPLOYMENT_GUIDE.md)*
- [x] **Task 5.3**: Gắn TikTok Pixel & Google Analytics 4 (0.5d) *(kèm custom conversion events)*
