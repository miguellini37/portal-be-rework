<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg("emailForgotTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body>
  <div class="kc-page">
    <div class="kc-card">

      <h1 class="kc-title">${msg("emailForgotTitle")}</h1>
      <p class="kc-subtitle">${msg("emailInstruction")}</p>

      <#if message?has_content && message.type != "warning">
        <div class="kc-alert kc-alert--${message.type}">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <form action="${url.loginAction}" method="post">
        <div class="kc-field <#if messagesPerField.existsError('username')>kc-field--error</#if>">
          <label for="username">
            <#if !realm.loginWithEmailAllowed>${msg("username")}
            <#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}
            <#else>${msg("email")}
            </#if>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value="${(auth.attemptedUsername!'')}"
            autocomplete="username"
            autofocus
          />
          <#if messagesPerField.existsError('username')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
          </#if>
        </div>

        <button type="submit" class="kc-btn-primary">${msg("doSubmit")}</button>

        <p class="kc-back-link">
          <a href="${url.loginUrl}">${msg("backToLogin")}</a>
        </p>
      </form>

    </div>
  </div>
</body>
</html>
