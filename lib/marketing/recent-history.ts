export interface RecentConversionItem {
  id: string;
  cleanUrl: string;
  slug: string;
  goUrl: string;
  targetWithVoucherUrl: string;
  androidIntent: string;
  deepLink: string;
  discountPercentage: number;
  maxDiscountAmount: string;
  createdAt: number;
  itemId?: string;
}

const STORAGE_KEY = 'shopeelink_recent_conversions_v2';
// v1 lưu link tự ghép (không qua s.shopee.vn) nên Shopee không ghi nhận hoa hồng -> bỏ hẳn
const LEGACY_STORAGE_KEY = 'shopeelink_recent_conversions';
const MAX_RECENT_ITEMS = 8;

/**
 * Chỉ giữ các mục trỏ tới short link affiliate chính thức (s.shopee.vn)
 */
function isOfficialShortLink(urlStr: string): boolean {
  try {
    return new URL(urlStr).hostname.toLowerCase() === 's.shopee.vn';
  } catch {
    return false;
  }
}

export function getRecentHistory(): RecentConversionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: RecentConversionItem) =>
        typeof item?.targetWithVoucherUrl === 'string' && isOfficialShortLink(item.targetWithVoucherUrl)
    );
  } catch (err) {
    console.warn('Lỗi đọc lịch sử săn sale:', err);
    return [];
  }
}

export function saveRecentConversion(
  item: Omit<RecentConversionItem, 'id' | 'createdAt'>
): RecentConversionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentHistory();
    // Lọc trùng theo cleanUrl hoặc slug
    const filtered = current.filter(
      (c) => c.cleanUrl !== item.cleanUrl && c.slug !== item.slug
    );

    const newItem: RecentConversionItem = {
      ...item,
      id: `rc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Lỗi lưu lịch sử săn sale:', err);
    return [];
  }
}

export function clearRecentHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Lỗi xóa lịch sử săn sale:', err);
  }
}
