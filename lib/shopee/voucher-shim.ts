import crypto from 'crypto';
import { cacheService } from '../cache';
import { isShopeeShortUrl } from './parser';
import { defaultShopeeClient } from './client';
import { alertAffiliateLinkFailure } from '../alerts';
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

const SHIM_TTL_SECONDS = 2592000; // 30 ngày
const SHORT_LINK_CODE_PATTERN = /^[A-Za-z0-9]{4,20}$/;

/**
 * Lấy mã short link từ link affiliate chính thức dạng https://s.shopee.vn/<code>
 */
export function extractShortLinkCode(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 's.shopee.vn') return null;
    const code = url.pathname.replace(/^\/+|\/+$/g, '');
    return SHORT_LINK_CODE_PATTERN.test(code) ? code : null;
  } catch {
    return null;
  }
}

/**
 * Slug mang mã short link (s<code>) để /go tự phục hồi không cần cache;
 * Khi dùng fallback (không phải short link) thì sinh slug p<shop36>_<item36> để tự phục hồi stateless;
 * ngược lại sinh slug ngẫu nhiên
 */
export function buildShimSlug(
  affiliateUrl: string,
  options?: { shopId?: string; itemId?: string }
): string {
  const code = extractShortLinkCode(affiliateUrl);
  if (code) return `s${code}`;
  if (options?.shopId && options?.itemId) {
    return generateStatelessProductSlug(options.shopId, options.itemId);
  }
  return generateRandomSlug(8);
}

/**
 * Gắn các tham số kích hoạt Voucher Meta Partner vào link
 * LƯU Ý: Giữ lại để tương thích ngược, không ghi đè utm_source của affiliateId
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
 * Xây dựng link mở Shopee App mà vẫn giữ nguyên tracking affiliate.
 * Sử dụng Universal Link (iOS) và Android Intent URI (Android) truyền toàn bộ URL để bảo toàn hoa hồng.
 * KHÔNG sử dụng custom scheme shopee://product/{shopId}/{itemId} vì sẽ làm rơi rụng tham số tracking.
 * @param targetUrl Link affiliate chính thức hoặc direct tracking URL đầy đủ
 */
export function buildShopeeDeepLinks(
  targetUrl: string,
  _options?: { itemId?: string; shopId?: string }
): {
  deepLink: string;
  androidIntent: string;
  metaRefererUrl: string;
  universalLink: string;
} {
  const encoded = encodeURIComponent(targetUrl);

  // Android Intent URI: truyền nguyên link để App nhận đủ tracking của Shopee
  const rawHostAndPath = targetUrl.replace(/^https?:\/\//, '');
  const androidIntent = `intent://${rawHostAndPath}#Intent;scheme=https;package=com.shopee.vn;S.browser_fallback_url=${encoded};end`;

  return {
    deepLink: targetUrl,
    androidIntent,
    metaRefererUrl: '',
    universalLink: targetUrl,
  };
}

/**
 * Đóng gói dữ liệu chuyển tiếp từ short link hoặc direct tracking URL
 */
function buildShimData(params: {
  slug: string;
  originalUrl: string;
  cleanUrl: string;
  affiliateUrl: string;
  itemId?: string;
  shopId?: string;
}): VoucherShimData {
  const { deepLink, androidIntent, metaRefererUrl, universalLink } = buildShopeeDeepLinks(params.affiliateUrl);

  return {
    slug: params.slug,
    originalUrl: params.originalUrl,
    cleanUrl: params.cleanUrl,
    affiliateUrl: params.affiliateUrl,
    targetWithVoucherUrl: params.affiliateUrl,
    deepLink,
    androidIntent,
    metaRefererUrl,
    universalLink,
    discountPercentage: 25,
    maxDiscountAmount: '500.000đ',
    createdAt: Date.now(),
    itemId: params.itemId,
    shopId: params.shopId,
  };
}

/**
 * Đóng gói và lưu trữ metadata chuyển tiếp vào cache (TTL 30 ngày)
 * Hỗ trợ cả mã short link (s<code>) và Stateless Base36 (p<shop36>_<item36>) chống 404
 */
export async function createVoucherShim(params: {
  originalUrl: string;
  cleanUrl: string;
  affiliateUrl: string;
  itemId?: string;
  shopId?: string;
}): Promise<VoucherShimData> {
  const slug = buildShimSlug(params.affiliateUrl, {
    shopId: params.shopId,
    itemId: params.itemId,
  });
  const shimData = buildShimData({ ...params, slug });

  await cacheService.set(`shopee:shim:${shimData.slug}`, shimData, SHIM_TTL_SECONDS);

  return shimData;
}

/**
 * Tra cứu thông tin chuyển tiếp từ slug
 * Cơ chế 3 tầng: Cache Hit -> Stateless ShortLink Recovery -> Stateless Base36 Recovery
 */
export async function getVoucherShimBySlug(slug: string): Promise<VoucherShimData | null> {
  const cacheKey = `shopee:shim:${slug}`;

  // Tầng 1: Cache (Redis / Memory). Bỏ qua shim cũ trỏ tới link tự ghép trừ khi bật ALLOW_DIRECT_TRACKING_FALLBACK
  const cached = await cacheService.get<VoucherShimData>(cacheKey);
  if (cached && (isShopeeShortUrl(cached.affiliateUrl) || process.env.ALLOW_DIRECT_TRACKING_FALLBACK === 'true')) {
    return cached;
  }

  // Tầng 2: Slug mang mã short link -> dựng lại trực tiếp (host cố định s.shopee.vn)
  if (slug.startsWith('s')) {
    const code = slug.slice(1);
    if (!SHORT_LINK_CODE_PATTERN.test(code)) return null;

    const affiliateUrl = `https://s.shopee.vn/${code}`;
    const recovered = buildShimData({ slug, originalUrl: affiliateUrl, cleanUrl: affiliateUrl, affiliateUrl });
    await cacheService.set(cacheKey, recovered, SHIM_TTL_SECONDS);
    return recovered;
  }

  // Tầng 3: Slug sản phẩm Base36 (p<shop36>_<item36>) -> tự phục hồi stateless
  const decoded = decodeStatelessProductSlug(slug);
  if (decoded) {
    const { shopId, itemId } = decoded;
    const cleanUrl = `https://shopee.vn/product/${shopId}/${itemId}`;

    try {
      const affiliateUrl = await defaultShopeeClient.generateShortLink(cleanUrl, ['tiktok_bio', 'shopeelink_web']);
      const recovered = buildShimData({ slug, originalUrl: cleanUrl, cleanUrl, affiliateUrl, itemId, shopId });
      await cacheService.set(cacheKey, recovered, SHIM_TTL_SECONDS);
      return recovered;
    } catch (err: unknown) {
      const affiliateId = process.env.SHOPEE_AFFILIATE_ID || 'an_17315740682';
      const affiliateUrl = buildAffiliateTrackingUrl({ cleanUrl, affiliateId, includeMetaVoucher: true });
      const recovered = buildShimData({ slug, originalUrl: cleanUrl, cleanUrl, affiliateUrl, itemId, shopId });
      await cacheService.set(cacheKey, recovered, SHIM_TTL_SECONDS);
      return recovered;
    }
  }

  return null;
}
