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

const STORAGE_KEY = 'shopeelink_recent_conversions';
const MAX_RECENT_ITEMS = 8;

export function getRecentHistory(): RecentConversionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
