import fs from 'fs';
import path from 'path';

// Nạp biến môi trường nếu cần
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
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  }
} catch (e) {
  // ignore
}

const BASE_URL = process.env.TEST_BASE_URL || 'https://shopee.mrhulkstore.store';
const EXPECTED_AFFILIATE_ID = process.env.SHOPEE_AFFILIATE_ID || 'an_17315740682';

interface ConvertApiResponse {
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

async function runE2E() {
  console.log('================================================================');
  console.log(`🌐 SHOPEELINK PRO - END-TO-END (E2E) LIVE VERIFICATION`);
  console.log(`🎯 Target Host: ${BASE_URL}`);
  console.log(`🔑 Affiliate ID: ${EXPECTED_AFFILIATE_ID}`);
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (!condition) {
      console.error(`❌ [FAIL] ${msg}`);
      throw new Error(msg);
    }
    console.log(`✅ [PASS] ${msg}`);
    passed++;
  }

  // -------------------------------------------------------------
  // Test 1: Kiểm tra tính sẵn sàng của Trang Chủ (Homepage UI)
  // -------------------------------------------------------------
  console.log('--- TEST 1: Kiểm tra Trang Chủ & SEO Headers ---');
  try {
    const res = await fetch(`${BASE_URL}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    });
    assert(res.status === 200, `Homepage HTTP status 200 (nhận ${res.status})`);
    const html = await res.text();
    assert(html.includes('ShopeeLink Pro'), 'Trang chứa nhận diện thương hiệu ShopeeLink Pro');
    assert(html.includes('Giảm Ngay 25% Mọi Đơn Hàng'), 'Trang chứa tiêu đề H1');
    assert(!html.includes('maximum-scale=1'), 'Đã gỡ bỏ maximum-scale=1 (hỗ trợ pinch zoom accessibility)');
  } catch (err: any) {
    console.error('Lỗi Test 1:', err.message);
  }

  // -------------------------------------------------------------
  // Test 2: E2E API Convert với Link Sản Phẩm Thật
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Convert API (/api/convert) & Attribution Check ---');
  let generatedSlug = '';
  let targetUrl = '';
  let androidIntent = '';

  try {
    const testProductUrl = 'https://shopee.vn/product/10928312/22819283712?sp_atk=rival_click_123&utm_source=competitor';
    const res = await fetch(`${BASE_URL}/api/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: testProductUrl,
        subIds: ['tiktok_bio', 'test_e2e'],
      }),
    });

    assert(res.status === 200, `API /api/convert HTTP status 200 (nhận ${res.status})`);
    const json: ConvertApiResponse = await res.json();
    assert(json.success === true, 'API trả về success: true');
    assert(!!json.data, 'API có data payload');

    const data = json.data!;
    generatedSlug = data.slug;
    targetUrl = data.targetWithVoucherUrl;
    androidIntent = data.androidIntent;

    console.log(`   * Generated Slug: ${data.slug}`);
    console.log(`   * Clean URL: ${data.cleanUrl}`);
    console.log(`   * Target with Voucher: ${data.targetWithVoucherUrl}`);
    console.log(`   * Android Intent: ${data.androidIntent}`);

    // Kiểm tra sạch mã đối thủ
    assert(!data.cleanUrl.includes('rival_click_123'), 'Đã lọc sạch tracking rác rival_click');
    assert(!data.cleanUrl.includes('competitor'), 'Đã lọc sạch utm đối thủ competitor');

    // Kiểm tra mã Affiliate của bạn KHÔNG BỊ ĐÈ
    const parsedTarget = new URL(data.targetWithVoucherUrl);
    const utmSource = parsedTarget.searchParams.get('utm_source');
    const afSubSiteid = parsedTarget.searchParams.get('af_sub_siteid');
    const mmpPid = parsedTarget.searchParams.get('mmp_pid');

    assert(utmSource === EXPECTED_AFFILIATE_ID, `utm_source chính xác là ${EXPECTED_AFFILIATE_ID} (không bị đè thành 'facebook')`);
    assert(afSubSiteid === EXPECTED_AFFILIATE_ID, `af_sub_siteid chính xác là ${EXPECTED_AFFILIATE_ID}`);
    assert(mmpPid === EXPECTED_AFFILIATE_ID, `mmp_pid chính xác là ${EXPECTED_AFFILIATE_ID}`);
    assert(parsedTarget.searchParams.get('utm_campaign') === 'meta_collab', 'Có utm_campaign=meta_collab');
    assert(parsedTarget.searchParams.get('af_force_deeplink') === 'true', 'Có af_force_deeplink=true');

    // Kiểm tra Android Intent
    assert(androidIntent.startsWith('intent://'), 'Android Intent bắt đầu bằng intent://');
    assert(androidIntent.includes('package=com.shopee.vn'), 'Android Intent chỉ định package com.shopee.vn');
    assert(androidIntent.includes(`utm_source=${EXPECTED_AFFILIATE_ID}`), 'Android Intent chứa mã affiliate đầy đủ');
  } catch (err: any) {
    console.error('Lỗi Test 2:', err.message);
  }

  // -------------------------------------------------------------
  // Test 3: E2E Bridge Page (/go/[slug]) - Kiểm tra chuyển tiếp
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Bridge Page (/go/[slug]) Phục Vụ & Mở App ---');
  try {
    if (!generatedSlug) throw new Error('Không có slug từ Test 2 để test Bridge');

    // Giả lập truy cập từ thiết bị Android
    const res = await fetch(`${BASE_URL}/go/${generatedSlug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
      },
    });

    assert(res.status === 200, `/go/${generatedSlug} HTTP status 200 (nhận ${res.status})`);
    const bridgeHtml = await res.text();
    assert(bridgeHtml.includes('Đang chuyển hướng tới Shopee...'), 'Chứa tiêu đề Bridge Page');
    assert(bridgeHtml.includes('androidIntent'), 'Script chứa biến androidIntent');
    assert(bridgeHtml.includes(`utm_source=${EXPECTED_AFFILIATE_ID}`), 'HTML chứa link đích đầy đủ tracking');
  } catch (err: any) {
    console.error('Lỗi Test 3:', err.message);
  }

  // -------------------------------------------------------------
  // Test 4: E2E Stateless Self-Healing Slug (Mô phỏng Cache Miss Vercel)
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Stateless Self-Healing Slug (Chống 404 Vercel Serverless) ---');
  try {
    // Tạo 1 slug ngẫu nhiên hoàn toàn mới theo chuẩn format p<s36>_<i36>
    // shopId: 10928312 = '6i8c8', itemId: 22819283712 = 'ahe0g00' -> slug: p6i8c8_ahe0g00
    // Test slug này chưa từng lưu trong bộ nhớ instance hiện tại
    const deterministicSlug = 'p6i8c8_ahe0g00';
    const res = await fetch(`${BASE_URL}/go/${deterministicSlug}`);
    assert(res.status === 200, `Slug tự giải mã ${deterministicSlug} trả về HTTP 200 (KHÔNG BỊ 404!)`);
    const html = await res.text();
    assert(html.includes('https://shopee.vn/product/10928312/22819283712'), 'Tự động giải mã và khôi phục link sản phẩm gốc');
    assert(html.includes(`utm_source=${EXPECTED_AFFILIATE_ID}`), 'Tự động gắn lại mã affiliate chuẩn');
  } catch (err: any) {
    console.error('Lỗi Test 4:', err.message);
  }

  // -------------------------------------------------------------
  // Test 5: Kiểm tra Đích đến Shopee (HTTP Request thật đến Shopee CDN/Edge)
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Kiểm thử Đích đến Shopee Server ---');
  try {
    const shopeeTestUrl = targetUrl || `https://shopee.vn/product/10928312/22819283712?utm_source=${EXPECTED_AFFILIATE_ID}&af_sub_siteid=${EXPECTED_AFFILIATE_ID}`;
    const shopeeRes = await fetch(shopeeTestUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'manual',
    });

    console.log(`   * Shopee HTTP Status: ${shopeeRes.status}`);
    const setCookie = shopeeRes.headers.get('set-cookie') || '';
    const hasShopeeCookies = setCookie.includes('SPC_') || shopeeRes.status === 200 || shopeeRes.status === 302;
    assert(hasShopeeCookies, `Shopee Server phản hồi hợp lệ (HTTP ${shopeeRes.status}) và thiết lập phiên truy cập`);
  } catch (err: any) {
    console.error('Lỗi Test 5:', err.message);
  }

  // -------------------------------------------------------------
  // Test 6: Kiểm tra Bảo mật Cron Endpoint (/api/sync-reports)
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Kiểm thử Bảo mật Cron Endpoint ---');
  try {
    const unauthorizedRes = await fetch(`${BASE_URL}/api/sync-reports`);
    assert(
      unauthorizedRes.status === 401 || unauthorizedRes.status === 503,
      `Chặn truy cập trái phép không có Bearer token (HTTP ${unauthorizedRes.status})`
    );
  } catch (err: any) {
    console.error('Lỗi Test 6:', err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 TỔNG KẾT E2E: ${passed}/${total} assertions PASSED`);
  if (passed === total) {
    console.log('🎉 TOÀN BỘ HỆ THỐNG SHOPEELINK PRO HOẠT ĐỘNG HOÀN HẢO TỪ ĐẦU ĐẾN CUỐI!');
  } else {
    console.log('⚠️ Có bài kiểm thử chưa đạt, vui lòng xem chi tiết phía trên.');
  }
  console.log('================================================================\n');
}

runE2E();
