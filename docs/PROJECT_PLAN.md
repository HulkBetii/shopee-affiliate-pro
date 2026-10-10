# Kế hoạch Dự án & Phân rã Công việc (Work Breakdown Structure - WBS)

> **Dự án**: ShopeeLink Pro  
> **Vai trò**: Tech Lead / Project Manager  
> **Thời gian dự tính**: 8.5 – 9.5 ngày làm việc (1 developer)

---

## 1. Bản đồ Phân bổ Công việc theo Giai đoạn

### Phase 1: Khởi tạo Dự án & Lõi Xác thực API (Setup & Auth Core)
* **Thời gian**: 2.0 ngày
* **Mục tiêu**: Kết nối thành công và gọi được Shopee Open API GraphQL từ môi trường local.
  * **Task 1.1**: Đăng ký & cấu hình tài khoản Shopee Open API (`AppId`, `SecretKey`). *(Estimate: 0.5d)*
  * **Task 1.2**: Khởi tạo base repo Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide). *(Estimate: 0.5d)*
  * **Task 1.3**: Viết module Shopee GraphQL Client & hàm ký số SHA256 header. Viết unit test gọi thử nghiệm query `shopeeOfferV2`. *(Estimate: 1.0d)*

### Phase 2: Xây dựng Lõi Xử lý Link & Kích hoạt Voucher (Core Conversion Engine)
* **Thời gian**: 2.5 ngày
* **Mục tiêu**: Chuyển đổi mọi link sản phẩm thô thành link tiếp thị kèm cơ chế kích hoạt voucher.
  * **Task 2.1**: Module bóc tách & chuẩn hóa URL (Link Expander & Parser): Xử lý link rút gọn `s.shopee.vn`, `vn.shp.ee`, bóc tách `item_id`, `shop_id`. *(Estimate: 0.5d)*
  * **Task 2.2**: Gọi Mutation `generateShortLink` gắn mảng `subIds` phục vụ đo lường chuyển đổi. *(Estimate: 0.5d)*
  * **Task 2.3**: Xây dựng module bọc link kích hoạt Voucher (Meta Partner Shim & Universal Deep Link `shopee://`). *(Estimate: 1.0d)*
  * **Task 2.4**: Tích hợp Caching Layer (Upstash Redis Free Tier) lưu cache link 24h, tránh chạm rate limit. *(Estimate: 0.5d)*

### Phase 3: Giao diện Người dùng Mobile-First (Frontend & UX)
* **Thời gian**: 2.0 ngày
* **Mục tiêu**: Trải nghiệm mượt mà, tối ưu hóa 100% cho màn hình điện thoại và trình duyệt nhúng.
  * **Task 3.1**: Trang chủ với khung input 1-Click (Tích hợp Clipboard API dán tự động) + Nút CTA bắt mắt. *(Estimate: 1.0d)*
  * **Task 3.2**: Card hiển thị kết quả (Ảnh sản phẩm, giá sau giảm, voucher code, nút mở App Shopee). *(Estimate: 0.5d)*
  * **Task 3.3**: Widget danh sách Top Voucher Hot trong ngày & hướng dẫn chống rớt đơn. *(Estimate: 0.5d)*

### Phase 4: Tự động hóa Báo cáo & Mở rộng (Analytics & Automation)
* **Thời gian**: 1.5 ngày
* **Mục tiêu**: Giám sát hoa hồng tự động và không cần vào trang Shopee kiểm tra thủ công.
  * **Task 4.1**: Viết API kéo dữ liệu `conversionReportV2` (số đơn, hoa hồng ước tính). *(Estimate: 1.0d)*
  * **Task 4.2**: Tích hợp bot Telegram gửi tin nhắn tổng kết doanh thu mỗi 23h đêm. *(Estimate: 0.5d)*

### Phase 5: Kiểm thử, Triển khai Production & Go-Live (Deploy & Launch)
* **Thời gian**: 2.0 ngày
* **Mục tiêu**: Triển khai lên Vercel, trỏ domain riêng và kiểm thử đa thiết bị.
  * **Task 5.1**: Test toàn diện luồng mở app trên iOS Safari, Android Chrome, TikTok In-App WebView. *(Estimate: 1.0d)*
  * **Task 5.2**: Deploy lên Vercel, cấu hình Custom Domain, SSL, DNS. *(Estimate: 0.5d)*
  * **Task 5.3**: Gắn tracking Pixels (TikTok Pixel, Google Analytics 4). *(Estimate: 0.5d)*

---

## 2. Bảng Ước lượng Tiến độ & Phụ thuộc (Dependencies & Timeline)

| Task ID | Tên công việc | Phụ thuộc | Estimate | Độ ưu tiên |
| :--- | :--- | :--- | :---: | :---: |
| **1.1** | Đăng ký Shopee Open API | Không | 0.5 ngày | P0 |
| **1.2** | Khởi tạo repo Next.js 14+ | 1.1 | 0.5 ngày | P0 |
| **1.3** | Shopee Client & Ký SHA256 | 1.2 | 1.0 ngày | P0 |
| **2.1** | Link Expander & Parser | 1.3 | 0.5 ngày | P0 |
| **2.2** | Mutation `generateShortLink` | 2.1 | 0.5 ngày | P0 |
| **2.3** | Voucher Shim & Deep Link | 2.2 | 1.0 ngày | P0 |
| **2.4** | Upstash Redis Caching | 2.3 | 0.5 ngày | P1 |
| **3.1** | UI Home & Input 1-Click | 1.2 | 1.0 ngày | P0 |
| **3.2** | Result Card & App Opener | 3.1, 2.3 | 0.5 ngày | P0 |
| **3.3** | Top Voucher Widget | 3.1 | 0.5 ngày | P2 |
| **4.1** | Conversion Report Sync | 1.3 | 1.0 ngày | P1 |
| **4.2** | Telegram Daily Bot | 4.1 | 0.5 ngày | P2 |
| **5.1** | In-App WebView Testing | 2.3, 3.2 | 1.0 ngày | P0 |
| **5.2** | Vercel Deploy & Domain | 5.1 | 0.5 ngày | P0 |
| **5.3** | Tracking Pixel Setup | 5.2 | 0.5 ngày | P1 |

---

## 3. Hai Rủi ro Kỹ thuật Lớn nhất & Kế hoạch Ứng phó

### ⚠️ Rủi ro 1: Bẫy Trình duyệt Nhúng (In-App WebView Trap)
* **Mô tả**: Trình duyệt nhúng của TikTok / Facebook trên iOS chủ động chặn URI scheme `shopee://`, làm người dùng bị đứng hình hoặc gặp lỗi trắng trang.
* **Biện pháp**: Thiết kế trang đệm trung gian (Bridge Page) có nút bấm vật lý. Sử dụng kỹ thuật Universal Link `https://shopee.vn/...` kèm timer fallback: nếu sau 800ms app không mở, chuyển sang trang web Shopee và hiển thị hướng dẫn mở bằng trình duyệt ngoài.

### ⚠️ Rủi ro 2: Shopee Đổi Chính sách Mã Đối tác & Attribution
* **Mô tả**: Mã `METAPAR...` có thể bị Shopee đóng ngân sách hoặc đổi tên theo từng tháng mà không thông báo.
* **Biện pháp**: Không hardcode tên mã hoặc UTM tags vào code. Sử dụng file cấu hình động (Remote Config / Database) để có thể đổi tên voucher và điều kiện link ngay lập tức khi sàn cập nhật.
