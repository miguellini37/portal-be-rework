<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg("emailVerifyTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body>
  <div class="kc-page">
    <div class="kc-card">

      <!-- Email icon -->
      <div class="kc-verify-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      </div>

      <h1 class="kc-title">${msg("emailVerifyTitle")}</h1>
      <p class="kc-subtitle">${msg("emailVerifyInstruction1", user.email)}</p>

      <div class="kc-alert kc-alert--info">
        ${msg("emailVerifyInstruction2")}
        <a href="${url.loginAction}" class="kc-verify-resend">${msg("doClickHere")}</a>
        ${msg("emailVerifyInstruction3")}
      </div>

      <p class="kc-back-link">
        <a href="${url.loginUrl}">${msg("backToLogin")}</a>
      </p>

    </div>
  </div>
</body>
</html>
