/**
 * Module Bóc tách & Chuẩn hóa URL Shopee (Link Expander & Parser)
 * Tham chiếu: docs/ARCHITECTURE.md - Module 1
 */

export interface ParsedShopeeInfo {
  isValid: boolean;
  rawUrl: string | null;
  resolvedUrl: string;
  cleanUrl: string;
  itemId?: string;
  shopId?: string;
  isShortLink: boolean;
  error?: string;
}

const SHOPEE_DOMAINS = [
  'shopee.vn',
  's.shopee.vn',
  'vn.shp.ee',
  'shope.ee',
];

const SHORT_LINK_DOMAINS = [
  's.shopee.vn',
  'vn.shp.ee',
  'shope.ee',
];

/**
 * Trích xuất URL đầu tiên tìm thấy từ một chuỗi văn bản tự do
 */
export function extractUrlFromText(text: string): string | null {
  if (!text || typeof text !== 'string') return null;

  // Regex tìm URL http/https
  const urlRegex = /(https?:\/\/[^\s"'<>\(\)]+)/i;
  const match = text.match(urlRegex);
  if (!match) return null;

  // Cắt bỏ dấu chấm, phẩy, ngoặc ở cuối nếu dính vào text
  let extracted = match[1];
  extracted = extracted.replace(/[.,;!?]+$/, '');
  return extracted;
}

/**
 * Kiểm tra một URL có thuộc hệ sinh thái Shopee hay không
 */
export function isShopeeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    return SHOPEE_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Kiểm tra xem URL có phải là link rút gọn của Shopee không
 */
export function isShopeeShortUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    return SHORT_LINK_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Phân giải link rút gọn (s.shopee.vn, vn.shp.ee, shope.ee) thành link đích thực sự
 */
export async function resolveShortUrl(
  shortUrl: string,
  timeoutMs: number = 5000
): Promise<string> {
  if (!isShopeeShortUrl(shortUrl)) {
    return shortUrl;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Thử HEAD request với manual redirect trước (nhanh và nhẹ nhất)
    const headRes = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const location = headRes.headers.get('location');
    if (location) {
      // Location có thể là relative hoặc absolute
      const resolved = new URL(location, shortUrl).toString();
      // Nếu location vẫn là short link khác, có thể resolve tiếp (hỗ trợ 1 cấp redirect)
      if (isShopeeShortUrl(resolved) && resolved !== shortUrl) {
        return resolveShortUrl(resolved, timeoutMs);
      }
      return resolved;
    }

    // Nếu HEAD không trả header location, fallback sang GET follow redirect
    const getRes = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (getRes.url && getRes.url !== shortUrl) {
      return getRes.url;
    }

    return shortUrl;
  } catch (err: unknown) {
    // Nếu gặp lỗi mạng (ví dụ mock test hoặc link không tồn tại), trả về link ban đầu
    return shortUrl;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Bóc tách itemId và shopId từ URL Shopee
 * Các định dạng hỗ trợ:
 * 1. https://shopee.vn/product/{shopId}/{itemId}
 * 2. https://shopee.vn/{product-slug}-i.{shopId}.{itemId}
 * 3. https://shopee.vn/...?itemid={itemId}&shopid={shopId}
 */
export function extractShopeeIds(urlStr: string): { itemId?: string; shopId?: string } {
  try {
    const url = new URL(urlStr);

    // Cách 1: Format slug -i.{shopId}.{itemId}
    const slugMatch = url.pathname.match(/-i\.(\d+)\.(\d+)/);
    if (slugMatch) {
      return { shopId: slugMatch[1], itemId: slugMatch[2] };
    }

    // Cách 2: Format /product/{shopId}/{itemId}
    const productMatch = url.pathname.match(/\/product\/(\d+)\/(\d+)/);
    if (productMatch) {
      return { shopId: productMatch[1], itemId: productMatch[2] };
    }

    // Cách 3: Query parameters (itemid & shopid)
    const itemIdParam = url.searchParams.get('itemid') || url.searchParams.get('itemId');
    const shopIdParam = url.searchParams.get('shopid') || url.searchParams.get('shopId');
    if (itemIdParam && shopIdParam) {
      return { shopId: shopIdParam, itemId: itemIdParam };
    }

    return {};
  } catch {
    return {};
  }
}

/**
 * Làm sạch URL Shopee: Loại bỏ toàn bộ tham số tracking rác
 */
export function sanitizeShopeeUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const { itemId, shopId } = extractShopeeIds(urlStr);

    // Nếu bóc tách được itemId và shopId, tạo link chuẩn tắc Canonical
    if (itemId && shopId) {
      return `https://shopee.vn/product/${shopId}/${itemId}`;
    }

    // Nếu không có itemId/shopId, giữ lại pathname và loại bỏ các params tracking
    const cleanParams = new URLSearchParams();
    const trackingBlacklist = [
      'sp_atk',
      'xptdk',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'af_sub_siteid',
      'smtt',
    ];

    parsed.searchParams.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!trackingBlacklist.some(bl => lowerKey.startsWith(bl))) {
        cleanParams.append(key, val);
      }
    });

    const queryString = cleanParams.toString();
    return `https://${parsed.hostname}${parsed.pathname}${queryString ? `?${queryString}` : ''}`;
  } catch {
    return urlStr;
  }
}

/**
 * Pipeline hoàn chỉnh: Nhận raw text -> Bóc tách URL -> Giải nén ShortLink -> Lấy ID & Link sạch
 */
export async function parseShopeeInput(rawInput: string): Promise<ParsedShopeeInfo> {
  const extracted = extractUrlFromText(rawInput);
  if (!extracted) {
    return {
      isValid: false,
      rawUrl: null,
      resolvedUrl: '',
      cleanUrl: '',
      isShortLink: false,
      error: 'Không tìm thấy đường dẫn hợp lệ trong văn bản đã dán.',
    };
  }

  if (!isShopeeUrl(extracted)) {
    return {
      isValid: false,
      rawUrl: extracted,
      resolvedUrl: extracted,
      cleanUrl: extracted,
      isShortLink: false,
      error: 'Đường link không thuộc hệ thống Shopee Việt Nam (shopee.vn, s.shopee.vn, vn.shp.ee).',
    };
  }

  const isShort = isShopeeShortUrl(extracted);
  const resolved = isShort ? await resolveShortUrl(extracted) : extracted;
  const { itemId, shopId } = extractShopeeIds(resolved);
  const clean = sanitizeShopeeUrl(resolved);

  return {
    isValid: true,
    rawUrl: extracted,
    resolvedUrl: resolved,
    cleanUrl: clean,
    itemId,
    shopId,
    isShortLink: isShort,
  };
}
