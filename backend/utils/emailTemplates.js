export const otpEmailTemplate = (otp) => {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
html,body{margin:0;padding:0;background:#f4f6f9;font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#0f1724}
a{color:inherit;text-decoration:none}
.container{width:100%;padding:28px 16px}
.card{max-width:680px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 12px 30px rgba(14,22,34,0.08);border:1px solid rgba(15,23,36,0.04)}
.header{padding:28px 32px;background:linear-gradient(120deg,#5b6bf6 0%,#7c5cf6 40%,#8fb7ff 100%);color:#fff;display:flex;align-items:center;gap:16px}
.logo{width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#ffffff22,#ffffff11);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;box-shadow:0 6px 18px rgba(11,20,45,0.12) inset}
.brand-title{font-size:20px;font-weight:700;line-height:1}
.brand-sub{font-size:13px;opacity:0.95;margin-top:4px}
.body{padding:30px 36px 22px}
.greeting{font-size:16px;font-weight:600;margin-bottom:8px}
.lead{color:#334155;font-size:15px;line-height:1.6;margin-bottom:20px}
.otp-row{display:flex;flex-wrap:wrap;align-items:center;gap:18px;margin:18px 0 8px}
.otp-badge{background:#081226;color:#fff;padding:16px 28px;border-radius:12px;font-family: "Courier New",Courier,monospace;font-size:30px;font-weight:800;letter-spacing:8px;box-shadow:0 6px 18px rgba(12,20,40,0.12)}
.meta{color:#64748b;font-size:13px;margin-top:10px}
.divider{height:1px;background:linear-gradient(90deg,transparent,#eef2ff,transparent);margin:22px 0;border-radius:2px}
.footer{background:#fbfdff;padding:18px 36px;border-top:1px dashed #eef2ff;color:#6b7280;font-size:13px;text-align:center}
.link{color:#4753ff;font-weight:600}
</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div>
          <div class="brand-title">Shopee</div>
          <div class="brand-sub">Mã xác thực an toàn</div>
        </div>
      </div>
      <div class="body">
        <div class="greeting">Xin chào,</div>
        <div class="lead">Bạn hoặc ai đó vừa yêu cầu mã xác thực cho tài khoản Shoppe. Vui lòng sử dụng mã bên dưới để hoàn tất quá trình xác thực.</div>
        <div class="otp-row"><div class="otp-badge">${otp}</div></div>
        <div class="meta">Mã chỉ có hiệu lực trong 10 phút và sẽ tự hủy sau khi sử dụng.</div>
        <div class="meta">Nếu không phải bạn thực hiện yêu cầu này, vui lòng bỏ qua tin nhắn này.</div>

      <div class="footer">
        <div>Bạn nhận mail này vì có yêu cầu xác thực tại Shopee.</div>
        <div style="font-size:12px;color:#94a3b8">Shopee · <a href="#" class="link">Shopee.example</a> · <a href="mailto:support@Shopee.example" class="link">support@Shopee.example</a></div>
        <div style="margin-top:8px;font-size:11px;color:#b0bccb">Nếu bạn không muốn nhận email xác thực, kiểm tra cài đặt tài khoản hoặc liên hệ hỗ trợ.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
};
