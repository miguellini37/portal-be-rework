<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg("errorTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body>
  <div class="kc-page">
    <div class="kc-card">

      <!-- Error icon -->
      <div class="kc-verify-icon kc-verify-icon--error">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6"/>
          <path d="m9 9 6 6"/>
        </svg>
      </div>

      <h1 class="kc-title">${msg("errorTitle")}</h1>

      <#if message?has_content>
        <div class="kc-alert kc-alert--error">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <#if skipLink?? && skipLink>
      <#else>
        <p class="kc-back-link"><a href="${url.loginRestartFlowUrl}">${msg("backToLogin")}</a></p>
        <#if client?? && client.baseUrl?has_content>
          <p class="kc-back-link"><a href="${client.baseUrl}">${msg("backToApplication")}</a></p>
        </#if>
      </#if>

    </div>
  </div>
</body>
</html>
