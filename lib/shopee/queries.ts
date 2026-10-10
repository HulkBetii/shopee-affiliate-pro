/**
 * Các GraphQL Operations chuẩn của Shopee Open API
 * Endpoint: https://open-api.affiliate.shopee.vn/graphql
 */

export const GENERATE_SHORT_LINK_MUTATION = `
mutation GenerateShortLink($input: ShortLinkInput!) {
  generateShortLink(input: $input) {
    shortLink
  }
}
`.trim();

export const PRODUCT_OFFER_QUERY = `
query ProductOffer($keyword: String, $sortType: Int, $page: Int, $limit: Int) {
  productOfferV2(
    keyword: $keyword,
    sortType: $sortType,
    page: $page,
    limit: $limit
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
`.trim();

export const CONVERSION_REPORT_QUERY = `
query ConversionReport(
  $purchaseTimeStart: Int!,
  $purchaseTimeEnd: Int!,
  $limit: Int,
  $orderStatus: String,
  $scrollId: String
) {
  conversionReport(
    purchaseTimeStart: $purchaseTimeStart,
    purchaseTimeEnd: $purchaseTimeEnd,
    limit: $limit,
    orderStatus: $orderStatus,
    scrollId: $scrollId
  ) {
    nodes {
      purchaseTime
      orderStatus
      totalCommission
      orders {
        orderStatus
        items {
          itemId
          itemName
          itemPrice
          qty
        }
      }
    }
    pageInfo {
      scrollId
      hasNextPage
    }
  }
}
`.trim();
