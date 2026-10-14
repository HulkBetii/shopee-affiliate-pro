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
  private lastError: string | null = null;

  constructor(sessionCookie?: string, timeoutMs: number = 8000) {
    this.sessionCookie =
      sessionCookie ||
      process.env.SHOPEE_SESSION_COOKIE ||
      process.env.SHOPEE_COOKIE ||
      '';
    this.timeoutMs = timeoutMs;
  }

  /**
   * Reason of the most recent failed generateShortLink call (null after a success)
   */
  public getLastError(): string | null {
    return this.lastError;
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
      this.lastError = 'SHOPEE_SESSION_COOKIE is missing or too short';
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // Endpoint GraphQL nội bộ của Shopee Console Custom Link (v3)
      const endpoint = 'https://affiliate.shopee.vn/api/v3/gql?q=batchCustomLink';
      const query = `
        query batchGetCustomLink($linkParams: [CustomLinkParam!], $sourceCaller: SourceCaller){
          batchCustomLink(linkParams: $linkParams, sourceCaller: $sourceCaller){
            shortLink
            longLink
            failCode
          }
        }
      `.trim();

      const payload = {
        operationName: 'batchGetCustomLink',
        query,
        variables: {
          linkParams: [
            {
              originalLink: originUrl,
              advancedLinkParams: {
                subId1: subIds?.[0] || 'tiktok_bio',
                subId2: subIds?.[1] || 'shopeelink_web',
                subId3: subIds?.[2] || '',
                subId4: subIds?.[3] || '',
                subId5: subIds?.[4] || '',
              },
            },
          ],
          sourceCaller: 'CUSTOM_LINK_CALLER',
        },
      };

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cookie': this.sessionCookie,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://affiliate.shopee.vn/offer/custom_link',
        'Origin': 'https://affiliate.shopee.vn',
        'X-Api-Source': 'pc',
      };

      const csrfMatch = this.sessionCookie.match(/csrftoken=([^;]+)/i);
      if (csrfMatch && csrfMatch[1]) {
        requestHeaders['x-csrftoken'] = csrfMatch[1].trim();
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        console.warn(`[ShopeeSessionClient] HTTP ${response.status} ${response.statusText} - Có thể session cookie cần refresh hoặc bị Shopee WAF chặn.`);
        this.lastError = `HTTP ${response.status} ${response.statusText} (cookie expired or blocked by WAF?)`;
        return null;
      }

      const json = await response.json();

      const shortLink =
        json?.data?.batchCustomLink?.[0]?.shortLink ||
        json?.data?.short_link ||
        json?.data?.shortLink;

      if (shortLink) {
        this.lastError = null;
        return shortLink;
      }

      if (json?.error) {
        console.warn(`[ShopeeSessionClient] API nội bộ trả về mã lỗi: ${json.error}`);
      }

      const failCode = json?.data?.batchCustomLink?.[0]?.failCode;
      this.lastError = failCode
        ? `batchCustomLink failCode=${failCode}`
        : json?.error
          ? `API error=${json.error}`
          : 'Response contained no shortLink';
      return null;
    } catch (err: unknown) {
      console.warn(`[ShopeeSessionClient] Ngoại lệ khi tạo link từ Session Cookie: ${(err as Error)?.message || err}. Fallback sang tầng tiếp theo.`);
      this.lastError = `Exception: ${(err as Error)?.message || String(err)}`;
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const defaultSessionClient = new ShopeeSessionClient();
