/**
 * Module Tạo Link Tiếp Thị Trực Tiếp (Direct Tracking URL Builder)
 * Dành cho kiến trúc Non-OpenAPI (hoạt động độc lập không cần AppId & SecretKey)
 */

export interface TrackingUrlOptions {
  cleanUrl: string;
  affiliateId?: string;
  subIds?: string[];
  includeMetaVoucher?: boolean;
}

/**
 * Xây dựng URL Shopee có gắn mã tracking affiliate và tham số kích hoạt voucher
 * @deprecated Shopee does not attribute commission to self-built tracking URLs: clicks are only
 * recorded when they go through the official s.shopee.vn short-link server. Not used in production.
 */
export function buildAffiliateTrackingUrl(options: TrackingUrlOptions): string {
  const {
    cleanUrl,
    affiliateId = process.env.SHOPEE_AFFILIATE_ID || '',
    subIds = ['tiktok_bio', 'shopeelink_web'],
    includeMetaVoucher = true,
  } = options;

  try {
    const url = new URL(cleanUrl);

    // 1. Gắn mã định danh Publisher / Affiliate ID chính thức từ Shopee MMP
    if (affiliateId) {
      url.searchParams.set('mmp_pid', affiliateId);
      url.searchParams.set('utm_source', affiliateId);
      url.searchParams.set('utm_medium', 'affiliates');
      url.searchParams.set('af_sub_siteid', affiliateId);
      url.searchParams.set('aff_click_id', affiliateId);
    }

    // 2. Gắn SubIDs phân loại nguồn traffic
    if (subIds && subIds.length > 0) {
      subIds.slice(0, 5).forEach((subId, index) => {
        url.searchParams.set(`sub_id_${index + 1}`, subId);
      });
    }

    // 3. Kích hoạt tầng ưu đãi Voucher Meta Collab (20% - 25% tối đa 500k)
    // LƯU Ý: Tuyệt đối KHÔNG ghi đè utm_source thành 'facebook' để đảm bảo Shopee ghi nhận hoa hồng cho affiliateId
    if (includeMetaVoucher) {
      url.searchParams.set('utm_campaign', 'meta_collab');
      url.searchParams.set('af_force_deeplink', 'true');
    }

    return url.toString();
  } catch {
    // Fallback nếu cleanUrl không phải URL hợp lệ
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const affId = affiliateId || 'affiliate_pro';
    let fallback = `${cleanUrl}${separator}af_sub_siteid=${affId}&utm_source=${affId}&mmp_pid=${affId}&utm_medium=affiliates`;
    if (includeMetaVoucher) {
      fallback += '&utm_campaign=meta_collab&af_force_deeplink=true';
    }
    return fallback;
  }
}
