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

  const { deepLink, targetWithVoucherUrl, discountPercentage, maxDiscountAmount } = shim;

  // HTML Bridge Page siêu nhẹ chuyển tiếp mượt mà
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
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
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      background: rgba(238, 77, 45, 0.15);
      color: #ff6b4a;
      border: 1px solid rgba(238, 77, 45, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
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
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #fff; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .btn-primary {
      display: block;
      width: 100%;
      background: linear-gradient(135deg, #ee4d2d, #ff5722);
      color: #fff;
      text-decoration: none;
      padding: 14px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 15px rgba(238, 77, 45, 0.4);
      margin-bottom: 12px;
    }
    .btn-secondary {
      display: block;
      width: 100%;
      background: transparent;
      color: #94a3b8;
      text-decoration: none;
      padding: 10px;
      border-radius: 12px;
      font-size: 13px;
    }
    .tip {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🎁 Mã Giảm ${discountPercentage}% (Tối đa ${maxDiscountAmount})</div>
    <div class="spinner"></div>
    <h2>Đang mở Ứng dụng Shopee</h2>
    <p>Hệ thống đang tự động kích hoạt mã ưu đãi độc quyền cho đơn hàng của bạn...</p>
    
    <a href="${deepLink}" class="btn-primary" id="openAppBtn">Mở Ứng Dụng Shopee Ngay</a>
    <a href="${targetWithVoucherUrl}" class="btn-secondary" id="openWebBtn">Tiếp tục trên Trình duyệt Web</a>

    <div class="tip">
      💡 Nếu mở từ TikTok / Facebook: Bấm biểu tượng <b>⋯</b> ở góc trên và chọn <b>"Mở bằng trình duyệt"</b> để tránh mất mã giảm giá.
    </div>
  </div>

  <script>
    (function() {
      var deepLink = ${JSON.stringify(deepLink)};
      var fallbackUrl = ${JSON.stringify(targetWithVoucherUrl)};
      var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        // Tự động kích hoạt Deep Link đánh thức App
        window.location.href = deepLink;

        // Nếu sau 1.8 giây app không mở (chưa cài app), fallback sang trang web
        setTimeout(function() {
          window.location.href = fallbackUrl;
        }, 1800);
      } else {
        // Trên Desktop, tự động mở web sau 0.8 giây
        setTimeout(function() {
          window.location.href = fallbackUrl;
        }, 800);
      }
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
