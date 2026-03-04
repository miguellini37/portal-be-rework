<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg("registerTitle")}</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body>
  <div class="kc-page">
    <div class="kc-card">

      <h1 class="kc-title">${msg("registerTitle")}</h1>
      <p class="kc-subtitle">* Required fields</p>

      <#if message?has_content && message.type != "warning">
        <div class="kc-alert kc-alert--${message.type}">
          ${kcSanitize(message.summary)?no_esc}
        </div>
      </#if>

      <form id="kc-register-form" action="${url.registrationAction}" method="post">

        <!-- Profile Type (top, defaults to athlete) -->
        <div class="kc-field <#if messagesPerField.existsError('user.attributes.permission')>kc-field--error</#if>">
          <label for="user.attributes.permission">${msg("profile.attributes.permission")} <span class="kc-required">*</span></label>
          <select id="user.attributes.permission" name="user.attributes.permission">
            <option value="athlete" <#if (register.formData['user.attributes.permission']!'athlete') == 'athlete'>selected</#if>>${msg("permission-option-athlete")}</option>
            <option value="company" <#if (register.formData['user.attributes.permission']!'') == 'company'>selected</#if>>${msg("permission-option-company")}</option>
            <option value="school" <#if (register.formData['user.attributes.permission']!'') == 'school'>selected</#if>>${msg("permission-option-school")}</option>
          </select>
          <#if messagesPerField.existsError('user.attributes.permission')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('user.attributes.permission'))?no_esc}</span>
          </#if>
        </div>

        <!-- Email -->
        <div class="kc-field <#if messagesPerField.existsError('email')>kc-field--error</#if>">
          <label for="email">${msg("email")} <span class="kc-required">*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            value="${(register.formData.email!'')}"
            autocomplete="email"
            autofocus
          />
          <#if messagesPerField.existsError('email')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('email'))?no_esc}</span>
          </#if>
        </div>

        <!-- Password -->
        <div class="kc-field <#if messagesPerField.existsError('password')>kc-field--error</#if>">
          <label for="password">${msg("password")} <span class="kc-required">*</span></label>
          <div class="kc-password-wrap">
            <input type="password" id="password" name="password" autocomplete="new-password" />
            <button type="button" class="kc-eye-btn" onclick="togglePassword('password', this)" tabindex="-1" aria-label="Toggle password visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <#if messagesPerField.existsError('password')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
          </#if>
        </div>

        <!-- Confirm Password -->
        <div class="kc-field <#if messagesPerField.existsError('password-confirm')>kc-field--error</#if>">
          <label for="password-confirm">${msg("passwordConfirm")} <span class="kc-required">*</span></label>
          <div class="kc-password-wrap">
            <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password" />
            <button type="button" class="kc-eye-btn" onclick="togglePassword('password-confirm', this)" tabindex="-1" aria-label="Toggle confirm password visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <#if messagesPerField.existsError('password-confirm')>
            <span class="kc-field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
          </#if>
        </div>

        <!-- First + Last name row -->
        <div class="kc-name-row">
          <div class="kc-field <#if messagesPerField.existsError('firstName')>kc-field--error</#if>">
            <label for="firstName">${msg("firstName")} <span class="kc-required">*</span></label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value="${(register.formData.firstName!'')}"
              autocomplete="given-name"
            />
            <#if messagesPerField.existsError('firstName')>
              <span class="kc-field-error">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span>
            </#if>
          </div>

          <div class="kc-field <#if messagesPerField.existsError('lastName')>kc-field--error</#if>">
            <label for="lastName">${msg("lastName")} <span class="kc-required">*</span></label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value="${(register.formData.lastName!'')}"
              autocomplete="family-name"
            />
            <#if messagesPerField.existsError('lastName')>
              <span class="kc-field-error">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span>
            </#if>
          </div>
        </div>

        <button type="submit" class="kc-btn-primary">${msg("doRegister")}</button>

        <p class="kc-back-link">
          <a href="${url.loginUrl}">${msg("backToLogin")}</a>
        </p>

      </form>
    </div>
  </div>

  <script>
    // Pre-fill profile type from ?profileType=athlete|company|school URL param
    // Only applies on fresh load (no server-side form data from a prior submit)
    (function () {
      var select = document.getElementById('user.attributes.permission');
      var param = new URLSearchParams(window.location.search).get('profileType');
      var valid = ['athlete', 'company', 'school'];
      if (param && valid.indexOf(param.toLowerCase()) !== -1) {
        select.value = param.toLowerCase();
      }
    })();

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

    // Email validation based on account type
    (function () {
      var blockedDomains = [
        'gmail.com', 'googlemail.com',
        'hotmail.com', 'hotmail.co.uk',
        'outlook.com', 'outlook.co.uk',
        'live.com', 'live.co.uk',
        'msn.com',
        'yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au',
        'ymail.com',
        'aol.com',
        'icloud.com', 'me.com', 'mac.com',
        'protonmail.com', 'proton.me',
        'zoho.com',
        'mail.com',
        'gmx.com', 'gmx.net'
      ];

      var select = document.getElementById('user.attributes.permission');
      var emailInput = document.getElementById('email');
      var emailField = emailInput.closest('.kc-field');
      var form = document.getElementById('kc-register-form');

      // Create the inline error element (hidden by default)
      var errorSpan = document.createElement('span');
      errorSpan.className = 'kc-field-error';
      errorSpan.style.display = 'none';
      emailField.appendChild(errorSpan);

      function getEmailDomain(email) {
        var parts = email.split('@');
        return parts.length === 2 ? parts[1].toLowerCase().trim() : '';
      }

      function validate() {
        var accountType = select.value;
        var email = emailInput.value.trim();
        var domain = getEmailDomain(email);

        // Reset
        errorSpan.style.display = 'none';
        errorSpan.textContent = '';
        emailField.classList.remove('kc-field--error');

        if (!email) {
          return true; // Let Keycloak handle empty field
        }

        if (accountType === 'school') {
          if (!domain.endsWith('.edu')) {
            errorSpan.textContent = 'University accounts require a .edu email address.';
            errorSpan.style.display = '';
            emailField.classList.add('kc-field--error');
            return false;
          }
        }

        if (accountType === 'company') {
          if (blockedDomains.indexOf(domain) !== -1) {
            errorSpan.textContent = 'Company accounts require a company email address. Personal email providers (Gmail, Hotmail, etc.) are not allowed.';
            errorSpan.style.display = '';
            emailField.classList.add('kc-field--error');
            return false;
          }
        }

        return true;
      }

      // Re-validate when account type or email changes
      select.addEventListener('change', validate);
      emailInput.addEventListener('input', validate);
      emailInput.addEventListener('blur', validate);

      // Block form submission if invalid
      form.addEventListener('submit', function (e) {
        if (!validate()) {
          e.preventDefault();
        }
      });

      // Run on load in case of server-side re-render with pre-filled values
      validate();

      // Pre-select profile type from ?role= query param (e.g. from landing page buttons)
      var urlParams = new URLSearchParams(window.location.search);
      var roleParam = urlParams.get('role');
      if (roleParam && ['athlete', 'company', 'school'].indexOf(roleParam) !== -1) {
        select.value = roleParam;
        select.dispatchEvent(new Event('change'));
      }
    })();
  </script>
</body>
</html>
