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
const CATEGORIES = [
  'Đồ ăn dặm cho bé',
  'Tã bỉm organic',
  'Máy móc mẹ & bé',
  'Đồ chơi Montessori',
  'Thời trang bé yêu',
  'Góc cưng chiều mẹ',
];

const VOUCHER_ACTIONS = [
  { action: 'vừa tạo link Balo bé xinh', title: 'Ưu Đãi Đối Tác', minSaved: 45000, maxSaved: 95000 },
  { action: 'vừa áp mã Giảm 25% tã bỉm', title: 'Trợ Giá Bỉm Sữa', minSaved: 50000, maxSaved: 150000 },
  { action: 'vừa tạo link Máy tiệt trùng UVC', title: 'Voucher Mall Chính Hãng', minSaved: 120000, maxSaved: 350000 },
  { action: 'vừa nhận mã Freeship 0đ ăn dặm', title: 'Freeship Xtra', minSaved: 25000, maxSaved: 40000 },
  { action: 'vừa tạo link Đồ chơi gỗ giác quan', title: 'Giảm Giá Độc Quyền', minSaved: 35000, maxSaved: 85000 },
  { action: 'vừa chốt đơn Ghế ăn dặm', title: 'Voucher Shopee Mall', minSaved: 80000, maxSaved: 220000 },
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
