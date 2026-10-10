import crypto from 'crypto';
import { cacheService } from '../cache';

export interface VoucherShimData {
  slug: string;
  originalUrl: string;
  cleanUrl: string;
  affiliateUrl: string;
  targetWithVoucherUrl: string;
  deepLink: string;
  androidIntent: string;
  metaRefererUrl: string;
  discountPercentage: number;
  maxDiscountAmount: string;
  createdAt: number;
}

/**
 * Sinh mã slug ngẫu nhiên 8 ký tự an toàn URL
 */
export function generateRandomSlug(length: number = 8): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

/**
 * Gắn các tham số UTM kích hoạt Voucher Meta Partner vào link
 */
export function injectMetaVoucherParams(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    url.searchParams.set('utm_source', 'facebook');
    url.searchParams.set('utm_medium', 'cpc');
    url.searchParams.set('utm_campaign', 'meta_collab');
    url.searchParams.set('af_force_deeplink', 'true');
    return url.toString();
  } catch {
    const separator = urlStr.includes('?') ? '&' : '?';
    return `${urlStr}${separator}utm_source=facebook&utm_medium=cpc&utm_campaign=meta_collab&af_force_deeplink=true`;
  }
}

/**
 * Xây dựng Universal Deep Link đánh thức Shopee App trực tiếp
 * @param targetUrl Link sản phẩm đã gắn mã voucher và affiliate
 */
export function buildShopeeDeepLinks(targetUrl: string): {
  deepLink: string;
  androidIntent: string;
  metaRefererUrl: string;
} {
  const encoded = encodeURIComponent(targetUrl);

  // Custom scheme shopee://open?url=...
  const deepLink = `shopee://open?url=${encoded}`;

  // Android Intent URI (tự động mở Shopee nếu cài, hoặc mở CH Play / Web)
  const androidIntent = `intent://open?url=${encoded}#Intent;scheme=shopee;package=com.shopee.vn;S.browser_fallback_url=${encoded};end`;

  // Facebook Link Shim mô phỏng truy cập từ Meta (Facebook/Instagram)
  const metaRefererUrl = `https://l.facebook.com/l.php?u=${encoded}`;

  return {
    deepLink,
    androidIntent,
    metaRefererUrl,
  };
}

/**
 * Đóng gói và lưu trữ metadata chuyển tiếp vào cache (TTL 24h)
 */
export async function createVoucherShim(params: {
  originalUrl: string;
  cleanUrl: string;
  affiliateUrl: string;
}): Promise<VoucherShimData> {
  const slug = generateRandomSlug(8);
  const targetWithVoucherUrl = injectMetaVoucherParams(params.affiliateUrl);
  const { deepLink, androidIntent, metaRefererUrl } = buildShopeeDeepLinks(targetWithVoucherUrl);

  const shimData: VoucherShimData = {
    slug,
    originalUrl: params.originalUrl,
    cleanUrl: params.cleanUrl,
    affiliateUrl: params.affiliateUrl,
    targetWithVoucherUrl,
    deepLink,
    androidIntent,
    metaRefererUrl,
    discountPercentage: 25,
    maxDiscountAmount: '500.000đ',
    createdAt: Date.now(),
  };

  // Lưu vào cache với key shopee:shim:{slug} (TTL 24 giờ)
  await cacheService.set(`shopee:shim:${slug}`, shimData, 86400);

  return shimData;
}

/**
 * Tra cứu thông tin chuyển tiếp từ slug
 */
export async function getVoucherShimBySlug(slug: string): Promise<VoucherShimData | null> {
  return cacheService.get<VoucherShimData>(`shopee:shim:${slug}`);
}
