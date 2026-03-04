<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg("infoTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body>
  <div class="kc-page">
    <div class="kc-card">

      <!-- Check icon -->
      <div class="kc-verify-icon kc-verify-icon--success">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>

      <h1 class="kc-title">${msg("infoTitle")}</h1>

      <#if message?has_content>
        <div class="kc-alert kc-alert--info">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <#if requiredActions??>
        <ul class="kc-info-list">
          <#list requiredActions as reqAction>
            <li>${msg("requiredAction.${reqAction}")}</li>
          </#list>
        </ul>
      </#if>

      <#if skipLink??>
      <#else>
        <#if pageRedirectUri?has_content>
          <p class="kc-back-link"><a href="${pageRedirectUri}">${msg("backToApplication")}</a></p>
        <#elseif actionUri?has_content>
          <p class="kc-back-link"><a href="${actionUri}">${msg("proceedWithAction")}</a></p>
        <#elseif (client.baseUrl)?has_content>
          <p class="kc-back-link"><a href="${client.baseUrl}">${msg("backToApplication")}</a></p>
        </#if>
      </#if>

    </div>
  </div>
</body>
</html>
