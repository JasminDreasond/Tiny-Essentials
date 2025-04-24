// @ts-nocheck

/**
 * Handles the logout process by signing out from Firebase Auth,
 * verifying CSRF token, and redirecting the user.
 *
 * The `run` function signs out the user, sends a logout request to the server
 * along with CSRF protection, and then redirects the user to the specified URL
 * or executes a custom callback.
 *
 * @namespace logout
 */
const logout = {
  /**
   * Executes the logout process, verifying CSRF token, signing out
   * the user, and handling redirection.
   *
   * @param {string} token - The authentication token used to identify the user.
   * @param {string} redirect_url - The relative URL to redirect the user after logout.
   *                                If it starts with "/", it will be adjusted.
   * @param {string} csrfToken - The CSRF token provided in the request.
   * @param {string} original_csrfToken - The CSRF token that was initially generated.
   * @param {function} [callback] - Optional callback to be called after logout.
   *                                Signature: `(err, redirectFunction)`
   *                                - If omitted, default redirection is used.
   *
   * @example
   * logout.run(userToken, '/home', csrfToken, originalCsrfToken);
   *
   * @example
   * logout.run(userToken, '/home', csrfToken, originalCsrfToken, (err, redirect) => {
   *   if (err) {
   *     console.error('Logout failed:', err);
   *     return;
   *   }
   *   console.log('Logged out successfully');
   *   redirect(); // manually trigger the redirect
   * });
   */
  run: function (token, redirect_url, csrfToken, original_csrfToken, callback) {
    // Compare CSRF Token
    if (original_csrfToken.length < 1 || original_csrfToken === csrfToken) {
      // Fix Redirect
      if (typeof redirect_url === 'string') {
        if (redirect_url.startsWith('/')) redirect_url = redirect_url.substring(1);
      }

      // Nope
      else redirect_url = '';

      // Prepare Redirect
      const final_redirect = function (err) {
        // The Redirect
        const start_redirect = function () {
          window.location.href = window.location.origin + '/' + redirect_url;
        };

        // Default Redirect
        if (typeof callback !== 'function') {
          // Show Error
          if (err) alert(err.message);
          // Redirect Now
          start_redirect();
        }

        // Custom Redirect
        else callback(err, start_redirect);
      };

      // Sign Out
      firebase
        .auth()
        .signOut()
        // Success
        .then(() => {
          fetch(window.location.pathname, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token, csrfToken: csrfToken }),
          })
            .then((response) => {
              response
                .json()
                .then(() => final_redirect())
                .catch(final_redirect);
            })
            .catch(final_redirect);
        })
        // Fail
        .catch(final_redirect);
    }
    // Invalid
    else final_redirect(new Error('Invalid csrfToken!'));
  },
};

export default logout;
