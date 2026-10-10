import crypto from 'crypto';
import { cacheService } from '../cache';
import { buildAffiliateTrackingUrl } from './tracking-builder';

export interface VoucherShimData {
  slug: string;
  originalUrl: string;
  cleanUrl: string;
  affiliateUrl: string;
  targetWithVoucherUrl: string;
  deepLink: string;
  androidIntent: string;
  metaRefererUrl: string;
  universalLink: string;
  discountPercentage: number;
  maxDiscountAmount: string;
  createdAt: number;
  itemId?: string;
  shopId?: string;
}

/**
 * Sinh mã slug ngẫu nhiên 8 ký tự an toàn URL
 */
export function generateRandomSlug(length: number = 8): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

/**
 * Sinh mã slug tự phục hồi (Stateless Deterministic Slug) từ shopId và itemId
 */
export function generateStatelessProductSlug(shopId?: string, itemId?: string): string {
  if (shopId && itemId && /^\d+$/.test(shopId) && /^\d+$/.test(itemId)) {
    try {
      const s36 = BigInt(shopId).toString(36);
      const i36 = BigInt(itemId).toString(36);
      return `p${s36}_${i36}`;
    } catch {
      return generateRandomSlug(8);
    }
  }
  return generateRandomSlug(8);
}

/**
 * Giải mã stateless slug ra shopId và itemId nếu cache miss trên serverless
 */
