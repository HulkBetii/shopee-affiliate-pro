import { extractUrlFromText, parseShopeeInput, extractShopeeIds, sanitizeShopeeUrl } from '../lib/shopee/parser';
import { cacheService } from '../lib/cache';
import { createVoucherShim, getVoucherShimBySlug } from '../lib/shopee/voucher-shim';
import { defaultShopeeClient } from '../lib/shopee/client';

async function runPhase2Verification() {
  console.log('====================================================');
  console.log('🚀 ShopeeLink Pro - Phase 2 Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 5;

  // Test 1: Bóc tách URL từ văn bản tự do (kèm Tiếng Việt, emoji, text rác)
  try {
    const rawText = '🔥 Áo thun unisex hot trend hè 2026 giá chỉ 99k https://shopee.vn/product/10928312/22819283712?sp_atk=81283&xptdk=91283 Mua ngay kẻo hết!';
    const extracted = extractUrlFromText(rawText);

    if (!extracted || !extracted.startsWith('https://shopee.vn/product/')) {
      throw new Error(`Failed to extract valid URL, got: ${extracted}`);
    }

    console.log(`✅ [TEST 1/5] Extract URL from raw text: PASSED (${extracted})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1/5] Extract URL: FAILED:', err.message);
  }

  // Test 2: Bóc tách Item ID / Shop ID & Làm sạch URL
  try {
    const testUrl1 = 'https://shopee.vn/Ao-Khoac-Bomber-Nam-Nu-i.123456.789012?sp_atk=abc&utm_source=tiktok';
    const ids1 = extractShopeeIds(testUrl1);
    if (ids1.shopId !== '123456' || ids1.itemId !== '789012') {
      throw new Error(`Failed to extract slug IDs: shopId=${ids1.shopId}, itemId=${ids1.itemId}`);
    }

    const clean1 = sanitizeShopeeUrl(testUrl1);
    if (clean1 !== 'https://shopee.vn/product/123456/789012') {
      throw new Error(`Sanitized URL not canonical: ${clean1}`);
    }

    console.log(`✅ [TEST 2/5] Parse IDs & URL Sanitization: PASSED (${clean1})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2/5] Parse IDs: FAILED:', err.message);
  }

  // Test 3: Tầng Caching (Set, Get, Hit, Miss)
  try {
    const testKey = 'test:item:cache_verify';
    const testValue = { title: 'Sản phẩm thử nghiệm', price: 250000 };

    await cacheService.set(testKey, testValue, 10);
    const retrieved = await cacheService.get<typeof testValue>(testKey);

    if (!retrieved || retrieved.price !== 250000) {
      throw new Error('Cache retrieval mismatch or null');
    }

    await cacheService.delete(testKey);
    const afterDelete = await cacheService.get(testKey);
    if (afterDelete !== null) {
      throw new Error('Cache delete failed');
    }

    console.log(`✅ [TEST 3/5] CacheService (Memory & Redis fallback): PASSED`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3/5] CacheService: FAILED:', err.message);
  }

  // Test 4: Shim giữ nguyên short link affiliate chính thức & tự phục hồi slug s<code>
  try {
    const affiliateUrl = 'https://s.shopee.vn/AbC123xyz';

    const shimProduct = await createVoucherShim({
      originalUrl: 'https://shopee.vn/product/123/456',
      cleanUrl: 'https://shopee.vn/product/123/456',
      affiliateUrl,
      itemId: '456',
      shopId: '123',
    });

    if (shimProduct.targetWithVoucherUrl !== affiliateUrl) {
      throw new Error(`Target URL must be the untouched short link, got ${shimProduct.targetWithVoucherUrl}`);
    }
    if (shimProduct.deepLink !== affiliateUrl) {
      throw new Error(`Deep link must be the short link (Universal Link), got ${shimProduct.deepLink}`);
    }
    if (!shimProduct.androidIntent.startsWith('intent://s.shopee.vn/AbC123xyz#Intent;scheme=https;package=com.shopee.vn;')) {
      throw new Error(`Android Intent must wrap the short link: ${shimProduct.androidIntent}`);
    }
    const serialized = JSON.stringify(shimProduct);
    if (serialized.includes('shopee://') || serialized.includes('meta_collab') || serialized.includes('l.facebook.com')) {
      throw new Error(`Shim contains attribution-breaking links: ${serialized}`);
    }
    if (shimProduct.slug !== 'sAbC123xyz') {
      throw new Error(`Slug must carry the short link code, got ${shimProduct.slug}`);
    }

    const lookupShim = await getVoucherShimBySlug(shimProduct.slug);
    if (!lookupShim || lookupShim.slug !== shimProduct.slug || lookupShim.itemId !== '456') {
      throw new Error('Failed to retrieve voucher shim by slug or itemId missing');
    }

    // Cache miss (serverless instance mới): slug s<code> phải tự dựng lại đúng short link
    await cacheService.delete(`shopee:shim:${shimProduct.slug}`);
    const recoveredShim = await getVoucherShimBySlug(shimProduct.slug);
    if (!recoveredShim || recoveredShim.affiliateUrl !== affiliateUrl || recoveredShim.deepLink !== affiliateUrl) {
      throw new Error('Stateless short-link recovery failed when cache is empty');
    }

    console.log(`✅ [TEST 4/5] Official Short Link Shim & Stateless Recovery: PASSED (Slug: ${shimProduct.slug})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4/5] Official Short Link Shim: FAILED:', err.message);
  }

  // Test 5: End-to-End Pipeline Chuyển đổi Link
  try {
    const rawInput = 'Xem ngay sản phẩm này https://shopee.vn/product/55555/66666';
    const parsed = await parseShopeeInput(rawInput);

    if (!parsed.isValid) {
      throw new Error(`Pipeline parsing failed: ${parsed.error}`);
    }

    const affiliateLink = await defaultShopeeClient.generateShortLink(parsed.cleanUrl, ['tiktok_bio']);
    const shimResult = await createVoucherShim({
      originalUrl: rawInput,
      cleanUrl: parsed.cleanUrl,
      affiliateUrl: affiliateLink,
    });

    if (!shimResult.slug || !shimResult.deepLink) {
      throw new Error('Shim result missing slug or deepLink');
    }

    console.log(`✅ [TEST 5/5] End-to-End Conversion Pipeline: PASSED (Affiliate: ${affiliateLink} -> Slug: ${shimResult.slug})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 5/5] Pipeline Conversion: FAILED:', err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 Kết quả Phase 2: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase2Verification();
