# Đặc tả Kỹ thuật: Shopee Affiliate Open API & Data API

> **Tài liệu tham chiếu chuẩn cho kỹ sư phát triển**  
> **Endpoint chính thức**: `https://open-api.affiliate.shopee.vn/graphql`

---

## 1. Cơ chế Xác thực & Ký số (Authentication & Signing)

Mỗi request gửi lên Shopee GraphQL API bắt buộc phải kèm theo Header:
```http
Authorization: SHA256 Credential={appId}, Timestamp={timestamp}, Signature={signature}
Content-Type: application/json
```

### Công thức tính Signature:
```
signatureBase = appId + timestamp + payload + secretKey
signature = SHA256_HEX(signatureBase)
```
* **`appId`**: Chuỗi số ID ứng dụng (Lấy tại Shopee Affiliate Console).
* **`timestamp`**: Unix timestamp tính bằng giây (số nguyên, ví dụ: `1728528000`).
* **`payload`**: Toàn bộ chuỗi JSON của request body (phải khớp chính xác byte-for-byte với body gửi đi).
* **`secretKey`**: Chuỗi bí mật của ứng dụng.

---

## 2. Các Mutations & Queries Cốt lõi

### A. Mutation Tạo Link Rút gọn (`generateShortLink`)
Dùng để biến link sản phẩm bất kỳ thành link affiliate có tracking SubID:

```graphql
mutation {
  generateShortLink(input: {
    originUrl: "https://shopee.vn/product/12345/67890",
    subIds: ["tiktok_bio", "user_organic"]
  }) {
    shortLink
  }
}
```

* **Tham số**:
  * `originUrl` *(bắt buộc)*: Link gốc sản phẩm Shopee (không chứa tham số rác).
  * `subIds` *(tùy chọn)*: Mảng tối đa 5 giá trị chuỗi (dùng để phân tích nguồn traffic, ví dụ: video nào tạo ra đơn).
* **Kết quả trả về**:
  * `shortLink`: Link dạng `https://s.shopee.vn/...` đã gắn cookie tiếp thị của bạn.

---

### B. Query Tìm kiếm Sản phẩm & Mức Hoa hồng (`productOfferV2`)
Dùng để kiểm tra hoa hồng của sản phẩm trước khi gợi ý người dùng:

```graphql
query {
  productOfferV2(
    keyword: "giày tennis",
    sortType: 1,
    page: 1,
    limit: 10
  ) {
    nodes {
      itemId
      shopId
      productName
      price
      priceMin
      priceMax
      imageUrl
      offerLink
      commissionRate
      sales
    }
    pageInfo {
      page
      limit
      hasNextPage
    }
  }
}
```

---

### C. Query Báo cáo Chuyển đổi (`conversionReport`)
Dùng cho Cron job tự động kéo báo cáo hoa hồng mỗi ngày:

```graphql
query {
  conversionReport(
    purchaseTimeStart: 1728432000,
    purchaseTimeEnd: 1728518400,
    limit: 100,
    orderStatus: "ALL"
  ) {
    nodes {
      checkoutId
      purchaseTime
      orderStatus
      estimatedTotalCommission
      grossCommission
      cappedCommission
      totalBrandCommission
      orders {
        itemId
        itemName
        itemPrice
        itemCount
      }
    }
    pageInfo {
      scrollId
      hasNextPage
    }
  }
}
```

---

## 3. Data API Gắn Tag Live/Video (`data.addlivetag.com`)

Ngoài Open API chính thống, cộng đồng Affiliate Việt Nam thường sử dụng Data API từ `data.addlivetag.com` để giải quyết bài toán gắn tag video/live:

* **Endpoint lấy thông tin sản phẩm**:
  ```bash
  curl -H "X-API-Key: YOUR_API_KEY" \
    "https://data.addlivetag.com/product-data/product-data.php?item_id=1589295236"
  ```
* **Đặc điểm**:
  * Yêu cầu API Key (tạo tại `addlivetag.com`).
  * Có cache nội bộ 3 giờ.
  * Hỗ trợ kiểm tra sản phẩm có đang được gắn trong giỏ hàng Live hay Video nào của hệ thống hay không.
