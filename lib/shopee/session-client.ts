/**
 * Shopee Affiliate Session Client (Internal Web API Adapter)
 * Sử dụng Session Cookie từ Web Console để tự động sinh short link s.shopee.vn không cần Open API
 */

export interface SessionShortLinkResponse {
  success: boolean;
  shortLink?: string;
  error?: string;
}

export class ShopeeSessionClient {
  private sessionCookie: string;
  private timeoutMs: number;

  constructor(sessionCookie?: string, timeoutMs: number = 8000) {
    this.sessionCookie = sessionCookie || process.env.SHOPEE_SESSION_COOKIE || '';
    this.timeoutMs = timeoutMs;
  }

  public isAvailable(): boolean {
    return !!this.sessionCookie && this.sessionCookie.length > 20;
  }

  /**
   * Gọi API nội bộ của Shopee Console để tạo short link s.shopee.vn
   */
  public async generateShortLink(
    originUrl: string,
    subIds?: string[]
  ): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // Endpoint nội bộ của Shopee Console Custom Link
      const endpoint = 'https://affiliate.shopee.vn/api/v1/custom_link/create';

      const payload = {
        origin_url: originUrl,
        sub_id_1: subIds?.[0] || 'tiktok_bio',
        sub_id_2: subIds?.[1] || 'shopeelink_web',
        sub_id_3: subIds?.[2] || '',
        sub_id_4: subIds?.[3] || '',
        sub_id_5: subIds?.[4] || '',
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.sessionCookie,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://affiliate.shopee.vn/offer/custom_link',
          'Origin': 'https://affiliate.shopee.vn',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        console.warn(`[ShopeeSessionClient] HTTP ${response.status} ${response.statusText} - Có thể session cookie đã hết hạn.`);
        return null;
      }

      const json = await response.json();

      if (json?.code !== 0 && json?.code !== undefined) {
        console.warn(`[ShopeeSessionClient] API nội bộ trả về mã lỗi: ${json.code} - ${json.msg || json.message || 'Lỗi không xác định'}`);
        return null;
      }

      // Cấu trúc response tiêu chuẩn: { code: 0, data: { short_link: "https://s.shopee.vn/..." } }
      if (json?.data?.short_link) {
        return json.data.short_link;
      }
      if (json?.data?.shortLink) {
        return json.data.shortLink;
      }

      console.warn('[ShopeeSessionClient] Phản hồi không chứa trường short_link hợp lệ.');
      return null;
    } catch (err: unknown) {
      console.warn(`[ShopeeSessionClient] Ngoại lệ khi tạo link từ Session Cookie: ${(err as Error)?.message || err}. Fallback sang tầng tiếp theo.`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const defaultSessionClient = new ShopeeSessionClient();
