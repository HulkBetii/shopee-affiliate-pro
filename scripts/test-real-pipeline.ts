import { parseShopeeInput } from '../lib/shopee/parser';
import { defaultShopeeClient } from '../lib/shopee/client';
import { createVoucherShim, getVoucherShimBySlug } from '../lib/shopee/voucher-shim';
import { cacheService } from '../lib/cache';
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
        const v = trimmed.slice(idx + 1).trim();
        process.env[k] = v;
      }
    }
  }
} catch (e) {
  console.warn('Cannot read .env.local:', e);
}

async function main() {
  console.log('--- TEST PIPELINE THỰC TẾ VỚI .ENV.LOCAL ---');
  console.log('SHOPEE_AFFILIATE_ID:', process.env.SHOPEE_AFFILIATE_ID);
  
  const testUrl = 'https://shopee.vn/product/10928312/22819283712';
  const parsed = await parseShopeeInput(testUrl);
  console.log('1. Parsed:');
  console.log('   cleanUrl:', parsed.cleanUrl);
  console.log('   shopId:', parsed.shopId);
  console.log('   itemId:', parsed.itemId);

  const affUrl = await defaultShopeeClient.generateShortLink(parsed.cleanUrl, ['tiktok_bio']);
  console.log('2. Affiliate Tracking URL:');
  console.log('   Full:', affUrl);

  const affParsed = new URL(affUrl);
  const utmSource = affParsed.searchParams.get('utm_source');
  const afSubSiteid = affParsed.searchParams.get('af_sub_siteid');
  const mmpPid = affParsed.searchParams.get('mmp_pid');
  console.log('   utm_source:', utmSource);
  console.log('   af_sub_siteid:', afSubSiteid);
  console.log('   mmp_pid:', mmpPid);

  if (utmSource !== process.env.SHOPEE_AFFILIATE_ID && utmSource !== 'an_17315740682') {
    throw new Error(`CRITICAL FAIL: utm_source is ${utmSource}, not affiliateId!`);
  }

  const shim = await createVoucherShim({
    originalUrl: testUrl,
    cleanUrl: parsed.cleanUrl,
    affiliateUrl: affUrl,
    itemId: parsed.itemId,
    shopId: parsed.shopId,
  });

  console.log('3. Voucher Shim & Deep Links:');
  console.log('   Slug:', shim.slug);
  console.log('   targetWithVoucherUrl:', shim.targetWithVoucherUrl);
  console.log('   androidIntent:', shim.androidIntent);

  const shimParsed = new URL(shim.targetWithVoucherUrl);
  console.log('   targetWithVoucher utm_source:', shimParsed.searchParams.get('utm_source'));
  console.log('   targetWithVoucher utm_campaign:', shimParsed.searchParams.get('utm_campaign'));

  if (shimParsed.searchParams.get('utm_source') === 'facebook') {
    throw new Error('CRITICAL FAIL: targetWithVoucherUrl overwrote utm_source with facebook!');
  }

  // 4. Test Stateless Self-Healing Slug (Cache Miss)
  await cacheService.delete(`shopee:shim:${shim.slug}`);
  const recovered = await getVoucherShimBySlug(shim.slug);
  console.log('4. Stateless Recovery on Cache Miss:');
  console.log('   Recovered successfully:', !!recovered);
  console.log('   Recovered itemId:', recovered?.itemId);
  console.log('   Recovered targetWithVoucher utm_source:', recovered ? new URL(recovered.targetWithVoucherUrl).searchParams.get('utm_source') : 'N/A');

  if (!recovered || recovered.itemId !== parsed.itemId) {
    throw new Error('CRITICAL FAIL: Stateless Self-Healing Recovery failed!');
  }

  console.log('\n>>> TẤT CẢ KIỂM THỬ THỰC TẾ THÀNH CÔNG 100%! HOA HỒNG ĐƯỢC BẢO TOÀN TRỌN VẸN! <<<');
}

main().catch(err => {
  console.error('LỖI:', err);
  process.exit(1);
});
