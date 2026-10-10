import { NextRequest, NextResponse } from 'next/server';
import { defaultShopeeClient } from '@/lib/shopee/client';
import { aggregateConversionReport, DailyReportSummary } from '@/lib/reports';
import { telegramNotifier, TelegramSendResult } from '@/lib/telegram';

export interface SyncReportsApiResponse {
  success: boolean;
  message?: string;
  data?: {
    summary: DailyReportSummary;
    telegram?: TelegramSendResult;
  };
}

/**
 * Kiểm tra mã khóa xác thực bảo vệ Cron Endpoint
 */
function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Nếu chưa thiết lập CRON_SECRET, cho phép thực thi trong dev/test
    return true;
  }

  // 1. Kiểm tra Authorization Header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === cronSecret) return true;
  }

  // 2. Kiểm tra query param ?secret=...
  const secretParam = req.nextUrl.searchParams.get('secret');
  if (secretParam === cronSecret) return true;

  return false;
}

async function handleSyncReports(req: NextRequest) {
  try {
    // 1. Xác thực bảo mật
    if (!verifyCronAuth(req)) {
      return NextResponse.json<SyncReportsApiResponse>(
        { success: false, message: 'Unauthorized: CRON_SECRET không hợp lệ.' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const daysParam = parseInt(searchParams.get('days') || '1', 10);
    const days = isNaN(daysParam) || daysParam < 1 ? 1 : Math.min(daysParam, 30);
    const shouldSendTelegram = searchParams.get('sendTelegram') !== 'false';

    // 2. Xác định khoảng thời gian báo cáo (tính theo giây)
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - days * 86400;
    const endTime = now;

    // 3. Kéo dữ liệu từ Shopee Open API (GraphQL query conversionReport)
    const reportData = await defaultShopeeClient.getConversionReport({
      purchaseTimeStart: startTime,
      purchaseTimeEnd: endTime,
      limit: 100,
      orderStatus: 'ALL',
    });

    // 4. Tổng hợp số liệu tài chính & sản phẩm
    const summary = aggregateConversionReport(reportData.nodes || [], startTime, endTime);

    // 5. Gửi thông báo đến Telegram Bot nếu được yêu cầu
    let telegramResult: TelegramSendResult | undefined;
    if (shouldSendTelegram) {
      telegramResult = await telegramNotifier.sendReport(summary);
    }

    // 6. Trả về kết quả JSON
    return NextResponse.json<SyncReportsApiResponse>({
      success: true,
      data: {
        summary,
        telegram: telegramResult,
      },
    });
  } catch (err: unknown) {
    console.error('Lỗi API /api/sync-reports:', err);
    return NextResponse.json<SyncReportsApiResponse>(
      {
        success: false,
        message: `Đồng bộ báo cáo thất bại: ${(err as Error)?.message || 'Lỗi không xác định'}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleSyncReports(req);
}

export async function POST(req: NextRequest) {
  return handleSyncReports(req);
}
