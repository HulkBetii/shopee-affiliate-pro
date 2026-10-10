# Chiến lược Phễu Chuyển đổi & Chính sách Vận hành (Funnel & Strategy)

> **Mục tiêu**: Tối đa hóa tỷ lệ chuyển đổi (CR) từ Video ngắn sang Đơn hàng thực tế, duy trì tập khách hàng trung thành và bảo vệ tài khoản Affiliate trước các thuật toán chống gian lận của Shopee.

---

## 1. Cấu trúc Phễu Chuyển đổi (Conversion Funnel)

```
[Kênh Traffic: TikTok / Reels / Shorts]
                 │ (Nhu cầu: Giảm giá sâu cho món họ tự chọn)
                 ▼
[Landing Page / Web Tool (Đặt tại Bio Link)]
                 │ (Hành động: Dán link Shopee gốc)
                 ▼
[Card Kết quả: Mã 25% + Nút Mở App Shopee]
                 │ (Hành động: Bấm nút mở App Shopee)
                 ▼
[Ứng dụng Shopee: Đặt hàng thành công] ──► Bạn nhận Hoa hồng
                 │
                 ▼
[Giữ chân: Lưu trang web vào Bookmark / Tham gia kênh Telegram thông báo sale]
```

### Tại sao phễu này vượt trội hơn làm Affiliate truyền thống?
1. **Đáp ứng nhu cầu tự nhiên**: Đa phần người xem không có nhu cầu mua món đồ creator quảng cáo. Nhưng **100% người chuẩn bị thanh toán trên Shopee đều muốn mã giảm giá**. Bạn phục vụ đúng thời điểm khách hàng chuẩn bị ra quyết định thanh toán.
2. **Khách hàng quay lại (Retention)**: Khi khách đã tiết kiệm được tiền một lần, họ sẽ lưu website công cụ và quay lại mỗi khi mua sắm bất kỳ mặt hàng nào trên Shopee.

---

## 2. Công thức Kịch bản Video Triệu View trên TikTok (30 - 45s)

* **00:00 - 00:03 (Hook)**:
  * Hình ảnh: Show ngay màn hình thanh toán Shopee có dòng chữ màu cam: *"Tiết kiệm 386.000đ"* hoặc *"-25%"*.
  * Lời thoại: *"Đừng dại mua hàng Shopee giá gốc! Mất đúng 3 giây để giảm ngay 25% tối đa 500k cho mọi đơn hàng."*
* **00:03 - 00:20 (Proof & Tutorial)**:
  * Quay màn hình thao tác thật:
    1. Chọn sản phẩm bất kỳ $\rightarrow$ Bấm Chia sẻ $\rightarrow$ Sao chép link.
    2. Mở trình duyệt vào trang web công cụ $\rightarrow$ Bấm "Dán link".
    3. Nhấn "Lấy mã giảm giá" $\rightarrow$ Web lập tức trả về link kèm mã voucher độc quyền.
* **00:20 - 00:35 (Call to Action - CTA)**:
  * Bấm nút mở Shopee $\rightarrow$ Cho người xem thấy giá tiền lập tức tụt xuống.
  * Kêu gọi: *"Link công cụ mình để ngay ở đầu trang cá nhân (Bio), hoàn toàn miễn phí. Bấm vào dùng thử ngay trước khi mã hết lượt nhé!"*

---

## 3. Chính sách & Biện pháp Chống "Đóng băng Hoa hồng" (Anti-Fraud Guidelines)

Shopee Affiliate có bộ phận kiểm duyệt chất lượng traffic (Traffic Quality Audit). Để đảm bảo 100% doanh thu được đối soát và rút về tài khoản ngân hàng an toàn, cần tuân thủ nghiêm ngặt các nguyên tắc sau:

1. **Tránh bẫy Spam Link (No Blind Spamming)**:
   * Không dùng bot spam link affiliate bừa bãi vào phần bình luận của các bài đăng người khác.
   * Traffic phải đến từ trang web có giao diện người dùng tương tác thật (User Intent-driven).
2. **Minh bạch Nguồn Traffic (Traffic Attribution)**:
   * Khai báo domain web tool của bạn trong mục **"Phương tiện truyền thông của tôi" (My Media)** tại bảng điều khiển Shopee Affiliate. Khi Shopee thấy traffic đổ về từ domain đã đăng ký, tỷ lệ duyệt thanh toán là 100%.
3. **Tracking SubIDs Rõ ràng**:
   * Luôn gắn `subIds: ["tiktok_bio", "campaign_meta"]` để khi có nghi vấn đối soát, bạn có thể chứng minh được đơn hàng sinh ra từ đâu.
4. **Không chạy quảng cáo từ khóa thương hiệu (Brand Bidding)**:
   * Không chạy Google Ads / TikTok Ads nhắm trực tiếp vào các từ khóa thương hiệu *"Shopee"*, *"Shopee Mall"*. Hãy chạy vào từ khóa *"mã giảm giá shopee"*, *"công cụ săn voucher"*.
