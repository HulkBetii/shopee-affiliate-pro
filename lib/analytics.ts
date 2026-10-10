/**
 * Client-Side Tracking Helper (Google Analytics 4 & TikTok Pixel)
 * Tham chiếu: docs/FUNNEL_AND_STRATEGY.md
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ttq?: {
      track: (eventName: string, params?: Record<string, unknown>) => void;
      page: () => void;
    };
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  // 1. Google Analytics 4 Event
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (err) {
      console.warn('GA4 track error:', err);
    }
  }

  // 2. TikTok Pixel Event
  if (window.ttq && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track(eventName, params);
    } catch (err) {
      console.warn('TikTok Pixel track error:', err);
    }
  }

  // Dev log
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event Tracked] 👉 ${eventName}:`, params);
  }
}

/**
 * Track khi người dùng bấm nút Lấy Mã Giảm Giá
 */
export function trackConvertAttempt(url: string) {
  trackEvent('convert_attempt', {
    shopee_url: url.slice(0, 100),
    timestamp: Date.now(),
  });
}

/**
 * Track khi người dùng bấm nút Mở App Shopee (Event chuyển đổi giá trị cao nhất)
 */
export function trackOpenShopeeApp(slug: string, discount: number = 25) {
  trackEvent('open_shopee_app', {
    slug,
    voucher_discount: discount,
    content_type: 'product',
  });

  // Đồng thời track TikTok Standard Event "ClickButton"
  if (typeof window !== 'undefined' && window.ttq) {
    try {
      window.ttq.track('ClickButton', { button_name: 'open_shopee_app' });
    } catch {}
  }
}

/**
 * Track khi người dùng bấm sao chép link rút gọn
 */
export function trackCopyLink(slug: string) {
  trackEvent('copy_link', { slug });
}

/**
 * Track khi người dùng bấm sao chép mã voucher từ widget
 */
export function trackCopyVoucher(voucherCode: string) {
  trackEvent('copy_voucher', { voucher_code: voucherCode });
}
