export interface SocialProofEvent {
  id: string;
  phoneMasked: string;
  action: string;
  voucherTitle: string;
  savedAmount: string;
  category: string;
  timeAgo: string;
}

const PHONE_PREFIXES = ['098', '097', '096', '091', '090', '093', '086', '089', '077', '038', '035'];
const CATEGORIES = ['Thời trang', 'Đồ gia dụng', 'Công nghệ', 'Mỹ phẩm', 'Đời sống', 'Mẹ & Bé', 'Giày dép'];
const VOUCHER_ACTIONS = [
  { action: 'vừa áp mã Giảm 25%', title: 'Voucher Đối Tác Meta', minSaved: 50000, maxSaved: 125000 },
  { action: 'vừa kích hoạt Freeship 0đ', title: 'Freeship Xtra Toàn Sàn', minSaved: 25000, maxSaved: 40000 },
  { action: 'vừa áp mã Giảm 20%', title: 'Voucher Shopee Video & Live', minSaved: 45000, maxSaved: 95000 },
  { action: 'vừa chốt đơn Hàng Hiệu', title: 'Voucher Mall Chính Hãng', minSaved: 80000, maxSaved: 250000 },
  { action: 'vừa nhận mã Hoàn 30% Xu', title: 'Hoàn Xu Đơn Hàng', minSaved: 30000, maxSaved: 65000 },
];

export function getRandomSocialProofEvent(): SocialProofEvent {
  const prefix = PHONE_PREFIXES[Math.floor(Math.random() * PHONE_PREFIXES.length)];
  const suffix = Math.floor(Math.random() * 90 + 10).toString();
  const phoneMasked = `${prefix}***${suffix}`;

  const template = VOUCHER_ACTIONS[Math.floor(Math.random() * VOUCHER_ACTIONS.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  // Sinh số tiền chẵn (bội số của 5000)
  const rawSaved = Math.floor(Math.random() * (template.maxSaved - template.minSaved) + template.minSaved);
  const roundedSaved = Math.round(rawSaved / 5000) * 5000;
  const savedAmount = `${new Intl.NumberFormat('vi-VN').format(roundedSaved)}đ`;

  const secondsAgo = Math.floor(Math.random() * 45 + 10);
  const timeAgo = `${secondsAgo} giây trước`;

  return {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    phoneMasked,
    action: template.action,
    voucherTitle: template.title,
    savedAmount,
    category,
    timeAgo,
  };
}
