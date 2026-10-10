import { NextRequest, NextResponse } from 'next/server';
import { getVoucherShimBySlug } from '@/lib/shopee/voucher-shim';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const shim = await getVoucherShimBySlug(slug);

  if (!shim) {
    // Không tìm thấy slug hoặc đã hết hạn -> redirect về trang chủ
    return NextResponse.redirect(new URL('/', req.url));
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
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
    <div class="badge">🎁 Voucher Giảm ${discountPercentage}% (Tối đa ${maxDiscountAmount})</div>
    <div class="spinner"></div>
    <h2>Đang Mở Ứng Dụng Shopee</h2>
    <p>Hệ thống đang tự động kích hoạt mã ưu đãi độc quyền cho đơn hàng của bạn...</p>
    
    <a href="${targetWithVoucherUrl}" class="btn-primary" id="openAppBtn">MỞ APP SHOPEE NGAY</a>
    <a href="${targetWithVoucherUrl}" class="btn-secondary" id="openWebBtn">Tiếp tục trên Trình duyệt Web</a>

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
      var targetUrl = ${JSON.stringify(targetWithVoucherUrl)};
      var deepLink = ${JSON.stringify(deepLink)};
      var androidIntent = ${JSON.stringify(androidIntent)};

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
