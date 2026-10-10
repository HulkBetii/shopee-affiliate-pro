import { buildShopeeAuth, verifyShopeeSignature } from '../lib/shopee/signer';
import { ShopeeClient } from '../lib/shopee/client';
import crypto from 'crypto';

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 ShopeeLink Pro - Phase 1 Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 5;

  // Test 1: Kiểm tra tính toán chữ ký số HMAC-SHA256
  try {
    const testAppId = '123456';
    const testSecret = 'secret_test_key_xyz';
    const testPayload = JSON.stringify({ query: '{ test }' });
    const fixedTimestamp = 1728528000;

    const expectedSignatureBase = `${testAppId}${fixedTimestamp}${testPayload}${testSecret}`;
    const expectedSignature = crypto.createHash('sha256').update(expectedSignatureBase).digest('hex');

    const result = buildShopeeAuth(testAppId, testSecret, testPayload, fixedTimestamp);

    if (result.signature !== expectedSignature) {
      throw new Error(`Signature mismatch: got ${result.signature}, expected ${expectedSignature}`);
    }

    const authHeaderValid = result.headers.Authorization ===
      `SHA256 Credential=${testAppId}, Timestamp=${fixedTimestamp}, Signature=${expectedSignature}`;

    if (!authHeaderValid) {
      throw new Error(`Header format invalid: ${result.headers.Authorization}`);
    }

    const isValid = verifyShopeeSignature(testAppId, testSecret, testPayload, fixedTimestamp, expectedSignature);
    if (!isValid) {
      throw new Error('Signature verification function failed');
    }

    console.log('✅ [TEST 1/5] Thuật toán ký số SHA256 & Header: PASSED');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1/5] Thuật toán ký số: FAILED:', err.message);
  }

  // Test 2: Khởi tạo ShopeeClient ở chế độ Mock Sandbox
  try {
    const mockClient = new ShopeeClient({ mockMode: true });
    if (!mockClient.isMockMode()) {
      throw new Error('Client should be in mock mode');
    }
    console.log('✅ [TEST 2/5] Khởi tạo ShopeeClient Mock Sandbox: PASSED');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2/5] Khởi tạo ShopeeClient: FAILED:', err.message);
  }

  // Test 3: Mutation generateShortLink
  try {
    const client = new ShopeeClient({ mockMode: true });
    const originalUrl = 'https://shopee.vn/product/12345/67890';
    const shortLink = await client.generateShortLink(originalUrl, ['tiktok_bio', 'test_tag']);

    if (!shortLink.startsWith('https://s.shopee.vn/')) {
      throw new Error(`Unexpected shortLink format: ${shortLink}`);
    }

    console.log(`✅ [TEST 3/5] Mutation generateShortLink: PASSED (${shortLink})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3/5] Mutation generateShortLink: FAILED:', err.message);
  }

  // Test 4: Query searchProductOffers (productOfferV2)
  try {
    const client = new ShopeeClient({ mockMode: true });
    const offers = await client.searchProductOffers('giày sneaker', { limit: 5 });

    if (!offers.nodes || offers.nodes.length === 0) {
      throw new Error('No product offer nodes returned');
    }

    console.log(`✅ [TEST 4/5] Query productOfferV2: PASSED (Found ${offers.nodes.length} offers)`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4/5] Query productOfferV2: FAILED:', err.message);
  }

  // Test 5: Query getConversionReport (conversionReport)
  try {
    const client = new ShopeeClient({ mockMode: true });
    const report = await client.getConversionReport({
      purchaseTimeStart: Math.floor(Date.now() / 1000) - 86400,
      purchaseTimeEnd: Math.floor(Date.now() / 1000),
    });

    if (!report.nodes || report.nodes.length === 0) {
      throw new Error('No conversion nodes returned');
    }

    console.log(`✅ [TEST 5/5] Query conversionReport: PASSED (Loaded checkout ${report.nodes[0].checkoutId})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 5/5] Query conversionReport: FAILED:', err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 Kết quả: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification();
