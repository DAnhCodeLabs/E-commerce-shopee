export const otpEmailTemplate = (otp) => {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Email OTP — Xác thực an toàn</title>
  <style>
    /* Reset & base */
    body,table,td{margin:0;padding:0;border:0;font-family:Inter, 'Segoe UI', Roboto, Arial, sans-serif;background:#f6f9fc;color:#0b1220}
    img{border:0;display:block;max-width:100%}
    a{text-decoration:none}

    /* Layout */
    .wrap{width:100%;padding:48px 12px;background:linear-gradient(180deg,#eef6ff 0%,#fbfdff 100%)}
    .container{max-width:720px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(9,30,66,0.06)}

    /* Header */
    .header{display:flex;align-items:center;justify-content:space-between;padding:18px 26px;background:linear-gradient(90deg,#0ea5e9 0%,#7c3aed 60%);color:#fff}
    .brand{display:flex;align-items:center;gap:14px}
    .logo{height:56px;width:auto;border-radius:10px;background:rgba(255,255,255,0.04);padding:4px;display:flex;align-items:center}
    .sitename{font-weight:800;font-size:18px}
    .trust{font-size:12px;background:rgba(255,255,255,0.12);padding:6px 10px;border-radius:999px}

    /* Preheader for inbox preview */
    .preheader{display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden}

    /* Hero */
    .hero{display:flex;gap:20px;align-items:center;padding:26px 28px;background:linear-gradient(180deg,#ffffff,#fbfdff)}
    .hero-left{flex:1}
    .heading{margin:0;font-size:22px;font-weight:800;color:#071034}
    .sub{margin:10px 0 0;font-size:14px;color:#475569;line-height:1.6}

    /* Action summary */
    .summary{display:flex;gap:12px;margin-top:14px}
    .step{flex:1;padding:12px;border-radius:10px;background:linear-gradient(180deg,#f8fbff,#ffffff);box-shadow:0 8px 18px rgba(12,24,60,0.04);font-size:13px;color:#1f2937}
    .step strong{display:block;font-weight:800;margin-bottom:6px}

    /* Visual column */
    .visual{width:140px;display:flex;flex-direction:column;align-items:center;justify-content:center}
    .badge{width:118px;height:118px;border-radius:18px;background:linear-gradient(135deg,#60a5fa,#7c3aed);display:flex;align-items:center;justify-content:center;box-shadow:0 20px 40px rgba(37,99,235,0.10)}
    .badge svg{width:84px;height:84px}
    .caption{margin-top:10px;font-size:12px;color:#e6eefc}
    .hero-right{width:140px;display:flex;align-items:center;justify-content:center;position:relative}
    .confetti{position:absolute;inset:0;pointer-events:none}
    .shield-wrap{width:110px;height:110px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#60a5fa,#7c3aed);box-shadow:0 18px 40px rgba(37,99,235,0.12);transform:translateY(0);animation:float 5s ease-in-out infinite}

    @keyframes float{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}

    /* OTP area (single-line) */
    .otp-area{padding:26px 28px 18px;text-align:center}
    .panel{display:inline-block;width:100%;max-width:580px;padding:22px;border-radius:14px;background:linear-gradient(180deg,#ffffff,#f6fbff);box-shadow:0 18px 44px rgba(14,42,125,0.06);border:1px solid rgba(15,23,42,0.04)}

    .otp-code{display:block;margin:6px auto 12px;padding:18px 26px;border-radius:12px;background:linear-gradient(90deg,#eff6ff,#ffffff);font-family:'Courier New',monospace;font-size:36px;font-weight:900;letter-spacing:6px;color:#071034;box-shadow:0 18px 42px rgba(12,24,60,0.08);max-width:420px;text-align:center;user-select:text}
    .otp-sub{font-size:13px;color:#475569;margin-top:6px}

    /* Expiry and progress */
    .meta-row{display:flex;justify-content:center;align-items:center;gap:16px;margin-top:12px}
    .expiry{height:8px;border-radius:999px;background:rgba(14,42,125,0.06);overflow:hidden;width:240px}
    .expiry .bar{height:100%;background:linear-gradient(90deg,#34d399,#60a5fa);width:100%;animation:countdown 300s linear forwards}
    @keyframes countdown{from{width:100%}to{width:0%}}
    .time-left{font-size:13px;color:#6b7280}

    /* Helpful actions */
    .actions{display:flex;gap:12px;justify-content:center;margin-top:18px}
    .btn{display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:12px;background:linear-gradient(90deg,#0ea5e9,#7c3aed);color:#fff;font-weight:800;font-size:14px;box-shadow:0 12px 36px rgba(124,58,237,0.12);border:none;cursor:pointer}
    .btn.alt{background:#fff;color:#071034;border:1px solid rgba(15,23,42,0.06)}
    .btn.copy svg{width:16px;height:16px;opacity:0.98}
    .copy-feedback{display:inline-block;margin-left:8px;font-size:13px;color:#10b981;opacity:0;transition:opacity .24s}

    /* Details and tips */
    .details{padding:18px 28px 30px;font-size:13px;color:#475569;border-top:1px solid #eef6ff;background:#fbfdff}
    .details ul{margin:8px 0 0 18px;padding:0}
    .details li{margin:6px 0}
    .small{font-size:12px;color:#94a3b8;margin-top:10px}

    /* Footer */
    .footer{padding:18px 28px 28px;font-size:12px;color:#94a3b8;text-align:center}

    /* Responsive */
    @media (max-width:640px){
      .hero{flex-direction:column;align-items:flex-start}
      .visual{width:100%}
      .summary{flex-direction:column}
      .expiry{width:180px}
      .otp-code{font-size:28px;padding:14px 18px;letter-spacing:4px}
      .badge svg{width:64px;height:64px}
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce){
      .expiry .bar{animation:none}
    }

  </style>
</head>
<body>
  <span class="preheader">Mã xác thực của bạn tại Shopee. Mã có hiệu lực 10 phút.</span>

  <table class="wrap" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table class="container" width="100%" cellpadding="0" cellspacing="0" role="presentation">

          <tr>
            <td class="header">
              <div class="brand">
                <div class="sitename">SHOPEE</div>
              </div>
              <div class="trust">Bảo mật cao</div>
            </td>
          </tr>

          <tr>
            <td class="hero">
              <div class="hero-left">
                <h2 class="heading">Mã xác thực an toàn</h2>
                <p class="sub">Bạn vừa yêu cầu mã xác thực Email. Nhập mã bên dưới trên trang xác thực. Mã chỉ có hiệu lực trong <strong>10 phút</strong>.</p>

                <div class="summary" role="list">
                  <div class="step" role="listitem"><strong>Bước 1</strong> Mở trang xác thực và nhập mã.</div>
                  <div class="step" role="listitem"><strong>Bước 2</strong> Nếu không hợp lệ, yêu cầu mã mới.</div>
                  <div class="step" role="listitem"><strong>Bước 3</strong> Nếu bạn không yêu cầu, báo cáo cho chúng tôi.</div>
                </div>
              </div>

              <div class="visual">
                <div class="hero-right">
                <svg class="confetti" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g transform="translate(10,10)"><rect x="0" y="0" width="6" height="8" rx="1" fill="#f97316"/></g>
                  <g transform="translate(40,8)"><rect x="0" y="0" width="6" height="8" rx="1" fill="#60a5fa"/></g>
                  <g transform="translate(80,6)"><rect x="0" y="0" width="6" height="8" rx="1" fill="#34d399"/></g>
                  <g transform="translate(110,18)"><rect x="0" y="0" width="6" height="8" rx="1" fill="#fb7185"/></g>
                  <g transform="translate(20,34)"><rect x="0" y="0" width="6" height="8" rx="1" fill="#f472b6"/></g>
                </svg>

                <div class="shield-wrap" aria-hidden="true">
                  <svg class="shield-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="s1" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>
                      <linearGradient id="s2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0.6"/></linearGradient>
                    </defs>
                    <path d="M32 4l18 6v11c0 11-7.5 22-18 26-10.5-4-18-15-18-26V10z" fill="url(#s1)"/>
                    <path d="M32 10l12 4v9c0 9-6.5 18-12 21-5.5-3-12-12-12-21V14z" fill="url(#s2)" opacity="0.95"/>
                    <circle cx="32" cy="28" r="7" fill="#fff"/>
                    <path d="M32 25v6M29 28h6" stroke="#071034" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
            </td>
          </tr>

          <tr>
            <td class="otp-area">
              <div class="panel">
                <!-- Single-line OTP display -->
                <div id="otp-code" class="otp-code" role="text" aria-label="Mã xác thực">${otp}</div>
                <div class="otp-sub">Mã dùng một lần. Không chia sẻ mã này cho bất kỳ ai.</div>

                <div class="meta-row">
                  <div class="expiry" aria-hidden="true"><div class="bar"></div></div>
                </div>

              </div>
            </td>
          </tr>

          <tr>
            <td class="details">
              <strong>Chi tiết & hướng dẫn</strong>
              <ul>
                <li>Nhập đúng mã trên trang xác thực. Mỗi mã chỉ dùng một lần.</li>
                <li>Nếu bạn không nhận được mã trong 2 phút, thử gửi lại (trang xác thực có nút "Gửi lại mã").</li>
                <li>Không chia sẻ mã, mã có thể bị kẻ xấu dùng để truy cập tài khoản.</li>
                <li>Nếu bạn không yêu cầu mã này, thay đổi mật khẩu và liên hệ hỗ trợ ngay.</li>
              </ul>
              <div class="small">Email được gửi từ: no-reply@example.com · Hỗ trợ: support@example.com</div>
            </td>
          </tr>

          <tr>
            <td class="footer">
              © 2025 Shopee. Địa chỉ trụ sở chính. Mọi quyền được bảo lưu.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
