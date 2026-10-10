import { NextRequest, NextResponse } from 'next/server';
import { getVoucherShimBySlug } from '@/lib/shopee/voucher-shim';

function escapeHtmlAttr(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const shim = await getVoucherShimBySlug(slug);

  if (!shim) {
    // Không tìm thấy slug hoặc đã hết hạn -> Trả về giao diện thông báo hết hạn thân thiện
    const expiredHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <title>Liên kết ưu đãi đã hết hạn | ShopeeLink Pro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #090d16; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }
    .card { background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 36px 24px; max-width: 400px; width: 100%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); }
    .icon { font-size: 44px; margin-bottom: 16px; }
    h2 { font-size: 20px; font-weight: 800; margin-bottom: 10px; color: #fff; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: block; width: 100%; background: linear-gradient(135deg, #ee4d2d, #ff5722); color: #fff; text-decoration: none; padding: 14px; border-radius: 14px; font-weight: 800; font-size: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⏰</div>
    <h2>Liên kết đã hết hạn</h2>
    <p>Đường link ưu đãi này đã hết hạn lưu trữ bảo mật (24 giờ). Vui lòng dán lại link sản phẩm để kích hoạt mã giảm giá mới nhất.</p>
    <a href="/" class="btn">TẠO MÃ GIẢM GIÁ MỚI</a>
  </div>
</body>
</html>`;
    return new NextResponse(expiredHtml, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  const {
    deepLink,
    androidIntent,
    targetWithVoucherUrl,
    discountPercentage,
    maxDiscountAmount,
  } = shim;

  // HTML Bridge Page siêu nhẹ chuyển tiếp mượt mà, hỗ trợ iOS Universal Link & Android Intent
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <title>Đang chuyển hướng tới Shopee...</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(238, 77, 45, 0.3);
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(238, 77, 45, 0.15);
      color: #ff6b4a;
      border: 1px solid rgba(238, 77, 45, 0.4);
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 24px;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(238, 77, 45, 0.2);
      border-top-color: #ee4d2d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 { font-size: 21px; font-weight: 800; margin-bottom: 8px; color: #fff; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      min-height: 52px;
      background: linear-gradient(135deg, #ee4d2d, #ff5722);
      color: #fff;
      text-decoration: none;
      padding: 14px;
      border-radius: 14px;
      font-weight: 800;
      font-size: 16px;
      box-shadow: 0 8px 24px rgba(238, 77, 45, 0.4);
      margin-bottom: 12px;
      transition: transform 0.15s ease;
    }
    .btn-primary:active {
      transform: scale(0.97);
    }
    .btn-secondary {
      display: block;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      text-decoration: none;
      padding: 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
    }
    .fallback-hint {
      margin-top: 14px;
      font-size: 12px;
      color: #94a3b8;
    }
    .fallback-hint a {
      color: #ff6b4a;
      text-decoration: underline;
    }
    .tip {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .in-app-alert {
      display: none;
      margin-top: 16px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      font-size: 12px;
      text-align: left;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🎁 Voucher Giảm ${escapeHtmlText(String(discountPercentage))}% (Tối đa ${escapeHtmlText(maxDiscountAmount)})</div>
    <div class="spinner"></div>
    <h2>Đang Mở Ứng Dụng Shopee</h2>
    <p>Hệ thống đang tự động kích hoạt mã ưu đãi độc quyền cho đơn hàng của bạn...</p>
    
    <a href="${escapeHtmlAttr(targetWithVoucherUrl)}" class="btn-primary" id="openAppBtn">MỞ APP SHOPEE NGAY</a>
    <a href="${escapeHtmlAttr(targetWithVoucherUrl)}" class="btn-secondary" id="openWebBtn">Tiếp tục trên Trình duyệt Web</a>

    <div class="fallback-hint">
      Chưa thấy mở App? <a href="${escapeHtmlAttr(deepLink)}" id="forceOpenApp">Bấm để ép mở lại App</a>
    </div>

    <div id="inAppNotice" class="in-app-alert">
      ⚠️ <b>Mẹo mở App Shopee nhanh:</b><br/>
      Nếu đang xem trong TikTok / Facebook / Zalo, hãy bấm biểu tượng <b>⋯</b> ở góc trên cùng và chọn <b>"Mở bằng trình duyệt Safari/Chrome"</b> để vào thẳng App và không bị mất mã.
    </div>

    <div class="tip">
      🛡️ Thanh toán bảo mật trực tiếp trong Shopee App • Giữ nguyên quyền lợi bảo hành chính hãng
    </div>
  </div>

  <script>
    (function() {
      var targetUrl = ${JSON.stringify(targetWithVoucherUrl).replace(/</g, '\\u003c')};
      var deepLink = ${JSON.stringify(deepLink).replace(/</g, '\\u003c')};
      var androidIntent = ${JSON.stringify(androidIntent).replace(/</g, '\\u003c')};

      var ua = navigator.userAgent;
      var isIOS = /iPhone|iPad|iPod/i.test(ua);
      var isAndroid = /Android/i.test(ua);
      var isInAppBrowser = /FBAN|FBAV|Instagram|TikTok|Bytedance|Line|MicroMessenger|Zalo/i.test(ua);

      var appBtn = document.getElementById('openAppBtn');
      var inAppNotice = document.getElementById('inAppNotice');

      if (isInAppBrowser && inAppNotice) {
        inAppNotice.style.display = 'block';
      }

      // Xử lý khi người dùng chạm nút Mở App thủ công
      if (appBtn) {
        appBtn.addEventListener('click', function(e) {
          if (isAndroid && androidIntent) {
            e.preventDefault();
            window.location.href = androidIntent;
          }
          // Trên iOS, thẻ <a> với href=targetUrl (Universal Link) sẽ tự động mở App Shopee
        });
      }

      // Tự động chuyển tiếp thông minh sau 350ms
      setTimeout(function() {
        if (isAndroid && androidIntent) {
          window.location.href = androidIntent;
        } else {
          // Trên iOS và Desktop, sử dụng Universal Link Shopee chính thức
          window.location.href = targetUrl;
        }
      }, 350);
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