export function decodeStatelessProductSlug(slug: string): { shopId: string; itemId: string } | null {
  if (slug.startsWith('p') && slug.includes('_')) {
    const parts = slug.slice(1).split('_');
    if (parts.length === 2 && parts[0] && parts[1]) {
      try {
        // Parse BigInt từ base36
        const parseBase36 = (str: string): string => {
          let result = BigInt(0);
          for (let i = 0; i < str.length; i++) {
            const char = str[i].toLowerCase();
            const val = BigInt('0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(char));
            if (val < BigInt(0)) throw new Error('Invalid char');
            result = result * BigInt(36) + val;
          }
          return result.toString();
        };

        const shopId = parseBase36(parts[0]);
        const itemId = parseBase36(parts[1]);
        if (shopId && itemId) {
          return { shopId, itemId };
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Gắn các tham số kích hoạt Voucher Meta Partner vào link
 * LƯU Ý BẢO MẬT ATTRIBUTION: Tuyệt đối không ghi đè utm_source của affiliateId thành 'facebook'
 */
export function injectMetaVoucherParams(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    url.searchParams.set('utm_campaign', 'meta_collab');
    url.searchParams.set('af_force_deeplink', 'true');
    return url.toString();
  } catch {
    const separator = urlStr.includes('?') ? '&' : '?';
    return `${urlStr}${separator}utm_campaign=meta_collab&af_force_deeplink=true`;
  }
}

/**
 * Xây dựng Universal Deep Link & Android Intent đánh thức Shopee App trực tiếp
 * @param targetUrl Link sản phẩm đã gắn mã voucher và affiliate
 * @param options Tùy chọn itemId và shopId để tạo deep link sản phẩm chính xác
 */
export function buildShopeeDeepLinks(
  targetUrl: string,
  options?: { itemId?: string; shopId?: string }
): {
  deepLink: string;
  androidIntent: string;
  metaRefererUrl: string;
  universalLink: string;
} {
  const encoded = encodeURIComponent(targetUrl);
  const { itemId, shopId } = options || {};

  // Custom scheme: Ưu tiên link đích danh sản phẩm nếu có itemId & shopId
  let deepLink: string;
  if (itemId && shopId) {
    deepLink = `shopee://product/${shopId}/${itemId}`;
  } else {
    deepLink = `shopee://web?url=${encoded}`;
  }

  // Android Intent URI: TRUYỀN TOÀN BỘ URL AFFILIATE ĐẦY ĐỦ VÀO INTENT
  // Để khi Shopee App mở ra trên Android, App nhận trọn vẹn tham số tracking (af_sub_siteid, utm_source...)
  const rawHostAndPath = targetUrl.replace(/^https?:\/\//, '');
  const androidIntent = `intent://${rawHostAndPath}#Intent;scheme=https;package=com.shopee.vn;S.browser_fallback_url=${encoded};end`;

  // Facebook Link Shim mô phỏng truy cập từ Meta (Facebook/Instagram)
  const metaRefererUrl = `https://l.facebook.com/l.php?u=${encoded}`;

  return {
    deepLink,
    androidIntent,
    metaRefererUrl,
    universalLink: targetUrl,
  };
}

/**
 * Đóng gói và lưu trữ metadata chuyển tiếp vào cache (TTL 30 ngày)
 * Hỗ trợ Stateless Deterministic Slug để chống 404 trên serverless
 */
export async function createVoucherShim(params: {
  originalUrl: string;
  cleanUrl: string;
  affiliateUrl: string;
  itemId?: string;
  shopId?: string;
}): Promise<VoucherShimData> {
  const slug = generateStatelessProductSlug(params.shopId, params.itemId);
  const targetWithVoucherUrl = injectMetaVoucherParams(params.affiliateUrl);
  const { deepLink, androidIntent, metaRefererUrl } = buildShopeeDeepLinks(targetWithVoucherUrl, {
    itemId: params.itemId,
    shopId: params.shopId,
  });

  const shimData: VoucherShimData = {
    slug,
    originalUrl: params.originalUrl,
    cleanUrl: params.cleanUrl,
    affiliateUrl: params.affiliateUrl,
    targetWithVoucherUrl,
    deepLink,
    androidIntent,
    metaRefererUrl,
    universalLink: targetWithVoucherUrl,
    discountPercentage: 25,
    maxDiscountAmount: '500.000đ',
    createdAt: Date.now(),
    itemId: params.itemId,
    shopId: params.shopId,
  };

  // Lưu vào cache với key shopee:shim:{slug} (TTL 30 ngày = 2592000s)
  await cacheService.set(`shopee:shim:${slug}`, shimData, 2592000);

  return shimData;
}

/**
 * Tra cứu thông tin chuyển tiếp từ slug
 * Cơ chế 2 tầng: Cache Hit -> Stateless Self-Healing Recovery khi Cache Miss
 */
export async function getVoucherShimBySlug(slug: string): Promise<VoucherShimData | null> {
  // Tầng 1: Tra cứu trong Cache (Redis / Memory)
  const cached = await cacheService.get<VoucherShimData>(`shopee:shim:${slug}`);
  if (cached) {
    return cached;
  }

  // Tầng 2: Stateless Self-Healing Recovery (Cứu cánh khi Serverless instance mới hoặc chưa cài Redis)
  const decoded = decodeStatelessProductSlug(slug);
  if (decoded) {
    const { shopId, itemId } = decoded;
    const cleanUrl = `https://shopee.vn/product/${shopId}/${itemId}`;
    const affiliateId = process.env.SHOPEE_AFFILIATE_ID || 'an_17315740682';
    const affiliateUrl = buildAffiliateTrackingUrl({
      cleanUrl,
      affiliateId,
      subIds: ['tiktok_bio', 'shopeelink_web'],
      includeMetaVoucher: true,
    });
    const targetWithVoucherUrl = injectMetaVoucherParams(affiliateUrl);
    const { deepLink, androidIntent, metaRefererUrl } = buildShopeeDeepLinks(targetWithVoucherUrl, {
      itemId,
      shopId,
    });

    const recoveredShim: VoucherShimData = {
      slug,
      originalUrl: cleanUrl,
      cleanUrl,
      affiliateUrl,
      targetWithVoucherUrl,
      deepLink,
      androidIntent,
      metaRefererUrl,
      universalLink: targetWithVoucherUrl,
      discountPercentage: 25,
      maxDiscountAmount: '500.000đ',
      createdAt: Date.now(),
      itemId,
      shopId,
    };

    // Lưu ngược lại cache để các request tiếp theo hit ngay
    await cacheService.set(`shopee:shim:${slug}`, recoveredShim, 2592000);
    return recoveredShim;
  }

  return null;
}
