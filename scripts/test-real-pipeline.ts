import fs from 'fs';
import path from 'path';

// Đọc và nạp .env.local bằng fs thuần
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        // Bỏ dấu nháy bao ngoài giống dotenv của Next.js (cookie thường được bọc trong "...")
        const v = trimmed.slice(idx + 1).trim().replace(/^(['"])([\s\S]*)\1$/, '$2');
        process.env[k] = v;
      }
    }
  }
} catch (e) {
  console.warn('Cannot read .env.local:', e);
}

async function main() {
  // Import động SAU khi nạp .env.local: các singleton (session client, cache) đọc env ngay lúc khởi tạo
  const { parseShopeeInput } = await import('../lib/shopee/parser');
  const { defaultShopeeClient } = await import('../lib/shopee/client');
  const { defaultSessionClient } = await import('../lib/shopee/session-client');
  const { createVoucherShim, getVoucherShimBySlug } = await import('../lib/shopee/voucher-shim');
  const { cacheService } = await import('../lib/cache');

  console.log('--- TEST ATTRIBUTION THỰC TẾ VỚI .ENV.LOCAL (cần SHOPEE_SESSION_COOKIE) ---');
  const expectedAffiliateId = process.env.SHOPEE_AFFILIATE_ID || 'an_17315740682';
  console.log('Affiliate ID đối chiếu:', expectedAffiliateId);

  if (!defaultSessionClient.isAvailable()) {
    throw new Error('Thiếu SHOPEE_SESSION_COOKIE trong .env.local - không thể kiểm tra attribution thực tế (link mock không có giá trị).');
  }

  // Sản phẩm có thật trên Shopee (ghi đè bằng TEST_PRODUCT_URL nếu cần)
  const testUrl = process.env.TEST_PRODUCT_URL || 'https://shopee.vn/product/10119537/26935717781';
  const parsed = await parseShopeeInput(testUrl);
  console.log('1. Parsed:');
  console.log('   cleanUrl:', parsed.cleanUrl);

  // 2. Bắt buộc là short link chính thức s.shopee.vn (chỉ link này mới được Shopee ghi nhận click)
  const affUrl = await defaultShopeeClient.generateShortLink(parsed.cleanUrl, ['tiktok_bio']);
  console.log('2. Affiliate Short Link:', affUrl);
  if (new URL(affUrl).hostname !== 's.shopee.vn') {
    throw new Error(`CRITICAL FAIL: ${affUrl} không phải short link s.shopee.vn`);
  }

  // 3. Đi qua server short link của Shopee: phải redirect về đúng affiliate ID kèm click id do Shopee cấp
  const res = await fetch(affUrl, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    },
  });
  const location = res.headers.get('location') || '';
  console.log(`3. Redirect HTTP ${res.status} -> ${location.split('?')[0]}`);
  const landing = new URL(location, affUrl);
  const utmSource = landing.searchParams.get('utm_source');
  const utmMedium = landing.searchParams.get('utm_medium');
  const clickId = landing.searchParams.get('uls_trackid');
  console.log(`   utm_source=${utmSource} utm_medium=${utmMedium} uls_trackid=${clickId}`);

  if (utmSource !== expectedAffiliateId || utmMedium !== 'affiliates' || !clickId) {
    throw new Error('CRITICAL FAIL: Short link không gắn đúng affiliate ID hoặc thiếu click id của Shopee!');
  }

  // 4. Shim / deep link / slug phải giữ nguyên short link
  const shim = await createVoucherShim({
    originalUrl: testUrl,
    cleanUrl: parsed.cleanUrl,
    affiliateUrl: affUrl,
    itemId: parsed.itemId,
    shopId: parsed.shopId,
  });
  console.log('4. Shim slug:', shim.slug, '| deepLink:', shim.deepLink);
  if (shim.targetWithVoucherUrl !== affUrl || shim.deepLink !== affUrl || !shim.androidIntent.includes(affUrl.replace(/^https:\/\//, ''))) {
    throw new Error('CRITICAL FAIL: Shim không giữ nguyên short link affiliate!');
  }

  // 5. Cache miss vẫn khôi phục đúng short link
  await cacheService.delete(`shopee:shim:${shim.slug}`);
  const recovered = await getVoucherShimBySlug(shim.slug);
  console.log('5. Recovered on cache miss:', recovered?.affiliateUrl);
  if (!recovered || recovered.affiliateUrl !== affUrl) {
    throw new Error('CRITICAL FAIL: Không khôi phục được short link khi cache miss!');
  }

  console.log('\n>>> ATTRIBUTION THỰC TẾ OK: link đi qua s.shopee.vn và được gắn đúng affiliate ID <<<');
}

main().catch(err => {
  console.error('LỖI:', err);
  process.exit(1);
});
