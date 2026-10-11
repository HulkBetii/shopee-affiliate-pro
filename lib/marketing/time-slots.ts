export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  discount: string;
  condition: string;
  tag: string;
  expires: string;
  usedPercentage: number;
}

export interface ShopeeSaleSlot {
  slotId: string;
  slotName: string;
  slotTag: string;
  themeColor: string;
  startHour: number;
  endHour: number;
  highlightText: string;
  vouchers: VoucherItem[];
}

/**
 * 6 Khung Giờ Săn Sale Chuẩn của Shopee Việt Nam
 */
export const SHOPEE_SALE_SLOTS: ShopeeSaleSlot[] = [
  {
    slotId: 'slot_00',
    slotName: 'Đêm Hội Săn Sale 50% - Bắt Đáy Nửa Đêm',
    slotTag: '00:00 - 09:00',
    themeColor: 'from-purple-600 via-indigo-600 to-blue-600',
    startHour: 0,
    endHour: 9,
    highlightText: 'Voucher Hoàn Xu 50% & Freeship 0đ Toàn Sàn',
    vouchers: [
      {
        id: 'v_01',
        code: 'MIDNIGHT50K',
        title: 'Voucher Đêm Hội Giảm Sâu',
        discount: 'Giảm 50% (Tối đa 100k)',
        condition: 'Đơn từ 0đ, mở qua ShopeeLink Pro',
        tag: 'Bắt Đáy',
        expires: '09:00 Hôm nay',
        usedPercentage: 92,
      },
      {
        id: 'v_02',
        code: 'FREESHIP0D',
        title: 'Miễn Phí Vận Chuyển Đêm',
        discount: 'Freeship 0đ (Tối đa 300k)',
        condition: 'Mọi đơn hàng toàn quốc',
        tag: 'Freeship',
        expires: '09:00 Hôm nay',
        usedPercentage: 88,
      },
      {
        id: 'v_03',
        code: 'METAPARTNER25',
        title: 'Ưu Đãi Đối Tác Meta Collab',
        discount: 'Giảm 25% (Tối đa 500k)',
        condition: 'Tự động kích hoạt khi mở App',
        tag: 'Độc Quyền',
        expires: 'Hôm nay',
        usedPercentage: 84,
      },
      {
        id: 'v_04',
        code: 'COINBACK30',
        title: 'Hoàn Xu Shopee Xu Đêm',
        discount: 'Hoàn 30% Xu (Tối đa 50k xu)',
        condition: 'Mọi ngành hàng Shopee Mall & Yêu thích',
        tag: 'Hoàn Xu',
        expires: '09:00 Hôm nay',
        usedPercentage: 79,
      },
    ],
  },
  {
    slotId: 'slot_09',
    slotName: 'Hàng Hiệu Giảm Sâu - Flash Voucher 25%',
    slotTag: '09:00 - 12:00',
    themeColor: 'from-rose-600 via-red-500 to-orange-500',
    startHour: 9,
    endHour: 12,
    highlightText: 'Mã Giảm Giá Thương Hiệu Chính Hãng Shopee Mall',
    vouchers: [
      {
        id: 'v_09_1',
        code: 'MALLBRAND25',
        title: 'Voucher Hàng Hiệu Chính Hãng',
        discount: 'Giảm 25% (Tối đa 250k)',
        condition: 'Gian hàng Shopee Mall & Chính hãng 100%',
        tag: 'Mall Pro',
        expires: '12:00 Hôm nay',
        usedPercentage: 86,
      },
      {
        id: 'v_09_2',
        code: 'METAPARTNER25',
        title: 'Ưu Đãi Đối Tác Meta Collab',
        discount: 'Giảm 25% (Tối đa 500k)',
        condition: 'Tự động kích hoạt khi mở App',
        tag: 'Độc Quyền',
        expires: 'Hôm nay',
        usedPercentage: 81,
      },
      {
        id: 'v_09_3',
        code: 'TECHPRO150K',
        title: 'Ưu Đãi Công Nghệ & Đời Sống',
        discount: 'Giảm 15% (Tối đa 150k)',
        condition: 'Đơn từ 200k ngành điện tử & gia dụng',
        tag: 'Công Nghệ',
        expires: '12:00 Hôm nay',
        usedPercentage: 74,
      },
      {
        id: 'v_09_4',
        code: 'FREESHIPXTRA',
        title: 'Miễn Phí Vận Chuyển Toàn Sàn',
        discount: 'Freeship 0đ (Tối đa 300k)',
        condition: 'Gian hàng FreeShip Xtra',
        tag: 'Freeship',
        expires: '12:00 Hôm nay',
        usedPercentage: 91,
      },
    ],
  },
  {
    slotId: 'slot_12',
    slotName: 'Nửa Ngày Freeship 0Đ - Giờ Vàng Cơm Trưa',
    slotTag: '12:00 - 15:00',
    themeColor: 'from-amber-500 via-orange-500 to-red-500',
    startHour: 12,
    endHour: 15,
    highlightText: 'Mã Freeship 0Đ Cho Mọi Đơn Hàng + Voucher 20%',
    vouchers: [
      {
        id: 'v_12_1',
        code: 'FREESHIP12H',
        title: 'Freeship Giờ Cơm Trưa 0Đ',
        discount: 'Freeship 0đ (Tối đa 300k)',
        condition: 'Áp dụng toàn sàn Shopee',
        tag: 'Freeship Hot',
        expires: '15:00 Hôm nay',
        usedPercentage: 95,
      },
      {
        id: 'v_12_2',
        code: 'LUNCHDEAL20',
        title: 'Deal Trưa Giảm 20% Toàn Sàn',
        discount: 'Giảm 20% (Tối đa 100k)',
        condition: 'Đơn từ 50k, kích hoạt qua ShopeeLink',
        tag: 'Giờ Vàng',
        expires: '15:00 Hôm nay',
        usedPercentage: 89,
      },
      {
        id: 'v_12_3',
        code: 'METAPARTNER25',
        title: 'Ưu Đãi Đối Tác Meta Collab',
        discount: 'Giảm 25% (Tối đa 500k)',
        condition: 'Tự động kích hoạt khi mở App',
        tag: 'Độc Quyền',
        expires: 'Hôm nay',
        usedPercentage: 83,
      },
      {
        id: 'v_12_4',
        code: 'FOODLIFE15',
        title: 'Bách Hóa & Đời Sống Giảm 15%',
        discount: 'Giảm 15% (Tối đa 70k)',
        condition: 'Đơn tiêu dùng & thực phẩm',
        tag: 'Bách Hóa',
        expires: '15:00 Hôm nay',
        usedPercentage: 76,
      },
    ],
  },
  {
    slotId: 'slot_15',
    slotName: 'Giờ Vàng Xả Kho - Đồng Giá 9K / 99K',
    slotTag: '15:00 - 18:00',
    themeColor: 'from-emerald-500 via-teal-600 to-cyan-600',
    startHour: 15,
    endHour: 18,
    highlightText: 'Xả Kho Trợ Giá Cuối Ngày - Giảm Trực Tiếp Đến 200K',
    vouchers: [
      {
        id: 'v_15_1',
        code: 'XAKHO15H',
        title: 'Voucher Trợ Giá Xả Kho',
        discount: 'Giảm 20% (Tối đa 200k)',
        condition: 'Mọi đơn hàng xả kho chính hãng',
        tag: 'Xả Kho',
        expires: '18:00 Hôm nay',
        usedPercentage: 91,
      },
      {
        id: 'v_15_2',
        code: 'METAPARTNER25',
        title: 'Ưu Đãi Đối Tác Meta Collab',
        discount: 'Giảm 25% (Tối đa 500k)',
        condition: 'Tự động kích hoạt khi mở App',
        tag: 'Độc Quyền',
        expires: 'Hôm nay',
        usedPercentage: 85,
      },
      {
        id: 'v_15_3',
        code: 'FASHION99K',
        title: 'Thời Trang & Phụ Kiện Hot',
        discount: 'Giảm 25k cho đơn 99k',
        condition: 'Áp dụng ngành thời trang nam/nữ',
        tag: 'Thời Trang',
        expires: '18:00 Hôm nay',
        usedPercentage: 82,
      },
      {
        id: 'v_15_4',
        code: 'FREESHIPXTRA',
        title: 'Freeship Toàn Quốc 0Đ',
        discount: 'Freeship 0đ (Tối đa 300k)',
        condition: 'Tất cả gian hàng Shopee',
        tag: 'Freeship',
        expires: '18:00 Hôm nay',
        usedPercentage: 88,
      },
    ],
  },
  {
    slotId: 'slot_18',
    slotName: 'Top Deal Xu Hướng - Voucher Video & Live 20%',
    slotTag: '18:00 - 21:00',
    themeColor: 'from-[#EE4D2D] via-orange-500 to-amber-500',
    startHour: 18,
    endHour: 21,
    highlightText: 'Mã Giảm Giá Shopee Live & Shopee Video Đến 200K',
    vouchers: [
      {
        id: 'v_18_1',
        code: 'LIVEVIDEO20',
        title: 'Voucher Shopee Video & Live',
        discount: 'Giảm 20% (Tối đa 200k)',
        condition: 'Sản phẩm có gắn tag Video & Live',
        tag: 'Live/Video',
        expires: '21:00 Hôm nay',
        usedPercentage: 96,
      },
      {
        id: 'v_18_2',
        code: 'METAPARTNER25',
        title: 'Ưu Đãi Đối Tác Meta Collab',
        discount: 'Giảm 25% (Tối đa 500k)',
        condition: 'Tự động kích hoạt khi mở App',
        tag: 'Độc Quyền',
        expires: 'Hôm nay',
        usedPercentage: 88,
      },
      {
        id: 'v_18_3',
        code: 'BEAUTYHOT30',
        title: 'Mỹ Phẩm & Chăm Sóc Sắc Đẹp',
        discount: 'Giảm 15% (Tối đa 120k)',
        condition: 'Đơn từ 150k ngành làm đẹp',
        tag: 'Mỹ Phẩm',
        expires: '21:00 Hôm nay',
        usedPercentage: 84,
      },
      {
        id: 'v_18_4',
        code: 'FREESHIPXTRA',
        title: 'Freeship Giờ Cao Điểm',
        discount: 'Freeship 0đ (Tối đa 300k)',
        condition: 'Áp dụng toàn sàn',
        tag: 'Freeship',
        expires: '21:00 Hôm nay',
        usedPercentage: 93,
      },
    ],
  },
  {
    slotId: 'slot_21',
    slotName: 'Đồng Giá Bắt Đáy - Giảm Giá Giờ Chót',
    slotTag: '21:00 - 24:00',
    themeColor: 'from-violet-600 via-purple-600 to-pink-600',
    startHour: 21,
    endHour: 24,
    highlightText: 'Cơ Hội Cuối Cùng Trong Ngày - Chốt Đơn Săn Voucher',
    vouchers: [
      {
        id: 'v_21_1',
        code: 'LASTCHANCE25',
        title: 'Voucher Giờ Chót Toàn Sàn',
        discount: 'Giảm 25% (Tối đa 150k)',
        condition: 'Áp dụng cho mọi đơn thanh toán đêm',
        tag: 'Giờ Chót',
        expires: '23:59 Hôm nay',
        usedPercentage: 94,
      },
      {
        id: 'v_21_2',
        code: 'METAPARTNER25',
        title: 'Ưu Đãi Đối Tác Meta Collab',
        discount: 'Giảm 25% (Tối đa 500k)',
        condition: 'Tự động kích hoạt khi mở App',
        tag: 'Độc Quyền',
        expires: 'Hôm nay',
        usedPercentage: 91,
      },
      {
        id: 'v_21_3',
        code: 'NIGHTFREESHIP',
        title: 'Freeship Đêm Muộn 0Đ',
        discount: 'Freeship 0đ (Tối đa 300k)',
        condition: 'Đơn hàng bất kỳ',
        tag: 'Freeship',
        expires: '23:59 Hôm nay',
        usedPercentage: 87,
      },
      {
        id: 'v_21_4',
        code: 'MALLNIGHT10',
        title: 'Chính Hãng Shopee Mall Đêm',
        discount: 'Giảm 10% (Tối đa 100k)',
        condition: 'Hàng chính hãng Shopee Mall',
        tag: 'Chính Hãng',
        expires: '23:59 Hôm nay',
        usedPercentage: 80,
      },
    ],
  },
];

