import { cacheService } from './cache';
import { telegramNotifier } from './telegram';

const AFFILIATE_ALERT_KEY = 'alert:affiliate-link-failed';
const AFFILIATE_ALERT_TTL_SECONDS = 3600;

/**
 * Báo động khi hệ thống không tạo được short link affiliate chính thức.
 * Throttle tối đa 1 tin / giờ để tránh spam Telegram khi cookie hết hạn.
 * Never throws: alerting must not break the user-facing request.
 */
export async function alertAffiliateLinkFailure(reason: string, context?: string): Promise<void> {
  console.error(`[AffiliateAlert] ${reason}${context ? ` | ${context}` : ''}`);

  try {
    const alreadySent = await cacheService.get<number>(AFFILIATE_ALERT_KEY);
    if (alreadySent) return;

    await cacheService.set(AFFILIATE_ALERT_KEY, Date.now(), AFFILIATE_ALERT_TTL_SECONDS);
    await telegramNotifier.sendAlert(
      'KHÔNG TẠO ĐƯỢC LINK AFFILIATE',
      `${reason}${context ? `\nInput: ${context}` : ''}\nHành động: cập nhật SHOPEE_SESSION_COOKIE trên Vercel rồi redeploy.`
    );
  } catch (err: unknown) {
    console.error('[AffiliateAlert] Failed to deliver alert:', err);
  }
}
