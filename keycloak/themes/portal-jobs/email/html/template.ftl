<#macro emailLayout>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
    }
    .wrapper {
      width: 100%;
      padding: 40px 16px;
      background-color: #f3f4f6;
    }
    .card {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    }
    .header {
      background: linear-gradient(135deg, hsl(221,70%,22%) 0%, hsl(221,68%,36%) 100%);
      padding: 28px 32px;
      text-align: center;
    }
    .header-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .body {
      padding: 32px;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
    }
    .body a {
      color: hsl(221.2, 83.2%, 53.3%);
      text-decoration: none;
      font-weight: 500;
    }
    .body a:hover {
      text-decoration: underline;
    }
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 24px 0 20px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 32px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      line-height: 1.6;
      text-align: center;
    }
    .footer a {
      color: hsl(221.2, 83.2%, 53.3%);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <p class="header-title">Portal Jobs</p>
      </div>
      <div class="body">
        <#nested>
        <hr class="divider" />
      </div>
      <div class="footer">
        This is an automated message &mdash; please do not reply to this email. Replies are not monitored.<br />
        If you need help, contact us at <a href="mailto:help@portaljobs.net">help@portaljobs.net</a>.<br /><br />
        &copy; ${.now?string("yyyy")} Portal Jobs. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
</#macro>
