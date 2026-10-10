/**
 * Shopee Open API & Client Type Definitions
 * Tham chiếu: docs/SHOPEE_API_SPEC.md
 */

export interface ShopeeAuthHeaders extends Record<string, string> {
  'Content-Type': string;
  'Authorization': string;
}

export interface ShopeeSignResult {
  timestamp: number;
  signature: string;
  headers: ShopeeAuthHeaders;
}

// ==================== GraphQL Envelope ====================

export interface ShopeeGraphQLErrorLocation {
  line: number;
  column: number;
}

export interface ShopeeGraphQLError {
  message: string;
  locations?: ShopeeGraphQLErrorLocation[];
  path?: (string | number)[];
  extensions?: {
    code?: number | string;
    [key: string]: unknown;
  };
}

export interface ShopeeGraphQLResponse<T> {
  data?: T | null;
  errors?: ShopeeGraphQLError[];
}

// ==================== Mutation: generateShortLink ====================

export interface GenerateShortLinkInput {
  originUrl: string;
  subIds?: string[];
}

export interface GenerateShortLinkData {
  generateShortLink: {
    shortLink: string;
  };
}

// ==================== Query: productOfferV2 ====================

export interface ProductOfferNode {
  itemId: string;
  shopId: string;
  productName: string;
  price: string;
  priceMin?: string;
  priceMax?: string;
  imageUrl: string;
  offerLink: string;
  commissionRate: string;
  sales?: number;
}

export interface ProductOfferPageInfo {
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ProductOfferV2Data {
  productOfferV2: {
    nodes: ProductOfferNode[];
    pageInfo: ProductOfferPageInfo;
  };
}

// ==================== Query: conversionReport ====================

export interface ConversionOrderItem {
  itemId: string;
  itemName: string;
  itemPrice: string;
  itemCount: number;
}

export interface ConversionReportNode {
  checkoutId: string;
  purchaseTime: number;
  orderStatus: string;
  estimatedTotalCommission: string;
  grossCommission: string;
  cappedCommission: string;
  totalBrandCommission: string;
  orders: ConversionOrderItem[];
}

export interface ConversionReportData {
  conversionReport: {
    nodes: ConversionReportNode[];
    pageInfo: {
      scrollId?: string;
      hasNextPage: boolean;
    };
  };
}

// ==================== Client Configuration ====================

export interface ShopeeClientConfig {
  appId?: string;
  secretKey?: string;
  endpoint?: string;
  mockMode?: boolean;
  timeoutMs?: number;
}
