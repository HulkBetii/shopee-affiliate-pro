import {
  trackEvent,
  trackConvertAttempt,
  trackOpenShopeeApp,
  trackCopyLink,
  trackCopyVoucher,
} from '../lib/analytics';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import nextConfig from '../next.config.mjs';

async function runPhase5Verification() {
  console.log('====================================================');
  console.log('🚀 ShopeeLink Pro - Phase 5 Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 4;

  // Test 1: Kiểm tra an toàn cho Analytics Helper (Node / SSR environment)
  try {
    trackEvent('test_event', { key: 'value' });
    trackConvertAttempt('https://shopee.vn/product/1/2');
    trackOpenShopeeApp('slug123', 25);
    trackCopyLink('slug123');
    trackCopyVoucher('METAPAR25');

    console.log('✅ [TEST 1/4] Analytics Client Helper Safe Execution: PASSED');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1/4] Analytics Helper: FAILED:', err.message);
  }

  // Test 2: Kiểm tra cấu hình robots.ts
  try {
    const robotsData = robots();
    if (!robotsData.sitemap || !robotsData.rules) {
      throw new Error('robots.ts returned invalid metadata schema');
    }
    console.log(`✅ [TEST 2/4] SEO Robots Metadata: PASSED (${robotsData.sitemap})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2/4] robots.ts: FAILED:', err.message);
  }

  // Test 3: Kiểm tra cấu hình sitemap.ts
  try {
    const sitemapData = sitemap();
    if (!Array.isArray(sitemapData) || sitemapData.length === 0 || !sitemapData[0].url) {
      throw new Error('sitemap.ts returned invalid entries');
    }
    console.log(`✅ [TEST 3/4] SEO Sitemap Metadata: PASSED (${sitemapData[0].url})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3/4] sitemap.ts: FAILED:', err.message);
  }

  // Test 4: Kiểm tra HTTP Security Headers trong next.config.mjs
  try {
    if (typeof nextConfig.headers !== 'function') {
      throw new Error('nextConfig.headers is not a function');
    }
    const headersList = await nextConfig.headers();
    const globalHeaderRule = headersList.find((h: any) => h.source === '/(.*)');

    if (!globalHeaderRule || !globalHeaderRule.headers.some((h: any) => h.key === 'X-Frame-Options')) {
      throw new Error('X-Frame-Options missing from security headers');
    }

    console.log('✅ [TEST 4/4] Production HTTP Security Headers: PASSED');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4/4] Security Headers: FAILED:', err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 Kết quả Phase 5: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase5Verification();
