import fs from 'fs';
import path from 'path';
import { extractUrlFromText, isShopeeUrl, parseShopeeInput, sanitizeShopeeUrl, extractShopeeIds } from '../lib/shopee/parser';
import { generateStatelessProductSlug, decodeStatelessProductSlug, buildShopeeDeepLinks } from '../lib/shopee/voucher-shim';
import { getCurrentShopeeSlot, getDynamicSocialProofCount } from '../lib/marketing/time-slots';
import { getRandomSocialProofEvent } from '../lib/marketing/social-proof';

// Nạp biến môi trường nếu có
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

async function runComprehensiveEdgeCaseTests() {
  console.log('================================================================');
  console.log('🧪 SHOPEELINK PRO - COMPREHENSIVE USER EDGE-CASE TEST SUITE');
  console.log(`🎯 Target Host: ${BASE_URL}`);
  console.log(`🔑 Affiliate ID: ${EXPECTED_AFFILIATE_ID}`);
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: unknown, msg: string) {
    total++;
    if (!condition) {
      console.error(`❌ [FAIL] ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    } else {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    }
  }

  // ====================================================================
  // PHẦN 1: KIỂM THỬ ĐỘNG CƠ BÓC TÁCH & CHUẨN HÓA ĐẦU VÀO (LOCAL LOGIC)
  // ====================================================================
  console.log('--- PHẦN 1: Kiểm Thử Input Bất Thường & Bóc Tách URL ---');

  // Test 1: Chuỗi rỗng
  const emptyRes = await parseShopeeInput('');
  assert(!emptyRes.isValid && emptyRes.error?.includes('Không tìm thấy'), 'Chuỗi rỗng "" được từ chối an toàn');

  // Test 2: Khoảng trắng và ký tự xuống dòng
  const whitespaceRes = await parseShopeeInput('   \n\t  \r  ');
  assert(!whitespaceRes.isValid, 'Khoảng trắng thuần túy được từ chối an toàn');

  // Test 3: Văn bản không chứa bất kỳ URL nào
  const noUrlRes = await parseShopeeInput('xin chao ban minh muon mua ao khoac nay gia re nhe');
  assert(!noUrlRes.isValid, 'Văn bản không có link được từ chối an toàn');

  // Test 4: Link không thuộc Shopee (Google)
  const googleRes = await parseShopeeInput('https://google.com/search?q=shopee');
  assert(!googleRes.isValid && googleRes.error?.includes('không thuộc hệ thống Shopee'), 'Link Google bị từ chối chính xác');

  // Test 5: Link sàn thương mại điện tử khác (Lazada)
  const lazadaRes = await parseShopeeInput('https://lazada.vn/products/ao-khoac-nam-i123456.html');
  assert(!lazadaRes.isValid && lazadaRes.error?.includes('không thuộc hệ thống Shopee'), 'Link Lazada bị từ chối chính xác');

  // Test 6: XSS Injection trong input
  const xssRes = await parseShopeeInput('<script>alert("hack")</script>');
  assert(!xssRes.isValid, 'Payload XSS <script> bị chặn an toàn');

  // Test 7: Javascript pseudo-protocol
  const jsRes = await parseShopeeInput('javascript:alert(document.cookie)');
  assert(!jsRes.isValid, 'javascript: URI bị từ chối an toàn');

  // Test 8: Văn bản hỗn hợp có Emoji và lời nhắn tiếng Việt
  const mixedRes = await parseShopeeInput('🔥 Mọi người ơi mua hộ em cái này nhé https://shopee.vn/product/10928312/22819283712 🎉 rẻ lắm');
  assert(mixedRes.isValid, 'Văn bản hỗn hợp kèm Emoji được bóc tách link thành công');
  assert(mixedRes.cleanUrl === 'https://shopee.vn/product/10928312/22819283712', 'Clean URL bóc tách sạch sẽ từ văn bản hỗn hợp');

  // Test 9: Link dính dấu chấm ở đuôi (thường gặp khi copy từ chat Zalo/Messenger)
  const dotRes = await parseShopeeInput('Xem link này nè: https://shopee.vn/product/10928312/22819283712?sp_atk=123.');
  assert(dotRes.isValid && dotRes.itemId === '22819283712', 'Link dính dấu chấm ở đuôi được xử lý sạch sẽ');

  // Test 10: Link dính ngoặc đơn "(https://shopee.vn/...)"
  const parenUrl = extractUrlFromText('Vào đây xem thử nhé (https://shopee.vn/product/10928312/22819283712) hay lắm');
  assert(parenUrl === 'https://shopee.vn/product/10928312/22819283712', 'Link bọc trong ngoặc đơn được trích xuất chính xác');

  // Test 11: Link dán nhiều dòng (Multiline)
  const multilineUrl = extractUrlFromText('Tiêu đề sản phẩm hot\nhttps://shopee.vn/product/10928312/22819283712\nReview tốt lắm');
  assert(multilineUrl === 'https://shopee.vn/product/10928312/22819283712', 'Link ở dòng thứ 2 trong multiline text được trích xuất thành công');

  // ====================================================================
  // PHẦN 2: LÀM SẠCH LINK & BẢO TOÀN ATTRIBUTION ĐỐI THỦ
  // ====================================================================
  console.log('\n--- PHẦN 2: Kiểm Thử Lọc Tracking Đối Thủ & Khôi Phục ID ---');

  // Test 12: Lọc mmp_pid của affiliate khác
  const dirtyUrl = 'https://shopee.vn/product/10928312/22819283712?mmp_pid=rival_affiliate&utm_source=facebook&aff_click_id=rival_123&sp_atk=81283&xptdk=91283';
  const sanitized = sanitizeShopeeUrl(dirtyUrl);
  assert(sanitized === 'https://shopee.vn/product/10928312/22819283712', 'Lọc sạch toàn bộ tracking rác của đối thủ (mmp_pid, utm_source, aff_click_id, sp_atk)');

  // Test 13: Bóc tách ID định dạng Slug chuẩn Shopee (-i.{shopId}.{itemId})
  const slugIds = extractShopeeIds('https://shopee.vn/Ao-Thun-Nam-Cotton-Co-Gian-i.987654.345678?sp_atk=123');
  assert(slugIds.shopId === '987654' && slugIds.itemId === '345678', 'Bóc tách chính xác shopId và itemId từ slug URL -i.{shopId}.{itemId}');

  // Test 14: Bóc tách ID định dạng Universal Link (/universal-link/product/{shopId}/{itemId})
  const universalIds = extractShopeeIds('https://shopee.vn/universal-link/product/111222/333444');
  assert(universalIds.shopId === '111222' && universalIds.itemId === '333444', 'Bóc tách chính xác từ Universal Link Shopee Mall');

  // Test 15: Stateless Slug Base36 Deterministic Encoding & Decoding
  const testShopId = '10928312';
  const testItemId = '22819283712';
  const statelessSlug = generateStatelessProductSlug(testShopId, testItemId);
  const decoded = decodeStatelessProductSlug(statelessSlug);
  assert(decoded !== null, 'Tạo và giải mã thành công Stateless Slug');
  assert(decoded?.shopId === testShopId && decoded?.itemId === testItemId, 'Khôi phục 100% nguyên vẹn shopId và itemId sau khi giải mã Base36');

  // Test 16: Stateless Slug an toàn với ký tự rác
  const badSlugDecode = decodeStatelessProductSlug('p!@#$_invalid');
  assert(badSlugDecode === null, 'Stateless Slug chứa ký tự lỗi được xử lý an toàn (trả về null, không crash)');

  // Test 17: Deep link & Android Intent giữ nguyên short link affiliate (không custom scheme, không nối tham số)
  const sampleShortLink = 'https://s.shopee.vn/AbC123xyz';
  const deepLinks = buildShopeeDeepLinks(sampleShortLink);
  assert(deepLinks.deepLink === sampleShortLink, 'Deep link chính là short link s.shopee.vn (Universal Link)');
  assert(deepLinks.androidIntent.startsWith('intent://s.shopee.vn/AbC123xyz#Intent;scheme=https;package=com.shopee.vn;'), 'Android Intent bọc nguyên short link');
  assert(!JSON.stringify(deepLinks).includes('shopee://') && !JSON.stringify(deepLinks).includes('meta_collab'), 'Không còn custom scheme / tham số Meta làm mất attribution');

  // ====================================================================
  // PHẦN 3: MARKETING ENGINE & LOGIC THỜI GIAN THỰC
  // ====================================================================
  console.log('\n--- PHẦN 3: Kiểm Thử Marketing Engine & Thời Gian Thực ---');

  // Test 18: 6 Khung Giờ Shopee Việt Nam (UTC+7)
  const currentSlotInfo = getCurrentShopeeSlot();
  assert(!!currentSlotInfo.slot, 'Xác định thành công phiên săn sale hiện tại');
  assert(currentSlotInfo.secondsRemaining > 0 && currentSlotInfo.secondsRemaining <= 9 * 3600, 'Số giây đếm ngược hợp lệ trong phạm vi khung giờ');
  assert(/^\d{2}:\d{2}:\d{2}$/.test(currentSlotInfo.formattedRemaining), 'Format đếm ngược chuẩn kỹ thuật số HH:MM:SS');

  // Test 19: Bộ đếm người dùng động biến thiên theo giờ
  const dynamicCount = getDynamicSocialProofCount();
  assert(dynamicCount >= 400 && dynamicCount <= 3500, `Số người săn sale động nằm trong ngưỡng sinh học hợp lý (${dynamicCount})`);

  // Test 20: Sinh sự kiện chốt đơn ngẫu nhiên
  const sampleEvent = getRandomSocialProofEvent();
  assert(/^\d{3}\*\*\*\d{2}$/.test(sampleEvent.phoneMasked), `Mặt nạ số điện thoại chuẩn format (${sampleEvent.phoneMasked})`);
  assert(sampleEvent.savedAmount.endsWith('đ'), `Số tiền tiết kiệm kết thúc bằng đ (${sampleEvent.savedAmount})`);

  // ====================================================================
  // PHẦN 4: KIỂM THỬ TRỰC TIẾP TRÊN MÁY CHỦ PRODUCTION LIVE
  // ====================================================================
  console.log('\n--- PHẦN 4: Kiểm Thử Trực Tiếp Trên Máy Chủ Live Production ---');

  // Test 21: POST /api/convert với body rỗng
  const emptyPostRes = await fetch(`${BASE_URL}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: '' }),
  });
  assert(emptyPostRes.status === 400, 'Live API /api/convert từ chối URL rỗng với HTTP 400');
  const emptyPostJson = await emptyPostRes.json();
  assert(emptyPostJson.success === false, 'Phản hồi success: false cho input rỗng');

  // Test 22: POST /api/convert với link Google (non-Shopee)
  const nonShopeePostRes = await fetch(`${BASE_URL}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://google.com' }),
  });
  assert(nonShopeePostRes.status === 400, 'Live API từ chối link không thuộc Shopee với HTTP 400');
  const nonShopeeJson = await nonShopeePostRes.json();
  assert(nonShopeeJson.message.includes('không thuộc hệ thống Shopee'), 'Thông báo lỗi chỉ rõ link không thuộc Shopee');

  // Test 23: POST /api/convert với XSS payload
  const xssPostRes = await fetch(`${BASE_URL}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: '<script>alert("xss")</script>' }),
  });
  assert(xssPostRes.status === 400, 'Live API chặn an toàn payload XSS');

  // Test 24: POST /api/convert với Malformed JSON body
  const malformedPostRes = await fetch(`${BASE_URL}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid-non-json-string',
  });
  assert(malformedPostRes.status === 400, 'Live API xử lý an toàn request không phải JSON (HTTP 400, không crash 500)');

  // Test 25: POST /api/convert với URL Shopee hợp lệ
  const validPostRes = await fetch(`${BASE_URL}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://shopee.vn/product/10928312/22819283712' }),
  });
  assert(validPostRes.status === 200, 'Live API chuyển đổi thành công link Shopee hợp lệ (HTTP 200)');
  const validJson = await validPostRes.json();
  assert(validJson.success === true && !!validJson.data?.slug, 'Nhận payload dữ liệu đầy đủ kèm mã slug');
  const isOfficialShort = new URL(validJson.data.affiliateUrl).hostname === 's.shopee.vn';
  const isDirectFallback = validJson.data.affiliateUrl.includes(EXPECTED_AFFILIATE_ID);
  assert(isOfficialShort || isDirectFallback, 'Link affiliate là short link chính thức s.shopee.vn hoặc direct tracking link gắn đúng affiliate ID');
  assert(validJson.data.androidIntent.includes(validJson.data.affiliateUrl.replace(/^https:\/\//, '')), 'Android Intent bọc nguyên link affiliate');

  const generatedSlug = validJson.data.slug;

  // Test 26: POST /api/convert với văn bản kèm lời nhắn tiếng Việt
  const mixedTextPostRes = await fetch(`${BASE_URL}/api/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'Alo mua cái này gấp giúp tớ nhé https://shopee.vn/product/10928312/22819283712 giá đang sale' }),
  });
  assert(mixedTextPostRes.status === 200, 'Live API tự động bóc tách và convert thành công từ tin nhắn tự nhiên');

  // ====================================================================
  // PHẦN 5: KIỂM THỬ BRIDGE PAGE & STATELESS RECOVERY TRÊN LIVE DOMAIN
  // ====================================================================
  console.log('\n--- PHẦN 5: Kiểm Thử Bridge Page (/go/[slug]) & Stateless Recovery ---');

  // Test 27: Truy cập /go/[slug] hợp lệ vừa sinh
  const bridgeRes = await fetch(`${BASE_URL}/go/${generatedSlug}`);
  assert(bridgeRes.status === 200, `Truy cập Bridge Page /go/${generatedSlug} thành công (HTTP 200)`);
  const bridgeHtml = await bridgeRes.text();
  assert(bridgeHtml.includes('Đang chuyển hướng tới Shopee'), 'HTML chứa giao diện Bridge Page');
  assert(bridgeHtml.includes(validJson.data.affiliateUrl), 'Bridge Page HTML chuyển tiếp tới đúng short link affiliate');

  // Test 28: Truy cập /go/slug_khong_ton_tai
  const invalidSlugRes = await fetch(`${BASE_URL}/go/non_existent_slug_test_12345`);
  assert(invalidSlugRes.status === 404, 'Slug không tồn tại trả về HTTP 404 thân thiện');
  const invalidSlugHtml = await invalidSlugRes.text();
  assert(invalidSlugHtml.includes('Liên kết đã hết hạn'), 'HTML 404 thông báo link đã hết hạn thân thiện');
  assert(invalidSlugHtml.includes('TẠO MÃ GIẢM GIÁ MỚI'), 'HTML 404 có nút CTA dẫn về trang chủ tạo mã mới');

  // Test 29: Truy cập Stateless Self-Healing Slug (mô phỏng cache miss trên serverless)
  const statelessTestSlug = generateStatelessProductSlug('10928312', '22819283712');
  const statelessRes = await fetch(`${BASE_URL}/go/${statelessTestSlug}`);
  assert(statelessRes.status === 200, `Stateless Slug /go/${statelessTestSlug} tự phục hồi thành công (HTTP 200, KHÔNG BỊ 404!)`);
  const statelessHtml = await statelessRes.text();
  assert(statelessHtml.includes('https://s.shopee.vn/') || statelessHtml.includes(EXPECTED_AFFILIATE_ID), 'Slug sản phẩm thế hệ cũ được tự phục hồi thành công');

  // ====================================================================
  // PHẦN 6: KIỂM THỬ PWA & WEB SHARE TARGET
  // ====================================================================
  console.log('\n--- PHẦN 6: Kiểm Thử PWA & Web Share Target ---');

  // Test 30: Manifest PWA
  const manifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`);
  assert(manifestRes.status === 200, 'Endpoint /manifest.webmanifest phản hồi HTTP 200');
  const manifestJson = await manifestRes.json();
  assert(manifestJson.short_name === 'ShopeeLink', 'Manifest có short_name ShopeeLink');
  assert(!!manifestJson.share_target, 'Manifest khai báo chuẩn Web Share Target API');
  assert(manifestJson.share_target.params.url === 'url', 'Share target params ánh xạ đúng tham số url');

  // Test 31: Service Worker PWA
  const swRes = await fetch(`${BASE_URL}/sw.js`);
  assert(swRes.status === 200, 'Endpoint /sw.js phản hồi HTTP 200');
  const swContent = await swRes.text();
  assert(swContent.includes('CACHE_NAME'), 'Service Worker hợp lệ và sẵn sàng offline caching');

  // Test 32: SVG Icon PWA
  const iconRes = await fetch(`${BASE_URL}/icon.svg`);
  assert(iconRes.status === 200, 'Endpoint /icon.svg phản hồi HTTP 200');
  const iconContent = await iconRes.text();
  assert(iconContent.includes('<svg') && iconContent.includes('linearGradient'), 'Icon SVG hợp lệ và sắc nét');

  // Test 33: Web Share Target Query trên Trang Chủ (?url=...)
  const shareTargetUrlRes = await fetch(`${BASE_URL}/?url=https%3A%2F%2Fshopee.vn%2Fproduct%2F10928312%2F22819283712`);
  assert(shareTargetUrlRes.status === 200, 'Trang chủ phản hồi HTTP 200 khi nhận tham số ?url= từ Share Target');

  // Test 34: Web Share Target Query dạng Text (?text=...)
  const shareTargetTextRes = await fetch(`${BASE_URL}/?text=Check%20mon%20nay%20nhe%20https%3A%2F%2Fs.shopee.vn%2Fxyz`);
  assert(shareTargetTextRes.status === 200, 'Trang chủ phản hồi HTTP 200 khi nhận tham số ?text= từ Share Target');

  // ====================================================================
  // PHẦN 7: BẢO MẬT HỆ THỐNG & CRON PROTECTION
  // ====================================================================
  console.log('\n--- PHẦN 7: Kiểm Thử Bảo Mật & ToS Disclaimer ---');

  // Test 35: Cron Endpoint không có Bearer token
  const unauthorizedCronRes = await fetch(`${BASE_URL}/api/sync-reports`);
  assert(unauthorizedCronRes.status === 503 || unauthorizedCronRes.status === 401, 'Chặn truy cập trái phép vào cron job báo cáo doanh thu');

  // Test 36: Kiểm tra Disclaimer ToS Shopee trên Homepage
  const homeRes = await fetch(`${BASE_URL}/`);
  assert(homeRes.status === 200, 'Trang chủ phản hồi HTTP 200');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('Ưu đãi đối tác 25%') || homeHtml.includes('ngân sách khuyến mãi'), 'Trang chủ chứa đầy đủ Disclaimer ToS Shopee minh bạch');

  console.log('\n================================================================');
  console.log(`📊 TỔNG KẾT EDGE-CASE SUITE: ${passed}/${total} assertions PASSED`);
  console.log('🎉 HỆ THỐNG BẢO ĐẢM VỮNG CHẮC TRƯỚC MỌI TÌNH HUỐNG THAO TÁC NGƯỜI DÙNG!');
  console.log('================================================================\n');
}

runComprehensiveEdgeCaseTests().catch((err) => {
  console.error('\n💥 Edge-case verification failed:', err);
  process.exit(1);
});