/**
 * Lấy Khung Giờ Săn Sale Hiện Tại theo Múi giờ Việt Nam (UTC+7)
 */
export function getCurrentShopeeSlot(nowDate: Date = new Date()): {
  slot: ShopeeSaleSlot;
  secondsRemaining: number;
  formattedRemaining: string;
  nextSlotName: string;
} {
  // Lấy giờ Việt Nam (UTC+7)
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  const utcMs = nowDate.getTime() + nowDate.getTimezoneOffset() * 60 * 1000;
  const vnDate = new Date(utcMs + vnOffsetMs);

  const currentHour = vnDate.getHours();
  const currentMinutes = vnDate.getMinutes();
  const currentSeconds = vnDate.getSeconds();

  let foundSlot = SHOPEE_SALE_SLOTS[0];
  let nextSlotIndex = 1;

  for (let i = 0; i < SHOPEE_SALE_SLOTS.length; i++) {
    const s = SHOPEE_SALE_SLOTS[i];
    if (currentHour >= s.startHour && currentHour < s.endHour) {
      foundSlot = s;
      nextSlotIndex = (i + 1) % SHOPEE_SALE_SLOTS.length;
      break;
    }
  }

  // Tính số giây còn lại đến khi hết slot
  const currentSecondInDay = currentHour * 3600 + currentMinutes * 60 + currentSeconds;
  const endSecondInDay = foundSlot.endHour * 3600;
  const secondsRemaining = Math.max(0, endSecondInDay - currentSecondInDay);

  const hoursLeft = Math.floor(secondsRemaining / 3600);
  const minutesLeft = Math.floor((secondsRemaining % 3600) / 60);
  const secsLeft = secondsRemaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedRemaining = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secsLeft)}`;

  const nextSlot = SHOPEE_SALE_SLOTS[nextSlotIndex];

  return {
    slot: foundSlot,
    secondsRemaining,
    formattedRemaining,
    nextSlotName: nextSlot.slotName,
  };
}

/**
 * Tính số người săn sale động biến thiên chân thực theo thời gian trong ngày
 */
export function getDynamicSocialProofCount(nowDate: Date = new Date()): number {
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  const utcMs = nowDate.getTime() + nowDate.getTimezoneOffset() * 60 * 1000;
  const vnDate = new Date(utcMs + vnOffsetMs);

  const hour = vnDate.getHours();
  const minute = vnDate.getMinutes();

  // Cơ sở: ban đêm 400, ban trưa 1200, tối cao điểm 2500+
  let base = 420;
  if (hour >= 6 && hour < 12) {
    base = 420 + (hour - 6) * 140;
  } else if (hour >= 12 && hour < 18) {
    base = 1260 + (hour - 12) * 120;
  } else if (hour >= 18 && hour < 24) {
    base = 1980 + (hour - 18) * 160;
  }

  const minuteAddition = Math.floor(minute * 1.8);
  return base + minuteAddition;
}
