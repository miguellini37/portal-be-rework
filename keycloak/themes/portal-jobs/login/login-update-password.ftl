<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg("updatePasswordTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body>
  <div class="kc-page">
    <div class="kc-card">

      <h1 class="kc-title">${msg("updatePasswordTitle")}</h1>
      <p class="kc-subtitle">${msg("updatePasswordInstruction")!"Choose a new password for your account."}</p>

      <#if message?has_content && message.type != "warning">
        <div class="kc-alert kc-alert--${message.type}">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <form action="${url.loginAction}" method="post">
        <input type="hidden" name="username" value="${username}" />

        <!-- New Password -->
        <div class="kc-field <#if messagesPerField.existsError('password')>kc-field--error</#if>">
          <label for="password-new">${msg("passwordNew")}</label>
          <div class="kc-password-wrap">
            <input
              type="password"
              id="password-new"
              name="password-new"
              autocomplete="new-password"
              autofocus
            />
            <button type="button" class="kc-eye-btn" onclick="togglePassword('password-new', this)" tabindex="-1" aria-label="Toggle password visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <#if messagesPerField.existsError('password')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
          </#if>
        </div>

        <!-- Confirm New Password -->
        <div class="kc-field <#if messagesPerField.existsError('password-confirm')>kc-field--error</#if>">
          <label for="password-confirm">${msg("passwordConfirm")}</label>
          <div class="kc-password-wrap">
            <input
              type="password"
              id="password-confirm"
              name="password-confirm"
              autocomplete="new-password"
            />
            <button type="button" class="kc-eye-btn" onclick="togglePassword('password-confirm', this)" tabindex="-1" aria-label="Toggle confirm password visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <#if messagesPerField.existsError('password-confirm')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
          </#if>
        </div>

        <#if logout_sessions?? && logout_sessions == "true">
          <div class="kc-field">
            <label class="kc-remember-me">
              <input type="checkbox" name="logout-sessions" value="on" checked />
              ${msg("logoutOtherSessions")}
            </label>
          </div>
        </#if>

        <button type="submit" class="kc-btn-primary">${msg("doSubmit")}</button>
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
