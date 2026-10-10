import { DailyReportSummary, formatVND } from './reports';

export interface TelegramSendResult {
  success: boolean;
  message: string;
  isDryRun: boolean;
  telegramMessageId?: number;
}

export class TelegramNotifier {
  private botToken: string;
  private chatId: string;
  private isConfigured: boolean;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.isConfigured = !!(
      this.botToken &&
      this.chatId &&
      !this.botToken.includes('your_telegram') &&
      !this.chatId.includes('your_personal')
    );
  }

  public isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Định dạng tin nhắn báo cáo hàng ngày bằng HTML cho Telegram Bot
   */
  public formatReportMessage(summary: DailyReportSummary): string {
    const { metrics, statusBreakdown, topProducts, period } = summary;

    let msg = `<b>📊 [SHOPEELINK PRO] ĐỐI SOÁT DOANH THU & HOA HỒNG</b>\n`;
    msg += `<i>📅 Kỳ báo cáo: ${period.formattedRange}</i>\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `🛒 <b>Tổng đơn hàng:</b> <code>${metrics.totalOrders} đơn</code>\n`;
    msg += `   • Hoàn thành: <b>${statusBreakdown.completed}</b>\n`;
    msg += `   • Đang xử lý: <b>${statusBreakdown.pending}</b>\n`;
    msg += `   • Đã hủy/Hoàn: <b>${statusBreakdown.cancelled}</b>\n\n`;

    msg += `💰 <b>Doanh số phát sinh (GMV):</b>\n👉 <b>${formatVND(metrics.totalGrossSales)}</b>\n\n`;
    msg += `💵 <b>Hoa hồng ước tính nhận:</b>\n👉 <b>${formatVND(metrics.estimatedTotalCommission)}</b>\n`;

    if (metrics.totalBrandCommission > 0) {
      msg += `🏷️ <i>Thưởng thêm từ Brand:</i> +${formatVND(metrics.totalBrandCommission)}\n`;
    }

    if (topProducts.length > 0) {
      msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🔥 <b>TOP SẢN PHẨM BÁN CHẠY NHẤT:</b>\n`;
      topProducts.forEach((p, idx) => {
        msg += `${idx + 1}. <b>${p.itemName.slice(0, 35)}...</b>\n`;
        msg += `   └ Số lượng: <code>${p.itemCount}</code> | Doanh số: <code>${formatVND(p.totalSales)}</code>\n`;
      });
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🚀 <i>Hệ thống ShopeeLink Pro tự động gửi lúc 23:00</i>`;

    return msg;
  }

  /**
   * Gửi tin nhắn đến Telegram Bot (Hỗ trợ Dry-run nếu chưa cấu hình Token)
   */
  public async sendReport(summary: DailyReportSummary): Promise<TelegramSendResult> {
    const message = this.formatReportMessage(summary);

    if (!this.isConfigured) {
      console.log('\n[Telegram Bot Dry-run Mode - Log bản tin mô phỏng]:');
      console.log('----------------------------------------------------');
      console.log(message.replace(/<[^>]*>/g, '')); // In dạng plain text
      console.log('----------------------------------------------------\n');

      return {
        success: true,
        message: 'Telegram Bot đang ở chế độ Dry-run (chưa cấu hình Token). Đã log tin nhắn ra console.',
        isDryRun: true,
      };
    }

    try {
      const endpoint = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.ok) {
        throw new Error(resJson.description || 'Lỗi gửi tin nhắn Telegram');
      }

      return {
        success: true,
        message: 'Đã gửi thông báo đối soát thành công qua Telegram Bot.',
        isDryRun: false,
        telegramMessageId: resJson.result?.message_id,
      };
    } catch (err: unknown) {
      console.error('Lỗi gửi Telegram Bot:', err);
      return {
        success: false,
        message: `Lỗi gửi Telegram: ${(err as Error)?.message || 'Unknown network error'}`,
        isDryRun: false,
      };
    }
  }
}

// Singleton Telegram Notifier Instance
export const telegramNotifier = new TelegramNotifier();
