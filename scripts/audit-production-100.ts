import { buildShopeeDeepLinks, generateStatelessProductSlug, decodeStatelessProductSlug } from '../lib/shopee/voucher-shim';

async function runProduction100Audit() {
  console.log('================================================================');
  console.log('🔍 SHOPEE AFFILIATE PRO - 100% PRODUCTION COMPREHENSIVE AUDIT');
  console.log('🎯 Target Domain: https://shopee.mrhulkstore.store');
  console.log('🎯 Vercel Mirror: https://shopeelink-pr-git-main-hulkbeoti-3158s-projects.vercel.app');
  console.log('🔑 Affiliate ID: an_17315740682');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean, extra = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra ? `(${extra})` : ''}`);
    }
  }

  // --- TRỤ CỘT 1: HẠ TẦNG & TÊN MIỀN LIVE ---
  console.log('--- TRỤ CỘT 1: HẠ TẦNG & TÊN MIỀN LIVE ---');
  try {
    const t0 = Date.now();
    const resMain = await fetch('https://shopee.mrhulkstore.store/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const ttfbMain = Date.now() - t0;
    assert('Domain chính HTTP 200', resMain.status === 200, `Status: ${resMain.status}`);
    assert('Domain chính phản hồi nhanh', ttfbMain < 2000, `TTFB: ${ttfbMain}ms`);
    
    const htmlMain = await resMain.text();
    assert('HTML chứa Brand Name ShopeeLink Pro', htmlMain.includes('ShopeeLink Pro'));
    assert('HTML chứa tiêu đề H1 Tối Ưu', htmlMain.includes('<h1'));
    assert('HTML có viewport chuẩn responsive', htmlMain.includes('name="viewport"'));
  } catch (err: any) {
    assert('Kết nối Domain chính thành công', false, err.message);
  }

  try {
    const resMirror = await fetch('https://shopeelink-pr-git-main-hulkbeoti-3158s-projects.vercel.app/');
    assert('Vercel Mirror HTTP 200', resMirror.status === 200, `Status: ${resMirror.status}`);
  } catch (err: any) {
    assert('Kết nối Vercel Mirror thành công', false, err.message);
  }

  // --- TRỤ CỘT 2: PIPELINE CONVERT VỚI 5 ĐỊNH DẠNG LINK THỰC TẾ ---
  console.log('\n--- TRỤ CỘT 2: PIPELINE CONVERT VỚI 5 ĐỊNH DẠNG LINK THỰC TẾ ---');
  
  // Case 1: Shortlink hết hạn / không tồn tại -> Hệ thống bắt lỗi an toàn (Graceful Error Handling)
  try {
    const res1 = await fetch('https://shopee.mrhulkstore.store/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://s.shopee.vn/fake_nonexistent_link' })
    });
    const data1 = await res1.json();
    assert('Case 1: Shortlink hết hạn/không tồn tại trả về HTTP 400', res1.status === 400);
    assert('Case 1: Trả về thông báo lỗi chuẩn xác', data1.message?.includes('không tồn tại hoặc đã hết hạn') || data1.success === false);
  } catch (err: any) {
    assert('Case 1: Xử lý an toàn shortlink lỗi', false, err.message);
  }

  // Case 2: Link Shopee chuẩn định dạng /product/{shopId}/{itemId}
  try {
    const res2 = await fetch('https://shopee.mrhulkstore.store/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://shopee.vn/product/10928312/22819283712' })
    });
    const data2 = await res2.json();
    assert('Case 2: Link sản phẩm chuẩn trả về HTTP 200', res2.status === 200);
    assert('Case 2: success: true', data2.success === true);
    assert('Case 2: Link affiliate là short link chính thức s.shopee.vn hoặc link direct gắn đúng partner', data2.data?.affiliateUrl?.startsWith('https://s.shopee.vn/') || data2.data?.affiliateUrl?.includes('an_17315740682'));
    assert('Case 2: Link đích giữ nguyên short link', data2.data?.targetWithVoucherUrl === data2.data?.affiliateUrl);
    assert('Case 2: Có slug hợp lệ', !!data2.data?.slug);
  } catch (err: any) {
    assert('Case 2: Chuyển đổi link sản phẩm chuẩn thành công', false, err.message);
  }

  // Case 3: Link Shopee Mall dài chuẩn kèm tracking rác
  try {
    const dirtyUrl = 'https://shopee.vn/Ao-Thun-Cotton-Nam-Nu-i.12345678.987654321?sp_atk=rival_123&utm_source=competitor&mmp_pid=bad_aff';
    const res3 = await fetch('https://shopee.mrhulkstore.store/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: dirtyUrl })
    });
    const data3 = await res3.json();
    assert('Case 3: Link Mall dài trả về HTTP 200', res3.status === 200);
    assert('Case 3: Lọc sạch tracking đối thủ khỏi link gốc', !data3.data?.cleanUrl?.includes('rival_123') && !data3.data?.cleanUrl?.includes('bad_aff'));
    assert('Case 3: Link affiliate là short link chính thức s.shopee.vn hoặc link direct gắn đúng partner', data3.data?.affiliateUrl?.startsWith('https://s.shopee.vn/') || data3.data?.affiliateUrl?.includes('an_17315740682'));
  } catch (err: any) {
    assert('Case 3: Link Mall dài xử lý thành công', false, err.message);
  }

  // Case 4: Tin nhắn chứa text + emoji + link
  try {
    const chatMsg = 'Mọi người ơi mua áo này nè đẹp lắm 😍 https://shopee.vn/product/10928312/22819283712 shop đang sale 50% đó nhanh tay!';
    const res4 = await fetch('https://shopee.mrhulkstore.store/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: chatMsg })
    });
    const data4 = await res4.json();
    assert('Case 4: Tin nhắn hỗn hợp văn bản & Emoji trả về HTTP 200', res4.status === 200);
    assert('Case 4: Bóc tách chính xác URL mục tiêu', data4.data?.cleanUrl?.includes('10928312'));
  } catch (err: any) {
    assert('Case 4: Tin nhắn hỗn hợp xử lý thành công', false, err.message);
  }

  // Case 5: Link ngoài không thuộc Shopee (bảo vệ hệ thống)
  try {
    const res5 = await fetch('https://shopee.mrhulkstore.store/api/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.lazada.vn/products/ao-thun-i123456.html' })
    });
    const data5 = await res5.json();
    assert('Case 5: Link ngoài Shopee bị từ chối với HTTP 400', res5.status === 400);
    assert('Case 5: success: false cho link không hợp lệ', data5.success === false);
  } catch (err: any) {
    assert('Case 5: Link ngoài được xử lý đúng', false, err.message);
  }

  // --- TRỤ CỘT 3: ATTRIBUTION & DEEP LINK CẤU TRÚC ---
  console.log('\n--- TRỤ CỘT 3: TÍNH CHÍNH XÁC ATTRIBUTION & DEEPLINK ---');
  try {
    // Chỉ short link chính thức s.shopee.vn mới được Shopee ghi nhận click/hoa hồng
    const shortLink = 'https://s.shopee.vn/AbC123xyz';
    const links = buildShopeeDeepLinks(shortLink);
    assert('Deep link chính là short link s.shopee.vn', links.deepLink === shortLink);
    assert('Android Intent bọc nguyên short link', links.androidIntent.startsWith('intent://s.shopee.vn/AbC123xyz#Intent;scheme=https;package=com.shopee.vn;'));
    assert('Không dùng custom scheme shopee://', !JSON.stringify(links).includes('shopee://'));
    assert('Không nối tham số Meta giả (meta_collab / l.facebook.com)', !JSON.stringify(links).includes('meta_collab') && !JSON.stringify(links).includes('l.facebook.com'));
  } catch (err: any) {
    assert('Attribution Deep Link thành công', false, err.message);
  }

  // --- TRỤ CỘT 4: STATELESS BRIDGE ROUTE (/go/[slug]) ---
  console.log('\n--- TRỤ CỘT 4: STATELESS BRIDGE ROUTE (/go/[slug]) ---');
  try {
    const testShopId = '10928312';
    const testItemId = '22819283712';
    const slug = generateStatelessProductSlug(testShopId, testItemId);
    assert('Sinh mã Stateless Slug Base36', slug.length > 0, `Slug: ${slug}`);
    
    const decoded = decodeStatelessProductSlug(slug);
    assert('Giải mã chính xác shopId 10928312', decoded?.shopId === testShopId);
    assert('Giải mã chính xác itemId 22819283712', decoded?.itemId === testItemId);

    // Test Live endpoint /go/[slug]
    const resBridge = await fetch(`https://shopee.mrhulkstore.store/go/${slug}`);
    assert('Live Bridge endpoint /go/[slug] HTTP 200', resBridge.status === 200);
    const bridgeHtml = await resBridge.text();
    assert('Bridge Page chứa Android Intent Package', bridgeHtml.includes('package=com.shopee.vn'));
    assert('Bridge Page chuyển tiếp tới link có tracking chính thức', bridgeHtml.includes('https://s.shopee.vn/') || bridgeHtml.includes('an_17315740682'));
  } catch (err: any) {
    assert('Kiểm thử Stateless Bridge Route thành công', false, err.message);
  }

  // --- TRỤ CỘT 5: UI/UX MOBILE VERIFICATION ---
  console.log('\n--- TRỤ CỘT 5: KIỂM TRA MÃ NGUỒN UI/UX MOBILE ---');
  try {
    const fs = await import('fs');
    const resultCardContent = fs.readFileSync('components/ResultCard.tsx', 'utf-8');
    const layoutContent = fs.readFileSync('app/layout.tsx', 'utf-8');
    const toastContent = fs.readFileSync('components/SocialProofToast.tsx', 'utf-8');

    // 1. Đã xóa bảng tính chưa?
    assert('ResultCard: Đã loại bỏ hoàn toàn bảng tính (Savings Calculator)', !resultCardContent.includes('Ước tính tiết kiệm') && !resultCardContent.includes('calcAmount'));
    
    // 2. CTA chính có nằm ngay đầu thẻ?
    assert('ResultCard: CTA Mở App Shopee hiển thị trực tiếp', resultCardContent.includes('Mở App Shopee') && resultCardContent.includes('bg-[#EE4D2D]'));

    // 3. Footer có ID app-footer và IntersectionObserver?
    assert('app/layout.tsx: Footer có ID app-footer', layoutContent.includes('id="app-footer"'));
    assert('ResultCard: Có IntersectionObserver ẩn sticky bar khi chạm footer', resultCardContent.includes('IntersectionObserver') && resultCardContent.includes('isFooterInView'));

    // 4. Safe area insets
    assert('app/layout.tsx: Có CSS safe-sticky-bottom và min-h-[100dvh]', layoutContent.includes('safe-sticky-bottom') && layoutContent.includes('min-h-[100dvh]'));

    // 5. Toast đặt ở top
    assert('SocialProofToast: Đặt ở đỉnh màn hình mobile (top-14)', toastContent.includes('top-14'));
  } catch (err: any) {
    assert('Kiểm tra UI/UX Mobile thành công', false, err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passed}/${total} assertions PASSED (${Math.round((passed / total) * 100)}%)`);
  if (passed === total) {
    console.log('🎉 XÁC NHẬN: TOÀN BỘ HỆ THỐNG ĐÃ HOẠT ĐỘNG CHUẨN XÁC 100%!');
  } else {
    console.log('⚠️ CÓ MỘT SỐ CHỈ TIÊU CHƯA ĐẠT, CẦN KIỂM TRA LẠI.');
  }
  console.log('================================================================');
}

runProduction100Audit().catch(console.error);
