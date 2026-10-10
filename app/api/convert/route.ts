import { NextRequest, NextResponse } from 'next/server';
import { parseShopeeInput } from '@/lib/shopee/parser';
import { defaultShopeeClient, ShopeeApiError } from '@/lib/shopee/client';
import { createVoucherShim, VoucherShimData } from '@/lib/shopee/voucher-shim';
import { cacheService } from '@/lib/cache';

export interface ConvertApiResponse {
  success: boolean;
  message?: string;
  data?: {
    originalInput: string;
    resolvedUrl: string;
    cleanUrl: string;
    itemId?: string;
    shopId?: string;
    affiliateUrl: string;
    targetWithVoucherUrl: string;
    slug: string;
    goUrl: string;
    deepLink: string;
    androidIntent: string;
    discountPercentage: number;
    maxDiscountAmount: string;
    fromCache: boolean;
  };
}

const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const record = ipRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json<ConvertApiResponse>(
        {
          success: false,
          message: 'Bạn đã thực hiện quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau giây lát.',
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body.url !== 'string' || !body.url.trim()) {
      return NextResponse.json<ConvertApiResponse>(
        {
          success: false,
          message: 'Vui lòng cung cấp đường link Shopee cần chuyển đổi.',
        },
        { status: 400 }
      );
    }

    const rawInput = body.url.trim();
    const customSubIds: string[] = Array.isArray(body.subIds)
      ? body.subIds
      : ['tiktok_bio', 'shopeelink_web'];

    // 1. Bóc tách & phân giải link Shopee
    const parsed = await parseShopeeInput(rawInput);
    if (!parsed.isValid) {
      return NextResponse.json<ConvertApiResponse>(
        {
          success: false,
          message: parsed.error || 'Link Shopee không hợp lệ.',
        },
        { status: 400 }
      );
    }

    // 2. Kiểm tra Cache theo cleanUrl và subIds
    const subIdsKey = customSubIds.slice().sort().join(',');
    const cacheKey = `shopee:converted:${parsed.cleanUrl}:${subIdsKey}`;
    const cachedData = await cacheService.get<VoucherShimData>(cacheKey);

    if (cachedData) {
      return NextResponse.json<ConvertApiResponse>({
        success: true,
        data: {
          originalInput: rawInput,
          resolvedUrl: parsed.resolvedUrl,
          cleanUrl: parsed.cleanUrl,
          itemId: parsed.itemId,
          shopId: parsed.shopId,
          affiliateUrl: cachedData.affiliateUrl,
          targetWithVoucherUrl: cachedData.targetWithVoucherUrl,
          slug: cachedData.slug,
          goUrl: `/go/${cachedData.slug}`,
          deepLink: cachedData.deepLink,
          androidIntent: cachedData.androidIntent,
          discountPercentage: cachedData.discountPercentage,
          maxDiscountAmount: cachedData.maxDiscountAmount,
          fromCache: true,
        },
      });
    }

    // 3. Gọi Shopee Open API để tạo ShortLink Affiliate
    const affiliateUrl = await defaultShopeeClient.generateShortLink(
      parsed.cleanUrl,
      customSubIds
    );

    // 4. Bọc qua Meta Partner Shim & tạo Deep Link
    const shim = await createVoucherShim({
      originalUrl: rawInput,
      cleanUrl: parsed.cleanUrl,
      affiliateUrl,
      itemId: parsed.itemId,
      shopId: parsed.shopId,
    });

    // 5. Lưu vào cache theo cleanUrl và subIds (TTL 30 ngày)
    await cacheService.set(cacheKey, shim, 2592000);

    // 6. Trả về kết quả
    return NextResponse.json<ConvertApiResponse>({
      success: true,
      data: {
        originalInput: rawInput,
        resolvedUrl: parsed.resolvedUrl,
        cleanUrl: parsed.cleanUrl,
        itemId: parsed.itemId,
        shopId: parsed.shopId,
        affiliateUrl: shim.affiliateUrl,
        targetWithVoucherUrl: shim.targetWithVoucherUrl,
        slug: shim.slug,
        goUrl: `/go/${shim.slug}`,
        deepLink: shim.deepLink,
        androidIntent: shim.androidIntent,
        discountPercentage: shim.discountPercentage,
        maxDiscountAmount: shim.maxDiscountAmount,
        fromCache: false,
      },
    });
  } catch (err: unknown) {
    console.error('API /api/convert error:', err);

    if (err instanceof ShopeeApiError) {
      return NextResponse.json<ConvertApiResponse>(
        {
          success: false,
          message: `Lỗi kết nối Shopee API: ${err.message}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json<ConvertApiResponse>(
      {
        success: false,
        message: 'Đã xảy ra lỗi trong quá trình xử lý liên kết. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
