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
  <title>Liên kết mua hàng đã hết hạn | Nàng thơ làm mẹ ♡</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #F8F0E5; color: #725541; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }
    .card { background: #FFFDF8; border: 1px solid #D6BDA5; border-radius: 24px; padding: 36px 24px; max-width: 400px; width: 100%; box-shadow: 0 10px 30px rgba(114, 85, 65, 0.08); }
    .icon { font-size: 40px; margin-bottom: 16px; }
    h2 { font-size: 20px; font-weight: 800; margin-bottom: 10px; color: #725541; }
    p { font-size: 13px; color: #8E7764; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: block; width: 100%; background: linear-gradient(135deg, #A68165, #725541); color: #fff; text-decoration: none; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 15px; box-shadow: 0 6px 20px rgba(166, 129, 101, 0.3); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🌸</div>
    <h2>Liên kết đã hết hạn</h2>
    <p>Đường link này đã hết thời gian lưu tạm trên máy. Bạn vui lòng quay lại dán lại link để mẹ Ngân chuẩn bị link mới nhất nhé ♡</p>
    <a href="/" class="btn">TẠO LINK MỚI NGAY</a>
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
  <title>Đang mở Shopee cùng mẹ Sữa...</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #F8F0E5;
      color: #725541;
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
      background: #FFFDF8;
      border: 1px solid #D6BDA5;
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(114, 85, 65, 0.1);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #EFE0CE;
      color: #725541;
      border: 1px solid #D6BDA5;
      padding: 7px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 22px;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 4px solid #EFE0CE;
      border-top-color: #A68165;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 18px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #725541; }
    p { font-size: 13px; color: #8E7764; line-height: 1.5; margin-bottom: 22px; }
    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      min-height: 50px;
      background: linear-gradient(135deg, #A68165, #725541);
      color: #fff;
      text-decoration: none;
      padding: 14px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 15px;
      box-shadow: 0 6px 20px rgba(166, 129, 101, 0.35);
      margin-bottom: 10px;
      transition: transform 0.15s ease;
    }
    .btn-primary:active {
      transform: scale(0.97);
    }
    .btn-secondary {
      display: block;
      width: 100%;
      background: #F8F0E5;
      border: 1px solid #D6BDA5;
      color: #725541;
      text-decoration: none;
      padding: 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
    }
    .fallback-hint {
      margin-top: 14px;
      font-size: 12px;
      color: #A68F7E;
    }
    .fallback-hint a {
      color: #A68165;
      text-decoration: underline;
      font-weight: 600;
    }
    .tip {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #D6BDA5/30;
      font-size: 11px;
      color: #A68F7E;
      line-height: 1.5;
    }
    .in-app-alert {
      display: none;
      margin-top: 16px;
      padding: 12px;
      border-radius: 14px;
      background: #F8F0E5;
      border: 1px solid #D6BDA5;
      color: #725541;
      font-size: 12px;
      text-align: left;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🌸 Ưu đãi đối tác giảm ${escapeHtmlText(String(discountPercentage))}% (Tối đa ${escapeHtmlText(maxDiscountAmount)})</div>
    <div class="spinner"></div>
    <h2>Đang Mở Shopee Cùng Mẹ Sữa</h2>
    <p>Góc nhỏ của mẹ Ngân đang chuẩn bị liên kết mua hàng cho bạn nhé ♡</p>
    
    <a href="${escapeHtmlAttr(targetWithVoucherUrl)}" class="btn-primary" id="openAppBtn">MỞ XEM TRÊN SHOPEE</a>
    <a href="${escapeHtmlAttr(targetWithVoucherUrl)}" class="btn-secondary" id="openWebBtn">Tiếp tục trên Trình duyệt Web</a>

    <div class="fallback-hint">
      Chưa thấy mở App? <a href="${escapeHtmlAttr(deepLink)}" id="forceOpenApp">Bấm vào đây để mở App</a>
    </div>

    <div id="inAppNotice" class="in-app-alert">
      💡 <b>Mẹo mở nhanh:</b> Nếu bạn đang xem trong TikTok / Facebook, hãy bấm dấu <b>⋯</b> ở góc trên cùng và chọn <b>"Mở bằng trình duyệt Safari/Chrome"</b> để vào thẳng App Shopee nhé ♡.
    </div>

    <div class="tip">
      🛡️ Thanh toán trực tiếp trong Shopee App • Giữ nguyên quyền lợi bảo hành chính hãng
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

      var forceBtn = document.getElementById('forceOpenApp');
      if (forceBtn) {
        forceBtn.addEventListener('click', function(e) {
          if (isAndroid && androidIntent) {
            e.preventDefault();
            window.location.href = androidIntent;
          }
        });
      }

      // Tự động chuyển tiếp thông minh sau 350ms
      setTimeout(function() {
        if (isAndroid && androidIntent) {
          window.location.href = androidIntent;
        } else {
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
