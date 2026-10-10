import { ConversionReportNode } from './shopee/types';

export interface TopProductSummary {
  itemId: string;
  itemName: string;
  itemCount: number;
  totalSales: number;
}

export interface DailyReportSummary {
  period: {
    startTime: number;
    endTime: number;
    formattedRange: string;
  };
  metrics: {
    totalOrders: number;
    totalGrossSales: number;
    estimatedTotalCommission: number;
    grossCommission: number;
    cappedCommission: number;
    totalBrandCommission: number;
  };
  statusBreakdown: {
    completed: number;
    pending: number;
    cancelled: number;
    other: number;
  };
  topProducts: TopProductSummary[];
}

/**
 * Định dạng số tiền thành chuỗi tiền tệ VND (ví dụ: 1.500.000 đ)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Tổng hợp dữ liệu từ danh sách ConversionReportNode của Shopee Open API
 */
export function aggregateConversionReport(
  nodes: ConversionReportNode[],
  startTime: number,
  endTime: number
): DailyReportSummary {
  let totalOrders = nodes.length;
  let totalGrossSales = 0;
  let estimatedTotalCommission = 0;
  let grossCommission = 0;
  let cappedCommission = 0;
  let totalBrandCommission = 0;

  const statusBreakdown = {
    completed: 0,
    pending: 0,
    cancelled: 0,
    other: 0,
  };

  const productMap = new Map<string, { itemName: string; itemCount: number; totalSales: number }>();

  for (const node of nodes) {
    // 1. Phân loại trạng thái đơn
    const status = (node.orderStatus || '').toUpperCase();
    if (status === 'COMPLETED' || status === 'DELIVERED') {
      statusBreakdown.completed++;
    } else if (status === 'PENDING' || status === 'PAID') {
      statusBreakdown.pending++;
    } else if (status === 'CANCELLED' || status === 'REFUND') {
      statusBreakdown.cancelled++;
    } else {
      statusBreakdown.other++;
    }

    // 2. Tính hoa hồng
    estimatedTotalCommission += parseFloat(node.estimatedTotalCommission || '0') || 0;
    grossCommission += parseFloat(node.grossCommission || '0') || 0;
    cappedCommission += parseFloat(node.cappedCommission || '0') || 0;
    totalBrandCommission += parseFloat(node.totalBrandCommission || '0') || 0;

    // 3. Phân tích chi tiết các sản phẩm trong đơn
    if (Array.isArray(node.orders)) {
      for (const orderItem of node.orders) {
        const price = parseFloat(orderItem.itemPrice || '0') || 0;
        const count = orderItem.itemCount || 1;
        const lineSales = price * count;

        totalGrossSales += lineSales;

        const existing = productMap.get(orderItem.itemId);
        if (existing) {
          existing.itemCount += count;
          existing.totalSales += lineSales;
        } else {
          productMap.set(orderItem.itemId, {
            itemName: orderItem.itemName || `Sản phẩm #${orderItem.itemId}`,
            itemCount: count,
            totalSales: lineSales,
          });
        }
      }
    }
  }

  // Sắp xếp Top 5 sản phẩm bán chạy nhất theo số lượng
  const topProducts: TopProductSummary[] = Array.from(productMap.entries())
    .map(([itemId, data]) => ({
      itemId,
      itemName: data.itemName,
      itemCount: data.itemCount,
      totalSales: data.totalSales,
    }))
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 5);

  const startFormatted = new Date(startTime * 1000).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const endFormatted = new Date(endTime * 1000).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  return {
    period: {
      startTime,
      endTime,
      formattedRange: `${startFormatted} - ${endFormatted}`,
    },
    metrics: {
      totalOrders,
      totalGrossSales,
      estimatedTotalCommission,
      grossCommission,
      cappedCommission,
      totalBrandCommission,
    },
    statusBreakdown,
    topProducts,
  };
}
