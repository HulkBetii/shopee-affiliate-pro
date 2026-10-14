/**
 * Affiliate Attribution Verification (offline)
 * Shopee chỉ ghi nhận hoa hồng cho click đi qua server short link s.shopee.vn
 * (cấp uls_trackid + chữ ký gads_t_sig cho từng lượt bấm). Suite này đảm bảo hệ thống
 * KHÔNG BAO GIỜ phát ra link tự ghép / custom scheme làm mất attribution.
 * Kiểm thử thực tế với cookie thật: npm run test:real
 */
import { NextRequest } from 'next/server';
import { defaultSessionClient } from '../lib/shopee/session-client';
import { ShopeeClient, defaultShopeeClient } from '../lib/shopee/client';
import { cacheService } from '../lib/cache';
import { createVoucherShim, getVoucherShimBySlug, VoucherShimData } from '../lib/shopee/voucher-shim';
import { getRecentHistory } from '../lib/marketing/recent-history';
import { buildAffiliateTrackingUrl } from '../lib/shopee/tracking-builder';
import { POST as convertPost } from '../app/api/convert/route';

const OFFICIAL_SHORT_LINK = 'https://s.shopee.vn/AbC123xyz';

let passed = 0;
let failed = 0;

function assert(condition: unknown, message: string): void {
  if (condition) {
    passed++;
    console.log(`✅ ${message}`);
  } else {
    failed++;
    console.error(`❌ ${message}`);
  }
}

function hasAttributionBreakers(shim: VoucherShimData): boolean {
  const serialized = JSON.stringify(shim);
  return (
    serialized.includes('shopee://') ||
    serialized.includes('meta_collab') ||
    serialized.includes('l.facebook.com') ||
    serialized.includes('mmp_pid=')
  );
}

