import { buildAffiliateTrackingUrl } from '../lib/shopee/tracking-builder';
import { ShopeeSessionClient } from '../lib/shopee/session-client';
import { ShopeeClient } from '../lib/shopee/client';
import { createVoucherShim } from '../lib/shopee/voucher-shim';

async function runNonApiVerification() {
  console.log('====================================================');
  console.log('🚀 ShopeeLink Pro - Non-OpenAPI Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 4;

  // Test 1: Direct Tracking URL Builder
  try {
    const cleanUrl = 'https://shopee.vn/product/10928312/22819283712';
    const affiliateId = 'madridista0303';
    const trackingUrl = buildAffiliateTrackingUrl({
      cleanUrl,
      affiliateId,
      subIds: ['tiktok_bio', 'meta_campaign'],
      includeMetaVoucher: true,
    });

    const parsed = new URL(trackingUrl);
    if (parsed.searchParams.get('af_sub_siteid') !== affiliateId) {
      throw new Error(`af_sub_siteid mismatch: ${parsed.searchParams.get('af_sub_siteid')}`);
    }
    if (parsed.searchParams.get('utm_source') !== 'facebook' || parsed.searchParams.get('utm_campaign') !== 'meta_collab') {
      throw new Error('Meta voucher UTM params missing');
    }
    if (parsed.searchParams.get('sub_id_1') !== 'tiktok_bio') {
      throw new Error('SubID 1 missing');
    }

    console.log(`✅ [TEST 1/4] Direct Tracking URL Builder: PASSED (${trackingUrl.slice(0, 70)}...)`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1/4] Tracking URL Builder: FAILED:', err.message);
  }

  // Test 2: ShopeeSessionClient Availability & Graceful Fallback
  try {
    const emptyClient = new ShopeeSessionClient('');
    if (emptyClient.isAvailable()) {
      throw new Error('Empty session client should not be available');
    }

    const shortResult = await emptyClient.generateShortLink('https://shopee.vn/product/1/2');
    if (shortResult !== null) {
      throw new Error('Should return null when session cookie is not set');
    }

    console.log('✅ [TEST 2/4] ShopeeSessionClient Graceful Fallback: PASSED');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2/4] Session Client: FAILED:', err.message);
  }

  // Test 3: ShopeeClient Tier 2 (Direct Affiliate Tracking Mode)
  try {
    process.env.SHOPEE_AFFILIATE_ID = 'madridista0303';
    delete process.env.SHOPEE_APP_ID;

    const client = new ShopeeClient({ mockMode: false, appId: '', secretKey: '' });
    const generated = await client.generateShortLink('https://shopee.vn/product/111/222', ['tiktok_bio']);

    if (!generated.includes('af_sub_siteid=madridista0303')) {
      throw new Error(`Generated tracking link missing affiliate ID: ${generated}`);
    }

    console.log(`✅ [TEST 3/4] ShopeeClient Direct Tracking Fallback: PASSED (${generated.slice(0, 60)}...)`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3/4] Client Tier 2: FAILED:', err.message);
  }

  // Test 4: End-to-End Non-API Voucher Shim & Deep Link
  try {
    const originUrl = 'https://shopee.vn/product/111/222';
    const trackingLink = buildAffiliateTrackingUrl({
      cleanUrl: originUrl,
      affiliateId: 'madridista0303',
      subIds: ['tiktok_bio'],
    });

    const shim = await createVoucherShim({
      originalUrl: originUrl,
      cleanUrl: originUrl,
      affiliateUrl: trackingLink,
    });

    if (!shim.slug || !shim.deepLink.startsWith('shopee://web?url=')) {
      throw new Error('Shim generation failed for non-API flow');
    }

    console.log(`✅ [TEST 4/4] Non-API Voucher Shim & Deep Link: PASSED (Slug: ${shim.slug})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4/4] End-to-End Shim: FAILED:', err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 Kết quả Non-API Suite: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runNonApiVerification();
