# Tổng hợp Hệ sinh thái Mã nguồn mở & Công cụ Tham khảo (Repos & Ecosystem)

> **Mục lục các tài nguyên GitHub, MCP servers và thư viện liên quan trực tiếp đến bài toán Shopee Affiliate.**

---

## 1. Repositories GitHub Cốt lõi

| Repository | Ngôn ngữ / Nền tảng | Số sao | Mô tả & Đánh giá ứng dụng |
| :--- | :--- | :---: | :--- |
| **[bcat95/shopee-aff](https://github.com/bcat95/shopee-aff)** | Node.js, PHP | 87 ⭐ | **Bắt buộc tham khảo**: Toàn bộ code mẫu chính thức kết nối Shopee GraphQL API, tài liệu `addlivetag.com` và mã nguồn web rút gọn link `bc-custom-link`. |
| **[RFS-ADRENO/zca-js](https://github.com/RFS-ADRENO/zca-js)** | JavaScript (Node.js) | 664 ⭐ | Thư viện tự động hóa tài khoản Zalo cá nhân. *(Lưu ý: Dễ bị Zalo quét khóa SĐT nếu dùng cho nhóm công khai).* |
| **[KaiyoDev/zalo-bot-js](https://github.com/KaiyoDev/zalo-bot-js)** | TypeScript | 55 ⭐ | SDK Zalo Bot hỗ trợ polling, webhook và message handler chuẩn chỉnh. |
| **[roywikan/shopee-affiliate-api-bot](https://github.com/roywikan/shopee-affiliate-api-bot)** | Python | 10 ⭐ | Ví dụ tính toán chữ ký số SHA256 và gọi API Shopee GraphQL trên Python. |
| **[SaulloGabryel/BlueBot](https://github.com/SaulloGabryel/BlueBot)** | Python | 22 ⭐ | Bot Telegram tự động bắt link thương mại điện tử (Shopee, Mercado Livre) và chuyển đổi sang link affiliate. |
| **[platoba/MultiAffiliateTGBot](https://github.com/platoba/MultiAffiliateTGBot)** | Node.js / Python | 3 ⭐ | Bot đa sàn (Shopee, Lazada, AliExpress, TikTok Shop). |

---

## 2. Giao thức MCP (Model Context Protocol) cho Dự án

Bạn có thể tích hợp các server MCP sau vào môi trường coding agent:

1. **Custom Shopee MCP Server**:
   * Xây dựng bằng `@modelcontextprotocol/sdk` để AI trong IDE có thể tự gọi các hàm:
     * `generate_affiliate_link(url: string)`: Trả về link tiếp thị.
     * `check_commission(itemId: string)`: Kiểm tra % hoa hồng của sản phẩm.
2. **Puppeteer / Playwright MCP Server**:
   * Dùng để tự động hóa mở trình duyệt kiểm tra hiển thị của voucher trên trang Shopee thật mà không cần can thiệp tay.
3. **Fetch & Filesystem MCP**:
   * Đọc ghi file log chuyển đổi và tương tác trực tiếp với các REST API.

---

## 3. Các Dịch vụ Bên thứ ba Phổ biến tại Thị trường Việt Nam

* **[addlivetag.com](https://addlivetag.com/)**: Nền tảng chuyên cung cấp API gắn tag Live/Video cho sản phẩm Shopee của cộng đồng seller/affiliate Việt Nam.
* **[Upstash Redis](https://upstash.com/)**: Dịch vụ Serverless Redis miễn phí, độ trễ cực thấp, tương thích hoàn hảo với Next.js và Vercel.
* **[Vercel](https://vercel.com/)**: Nền tảng hosting serverless tối ưu nhất cho Next.js, hỗ trợ tự động cấp SSL và gắn custom domain.
