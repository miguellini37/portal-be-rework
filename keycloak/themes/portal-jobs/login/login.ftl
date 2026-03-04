<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg("loginAccountTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body>
  <div class="kc-page">
    <div class="kc-card">

      <h1 class="kc-title">${msg("loginAccountTitle")}</h1>

      <#if message?has_content && message.type != "warning">
        <div class="kc-alert kc-alert--${message.type}">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <form id="kc-form-login" action="${url.loginAction}" method="post">

        <!-- Email / Username -->
        <div class="kc-field <#if messagesPerField.existsError('username','password')>kc-field--error</#if>">
          <label for="username">${msg("email")}</label>
          <input
            type="text"
            id="username"
            name="username"
            value="${(login.username!'')}"
            autocomplete="username"
            autofocus
          />
        </div>

        <!-- Password -->
        <div class="kc-field <#if messagesPerField.existsError('username','password')>kc-field--error</#if>">
          <label for="password">${msg("password")}</label>
          <div class="kc-password-wrap">
            <input type="password" id="password" name="password" autocomplete="current-password" />
            <button type="button" class="kc-eye-btn" onclick="togglePassword('password', this)" tabindex="-1" aria-label="Toggle password visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <#if messagesPerField.existsError('username','password')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
          </#if>
        </div>

        <!-- Remember me + Forgot password -->
        <div class="kc-form-options">
          <#if realm.rememberMe && !usernameEditDisabled??>
            <label class="kc-remember-me">
              <input type="checkbox" name="rememberMe" <#if login.rememberMe??>checked</#if> />
              ${msg("rememberMe")}
            </label>
          </#if>
          <#if realm.resetPasswordAllowed>
            <a href="${url.loginResetCredentialsUrl}" class="kc-forgot">${msg("doForgotPassword")}</a>
          </#if>
        </div>

        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if> />

        <button type="submit" class="kc-btn-primary">${msg("doLogIn")}</button>

        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
          <p class="kc-register-link">
            ${msg("noAccount")} <a href="${url.registrationUrl}">${msg("doRegister")}</a>
          </p>
        </#if>

      </form>
    </div>
  </div>

  <script>
    function togglePassword(fieldId, btn) {
      var input = document.getElementById(fieldId);
      if (input.type === 'password') {
        input.type = 'text';
        btn.classList.add('kc-eye-btn--visible');
      } else {
        input.type = 'password';
        btn.classList.remove('kc-eye-btn--visible');
      }
    }
  </script>
</body>
</html>
