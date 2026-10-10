import { aggregateConversionReport, formatVND } from '../lib/reports';
import { telegramNotifier } from '../lib/telegram';
import { ConversionReportNode } from '../lib/shopee/types';

async function runPhase4Verification() {
  console.log('====================================================');
  console.log('🚀 ShopeeLink Pro - Phase 4 Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 4;

  // Test 1: Kiểm tra tính toán & tổng hợp số liệu báo cáo (aggregateConversionReport)
  try {
    const mockNodes: ConversionReportNode[] = [
      {
        checkoutId: 'ORD_001',
        purchaseTime: 1728520000,
        orderStatus: 'COMPLETED',
        estimatedTotalCommission: '45000',
        grossCommission: '50000',
        cappedCommission: '45000',
        totalBrandCommission: '10000',
        orders: [
          {
            itemId: '101',
            itemName: 'Áo thun thể thao nam cao cấp',
            itemPrice: '150000',
            itemCount: 2,
          },
        ],
      },
      {
        checkoutId: 'ORD_002',
        purchaseTime: 1728521000,
        orderStatus: 'PENDING',
        estimatedTotalCommission: '25000',
        grossCommission: '25000',
        cappedCommission: '25000',
        totalBrandCommission: '0',
        orders: [
          {
            itemId: '102',
            itemName: 'Giày sneaker năng động',
            itemPrice: '250000',
            itemCount: 1,
          },
        ],
      },
      {
        checkoutId: 'ORD_003',
        purchaseTime: 1728522000,
        orderStatus: 'CANCELLED',
        estimatedTotalCommission: '0',
        grossCommission: '0',
        cappedCommission: '0',
        totalBrandCommission: '0',
        orders: [],
      },
    ];

    const summary = aggregateConversionReport(mockNodes, 1728500000, 1728586400);

    if (summary.metrics.totalOrders !== 3) {
      throw new Error(`Expected 3 orders, got ${summary.metrics.totalOrders}`);
    }
    if (summary.metrics.totalGrossSales !== 550000) {
      throw new Error(`Expected 550000 GMV, got ${summary.metrics.totalGrossSales}`);
    }
    if (summary.metrics.estimatedTotalCommission !== 70000) {
      throw new Error(`Expected 70000 commission, got ${summary.metrics.estimatedTotalCommission}`);
    }
    if (summary.statusBreakdown.completed !== 1 || summary.statusBreakdown.pending !== 1 || summary.statusBreakdown.cancelled !== 1) {
      throw new Error(`Status breakdown mismatch: ${JSON.stringify(summary.statusBreakdown)}`);
    }
    if (summary.topProducts.length !== 2 || summary.topProducts[0].itemId !== '101') {
      throw new Error(`Top product ranking incorrect: ${JSON.stringify(summary.topProducts)}`);
    }

    console.log(`✅ [TEST 1/4] Aggregation Logic & Top Products: PASSED (GMV: ${formatVND(summary.metrics.totalGrossSales)})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1/4] Aggregation Logic: FAILED:', err.message);
  }

  // Test 2: Kiểm tra định dạng tiền tệ VND (formatVND)
  try {
    const formatted = formatVND(1500000);
    if (!formatted.includes('1.500.000')) {
      throw new Error(`Unexpected VND formatting: ${formatted}`);
    }
    console.log(`✅ [TEST 2/4] Currency VND Formatter: PASSED (${formatted})`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2/4] VND Formatter: FAILED:', err.message);
  }

  // Test 3: Định dạng tin nhắn HTML Telegram Bot (formatReportMessage)
  try {
    const summary = aggregateConversionReport([], 1728500000, 1728586400);
    const htmlMsg = telegramNotifier.formatReportMessage(summary);

    if (!htmlMsg.includes('SHOPEELINK PRO') || !htmlMsg.includes('<b>') || !htmlMsg.includes('Hoa hồng')) {
      throw new Error('Telegram message HTML format missing essential tags');
    }

    console.log('✅ [TEST 3/4] Telegram Bot HTML Message Formatter: PASSED');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3/4] Telegram Formatter: FAILED:', err.message);
  }

  // Test 4: Gửi tin nhắn Telegram qua chế độ Dry-run an toàn
  try {
    const summary = aggregateConversionReport([], 1728500000, 1728586400);
    const result = await telegramNotifier.sendReport(summary);

    if (!result.success) {
      throw new Error(`Telegram sendReport failed: ${result.message}`);
    }

    console.log(`✅ [TEST 4/4] Telegram Notifier Send Execution (Dry-run): PASSED`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4/4] Telegram Send: FAILED:', err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 Kết quả Phase 4: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase4Verification();
