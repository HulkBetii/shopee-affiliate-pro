import { buildShopeeAuth } from './signer';
import { defaultSessionClient } from './session-client';
import { isShopeeShortUrl } from './parser';
import { buildAffiliateTrackingUrl } from './tracking-builder';
import {
  GENERATE_SHORT_LINK_MUTATION,
  PRODUCT_OFFER_QUERY,
  CONVERSION_REPORT_QUERY,
} from './queries';
import {
  ShopeeClientConfig,
  ShopeeGraphQLResponse,
  GenerateShortLinkData,
  ProductOfferV2Data,
  ConversionReportData,
} from './types';

export class ShopeeApiError extends Error {
  public code?: number | string;
  public details?: unknown;

  constructor(message: string, code?: number | string, details?: unknown) {
    super(message);
    this.name = 'ShopeeApiError';
    this.code = code;
    this.details = details;
  }
}

export class ShopeeClient {
  private appId: string;
  private secretKey: string;
  private endpoint: string;
  private mockMode: boolean;
  private timeoutMs: number;

  constructor(config?: ShopeeClientConfig) {
    this.appId = config?.appId || process.env.SHOPEE_APP_ID || '';
    this.secretKey = config?.secretKey || process.env.SHOPEE_SECRET_KEY || '';
    this.endpoint =
      config?.endpoint ||
      process.env.SHOPEE_GRAPHQL_ENDPOINT ||
      'https://open-api.affiliate.shopee.vn/graphql';

    // Tự động bật Mock Mode: Chỉ bật trong dev/test hoặc khi được chỉ định rõ
    // TUYỆT ĐỐI KHÔNG tự động bật Mock Mode trên môi trường production
    const isProd = process.env.NODE_ENV === 'production';
    const envMock = process.env.SHOPEE_MOCK_MODE === 'true';
    const missingKeys = !this.appId || !this.secretKey;

    if (config?.mockMode !== undefined) {
      this.mockMode = config.mockMode;
    } else if (isProd) {
      // Trên production, cấm tự động chuyển sang mock mode khi thiếu keys
      this.mockMode = false;
    } else {
      this.mockMode = envMock || missingKeys;
    }

    this.timeoutMs = config?.timeoutMs || 10000;
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Thực thi một GraphQL request với cơ chế ký số SHA256 tự động
   */
  public async executeGraphQL<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    if (this.mockMode) {
      if (process.env.NODE_ENV === 'production') {
        throw new ShopeeApiError(
          'Mock Mode bị vô hiệu hóa hoàn toàn trên môi trường Production.',
          'MOCK_NOT_ALLOWED'
        );
      }
      return this.handleMockResponse<T>(query, variables);
    }

    const payload = JSON.stringify({ query, variables });
    const auth = buildShopeeAuth(this.appId, this.secretKey, payload);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: auth.headers,
        body: payload,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ShopeeApiError(
          `Shopee HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const json = (await response.json()) as ShopeeGraphQLResponse<T>;

      if (json.errors && json.errors.length > 0) {
        const primaryError = json.errors[0];
        const errorCode = primaryError.extensions?.code;
        throw new ShopeeApiError(
          `Shopee GraphQL Error: ${primaryError.message}`,
          errorCode,
          json.errors
        );
      }

      if (!json.data) {
        throw new ShopeeApiError('Shopee response data is empty or null');
      }

      return json.data;
    } catch (err: unknown) {
      if (err instanceof ShopeeApiError) {
        throw err;
      }
      if ((err as Error)?.name === 'AbortError') {
        throw new ShopeeApiError(
          `Shopee API request timed out after ${this.timeoutMs}ms`,
          'TIMEOUT'
        );
      }
      throw new ShopeeApiError(
        `Shopee API request failed: ${(err as Error)?.message || 'Unknown network error'}`
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Generate an official affiliate short link (s.shopee.vn).
   * Shopee only attributes commission to clicks that go through its short-link server
   * (it issues uls_trackid + a signed gads_t_sig per click), so self-built tracking URLs
   * are never returned here.
   * Order: Session Cookie (batchCustomLink) -> Open API GraphQL (when keys exist) / Mock (non-production).
   * @param originUrl Đường link sản phẩm Shopee gốc
   * @param subIds Danh sách tối đa 5 SubID phân tích traffic
   * @throws ShopeeApiError code AFFILIATE_LINK_UNAVAILABLE khi không tạo được short link chính thức
   */
  public async generateShortLink(
    originUrl: string,
    subIds?: string[]
  ): Promise<string> {
    let sessionFailure = 'SHOPEE_SESSION_COOKIE is not configured';

    // Tầng 1: Session Cookie -> API nội bộ Console sinh link s.shopee.vn
    if (defaultSessionClient.isAvailable()) {
      const sessionLink = await defaultSessionClient.generateShortLink(originUrl, subIds);
      if (sessionLink && isShopeeShortUrl(sessionLink)) {
        return sessionLink;
      }
      sessionFailure = sessionLink
        ? `Session API returned a non short-link URL: ${sessionLink.slice(0, 120)}`
        : defaultSessionClient.getLastError() || 'Session API returned no short link';
    }

    // Tầng 2: Nếu bật cờ ALLOW_DIRECT_TRACKING_FALLBACK, fallback sang direct tracking URL để cứu traffic
    if (process.env.ALLOW_DIRECT_TRACKING_FALLBACK === 'true') {
      const customAffiliateId = process.env.SHOPEE_AFFILIATE_ID || 'an_17315740682';
      if (customAffiliateId) {
        console.warn(`[ShopeeClient] Session short link unavailable (${sessionFailure}), using direct tracking fallback.`);
        return buildAffiliateTrackingUrl({
          cleanUrl: originUrl,
          affiliateId: customAffiliateId,
          subIds,
          includeMetaVoucher: true,
        });
      }
    }

    // Không có Open API key và không ở mock mode -> không thể tạo link có hoa hồng.
    // Cookie đã cấu hình mà vẫn lỗi thì cũng báo lỗi luôn, không để link mock che mất sự cố (kể cả ở dev).
    const hasOpenApiKeys = !!this.appId && !!this.secretKey;
    if (!hasOpenApiKeys && (!this.mockMode || defaultSessionClient.isAvailable())) {
      throw new ShopeeApiError(
        'Không tạo được short link affiliate chính thức (s.shopee.vn).',
        'AFFILIATE_LINK_UNAVAILABLE',
        { reason: sessionFailure }
      );
    }

    // Tầng 3: Gọi Open API GraphQL (nếu có key thật) hoặc Mock Response
    const input: { originUrl: string; subIds?: string[] } = { originUrl };
    if (subIds && subIds.length > 0) {
      input.subIds = subIds.slice(0, 5);
    }

    const data = await this.executeGraphQL<GenerateShortLinkData>(
      GENERATE_SHORT_LINK_MUTATION,
      { input }
    );

    return data.generateShortLink.shortLink;
  }

  /**
   * Tìm kiếm sản phẩm và hoa hồng (productOfferV2)
   */
  public async searchProductOffers(
    keyword: string,
    options?: { page?: number; limit?: number; sortType?: number }
  ): Promise<ProductOfferV2Data['productOfferV2']> {
    const variables = {
      keyword,
      page: options?.page || 1,
      limit: options?.limit || 10,
      sortType: options?.sortType || 1,
    };

    const data = await this.executeGraphQL<ProductOfferV2Data>(
      PRODUCT_OFFER_QUERY,
      variables
    );

    return data.productOfferV2;
  }

  /**
   * Kéo báo cáo chuyển đổi / hoa hồng (conversionReport) kèm phân trang đầy đủ
   */
  public async getConversionReport(params: {
    purchaseTimeStart: number;
    purchaseTimeEnd: number;
    limit?: number;
    orderStatus?: string;
    scrollId?: string;
  }): Promise<ConversionReportData['conversionReport']> {
    const allNodes: ConversionReportData['conversionReport']['nodes'] = [];
    let currentScrollId: string | undefined = params.scrollId;
    let hasNextPage = true;
    let iterations = 0;
    const maxIterations = 20;

    while (hasNextPage && iterations < maxIterations) {
      iterations++;
      const variables = {
        purchaseTimeStart: params.purchaseTimeStart,
        purchaseTimeEnd: params.purchaseTimeEnd,
        limit: params.limit || 100,
        orderStatus: params.orderStatus || 'ALL',
        scrollId: currentScrollId,
      };

      const data = await this.executeGraphQL<ConversionReportData>(
        CONVERSION_REPORT_QUERY,
        variables
      );

      const report = data.conversionReport;
      if (report?.nodes) {
        allNodes.push(...report.nodes);
      }

      if (report?.pageInfo?.hasNextPage && report?.pageInfo?.scrollId) {
        currentScrollId = report.pageInfo.scrollId;
        hasNextPage = true;
      } else {
        hasNextPage = false;
      }
    }

    return {
      nodes: allNodes,
      pageInfo: {
        scrollId: currentScrollId,
        hasNextPage: false,
      },
    };
  }

  /**
   * Phản hồi dữ liệu Mock an toàn cho môi trường test/dev
   */
  private handleMockResponse<T>(
    query: string,
    variables?: Record<string, unknown>
  ): T {
    if (query.includes('generateShortLink')) {
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      const mockResult: GenerateShortLinkData = {
        generateShortLink: {
          shortLink: `https://s.shopee.vn/mock_${randomSuffix}`,
        },
      };
      return mockResult as unknown as T;
    }

    if (query.includes('productOfferV2')) {
      const mockResult: ProductOfferV2Data = {
        productOfferV2: {
          nodes: [
            {
              itemId: '22819283712',
              shopId: '10928312',
              productName: 'Áo Thun Cotton Compact Form Rộng Unisex (Demo Mock)',
              price: '189000',
              priceMin: '189000',
              priceMax: '249000',
              imageUrl: 'https://cf.shopee.vn/file/mock_sample_image',
              offerLink: 'https://s.shopee.vn/mock_offer',
              commissionRate: '15.5',
              sales: 1250,
            },
          ],
          pageInfo: {
            page: 1,
            limit: 10,
            hasNextPage: false,
          },
        },
      };
      return mockResult as unknown as T;
    }

    if (query.includes('conversionReport')) {
      const mockResult: ConversionReportData = {
        conversionReport: {
          nodes: [
            {
              checkoutId: 'MOCK_CHECKOUT_001',
              purchaseTime: Math.floor(Date.now() / 1000) - 3600,
              orderStatus: 'COMPLETED',
              totalCommission: '45000',
              estimatedTotalCommission: '45000',
              grossCommission: '50000',
              cappedCommission: '45000',
              totalBrandCommission: '15000',
              orders: [
                {
                  orderStatus: 'COMPLETED',
                  items: [
                    {
                      itemId: '22819283712',
                      itemName: 'Áo Thun Cotton Compact Form Rộng',
                      itemPrice: '189000',
                      qty: 1,
                      itemCount: 1,
                    },
                  ],
                },
              ],
            },
          ],
          pageInfo: {
            hasNextPage: false,
          },
        },
      };
      return mockResult as unknown as T;
    }

    throw new ShopeeApiError(`Mock response not implemented for query: ${query.slice(0, 50)}...`);
  }
}

// Export default singleton instance sử dụng cấu hình môi trường
export const defaultShopeeClient = new ShopeeClient();