async function run(): Promise<void> {
  console.log('====================================================');
  console.log('🚀 ShopeeLink Pro - Affiliate Attribution Verification');
  console.log('====================================================\n');

  const originalIsAvailable = defaultSessionClient.isAvailable.bind(defaultSessionClient);
  const originalGenerate = defaultSessionClient.generateShortLink.bind(defaultSessionClient);

  // 1. Session cookie trả short link chính thức -> client trả nguyên short link
  defaultSessionClient.isAvailable = () => true;
  defaultSessionClient.generateShortLink = async () => OFFICIAL_SHORT_LINK;
  const client = new ShopeeClient({ mockMode: false, appId: '', secretKey: '' });
  const link = await client.generateShortLink('https://shopee.vn/product/123/456', ['tiktok_bio']);
  assert(link === OFFICIAL_SHORT_LINK, 'Client trả về đúng short link s.shopee.vn từ session cookie');

  // 2. Session cookie trả link không phải short link -> từ chối
  defaultSessionClient.generateShortLink = async () => 'https://shopee.vn/product/123/456?utm_source=an_1';
  let rejectedCode: unknown = null;
  try {
    await client.generateShortLink('https://shopee.vn/product/123/456');
  } catch (err: any) {
    rejectedCode = err?.code;
  }
  assert(rejectedCode === 'AFFILIATE_LINK_UNAVAILABLE', 'Link không phải s.shopee.vn từ session API bị từ chối');

  // 3. Cookie đã cấu hình nhưng lỗi -> báo lỗi, KHÔNG che bằng link mock (kể cả mock mode)
  defaultSessionClient.generateShortLink = async () => null;
  const mockClient = new ShopeeClient({ mockMode: true, appId: '', secretKey: '' });
  let mockMaskCode: unknown = null;
  try {
    await mockClient.generateShortLink('https://shopee.vn/product/123/456');
  } catch (err: any) {
    mockMaskCode = err?.code;
  }
  assert(mockMaskCode === 'AFFILIATE_LINK_UNAVAILABLE', 'Cookie lỗi không bị link mock che mất sự cố');

  // 4. Không cookie + không Open API key -> fail closed
  defaultSessionClient.isAvailable = () => false;
  let noCredCode: unknown = null;
  try {
    await client.generateShortLink('https://shopee.vn/product/123/456');
  } catch (err: any) {
    noCredCode = err?.code;
  }
  assert(noCredCode === 'AFFILIATE_LINK_UNAVAILABLE', 'Thiếu cookie & Open API key -> AFFILIATE_LINK_UNAVAILABLE');

  // 5. Shim giữ nguyên short link ở mọi đường mở App
  const shim = await createVoucherShim({
    originalUrl: 'https://shopee.vn/product/123/456',
    cleanUrl: 'https://shopee.vn/product/123/456',
    affiliateUrl: OFFICIAL_SHORT_LINK,
    itemId: '456',
    shopId: '123',
  });
  assert(shim.targetWithVoucherUrl === OFFICIAL_SHORT_LINK, 'targetWithVoucherUrl = short link nguyên bản');
  assert(shim.deepLink === OFFICIAL_SHORT_LINK, 'deepLink = short link (Universal Link)');
  assert(shim.androidIntent.startsWith('intent://s.shopee.vn/AbC123xyz#Intent;scheme=https;package=com.shopee.vn;'), 'Android Intent bọc nguyên short link');
  assert(!hasAttributionBreakers(shim), 'Không có shopee:// / meta_collab / l.facebook.com / tham số tự ghép');
  assert(shim.slug === 'sAbC123xyz', 'Slug mang mã short link (s<code>)');

  // 6. Cache miss -> slug s<code> tự phục hồi đúng short link
  await cacheService.delete(`shopee:shim:${shim.slug}`);
  const recovered = await getVoucherShimBySlug(shim.slug);
  assert(recovered?.affiliateUrl === OFFICIAL_SHORT_LINK && recovered?.deepLink === OFFICIAL_SHORT_LINK, 'Cache miss: /go/sAbC123xyz khôi phục đúng short link');
  assert((await getVoucherShimBySlug('s<script>')) === null, 'Slug s<code> không hợp lệ bị từ chối (không open-redirect)');

  // 7. Shim thế hệ cũ (link tự ghép) trong cache không bao giờ được phục vụ
  const legacyUrl = buildAffiliateTrackingUrl({ cleanUrl: 'https://shopee.vn/product/1/2', affiliateId: 'an_17315740682' });
  const legacy = await createVoucherShim({ originalUrl: legacyUrl, cleanUrl: legacyUrl, affiliateUrl: legacyUrl });
  assert((await getVoucherShimBySlug(legacy.slug)) === null, 'Shim cũ trỏ tới link tự ghép bị loại khỏi /go');

  // 8. Slug sản phẩm cũ p<shop36>_<item36> -> xin short link chính thức mới
  defaultSessionClient.isAvailable = () => true;
  defaultSessionClient.generateShortLink = async () => 'https://s.shopee.vn/Legacy777';
  await cacheService.delete('shopee:shim:p6i8c8_ahe0g00');
  const legacySlugShim = await getVoucherShimBySlug('p6i8c8_ahe0g00');
  assert(legacySlugShim?.affiliateUrl === 'https://s.shopee.vn/Legacy777', 'Slug cũ p… được cấp lại short link chính thức');

  defaultSessionClient.generateShortLink = async () => null;
  await cacheService.delete('shopee:shim:p6i8c8_ahe0g00');
  assert((await getVoucherShimBySlug('p6i8c8_ahe0g00')) === null, 'Slug cũ p… không cấp được short link -> trang hết hạn, không phát link tự ghép');

  // 9. API /api/convert trả 503 khi không tạo được short link chính thức
  defaultSessionClient.isAvailable = () => false;
  const req = new NextRequest('http://localhost/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
    body: JSON.stringify({ url: 'https://shopee.vn/product/987/654' }),
  });
  // Mô phỏng production: defaultShopeeClient không được phép dùng mock
  const shopeeClientInternals = defaultShopeeClient as unknown as { mockMode: boolean };
  const previousMockMode = shopeeClientInternals.mockMode;
  shopeeClientInternals.mockMode = false;
  const res = await convertPost(req);
  const json = await res.json();
  shopeeClientInternals.mockMode = previousMockMode;
  assert(res.status === 503 && json.success === false && !json.data, '/api/convert trả 503, không kèm link khi không có short link chính thức');

  // 10. LocalStorage history bỏ link cũ không có hoa hồng
  const store = new Map<string, string>();
  (globalThis as any).window = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  store.set('shopeelink_recent_conversions', JSON.stringify([{ id: 'old', targetWithVoucherUrl: legacyUrl }]));
  store.set(
    'shopeelink_recent_conversions_v2',
    JSON.stringify([
      { id: 'good', targetWithVoucherUrl: OFFICIAL_SHORT_LINK },
      { id: 'bad', targetWithVoucherUrl: legacyUrl },
    ])
  );
  const history = getRecentHistory();
  assert(history.length === 1 && history[0].id === 'good', 'Lịch sử chỉ giữ mục trỏ tới s.shopee.vn');
  assert(!store.has('shopeelink_recent_conversions'), 'Key lịch sử v1 (link tự ghép) bị xóa');
  delete (globalThis as any).window;
  delete (globalThis as any).localStorage;

  defaultSessionClient.isAvailable = originalIsAvailable;
  defaultSessionClient.generateShortLink = originalGenerate;

  console.log('\n====================================================');
  console.log(`📊 Kết quả Attribution Suite: ${passed}/${passed + failed} tests passed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('LỖI:', err);
  process.exit(1);
});
