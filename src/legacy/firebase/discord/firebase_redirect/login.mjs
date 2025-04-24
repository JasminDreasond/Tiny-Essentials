// @ts-nocheck

/**
 * Handles Firebase authentication using a custom token, CSRF protection,
 * and final redirection logic after login.
 *
 * This function signs in the user with a custom Firebase token, waits for
 * the auth state to change, retrieves the ID token, sends it to the current
 * server endpoint along with a CSRF token, and then redirects the user to
 * the specified URL or executes a callback.
 *
 * @namespace login
 */
const login = {
  /**
   * Executes the login process with Firebase Auth and handles redirection.
   *
   * @param {string} token - The Firebase custom token used for authentication.
   * @param {string} redirect_url - The relative URL to redirect the user after login.
   *                                If it starts with "/", it will be adjusted.
   * @param {string} csrfToken - A CSRF protection token to be sent to the backend.
   * @param {function} [callback] - Optional callback to be called after authentication.
   *                                Signature: `(err, redirectFunction, user)`
   *                                - If omitted, default redirection is used.
   *
   * @example
   * login.run(firebaseToken, '/dashboard', csrfToken);
   *
   * @example
   * login.run(firebaseToken, '/dashboard', csrfToken, (err, redirect, user) => {
   *   if (err) {
   *     console.error('Login failed:', err);
   *     return;
   *   }
   *   console.log('Logged in as', user.displayName);
   *   redirect(); // manually trigger the redirect
   * });
   */
  run: function (token, redirect_url, csrfToken, callback) {
    // Fix Redirect
    if (typeof redirect_url === 'string') {
      if (redirect_url.startsWith('/')) redirect_url = redirect_url.substring(1);
      else if (redirect_url.startsWith(window.location.origin))
        redirect_url = redirect_url.substring(window.location.origin.length + 1);
    }

    // Nope
    else redirect_url = '';

    // Prepare Redirect
    const final_redirect = function (err, user) {
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
      else callback(err, start_redirect, user);
    };

    // Firebase Auth
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        user
          .getIdToken()
          .then(function (idToken) {
            // Fetch
            fetch(window.location.pathname, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: idToken, csrfToken: csrfToken }),
            })
              .then((response) => {
                response
                  .json()
                  .then((data) => {
                    // Show Error Message
                    if (!data.success) final_redirect(new Error(data.error));
                    // Complete
                    else final_redirect(null, user);
                  })
                  .catch(final_redirect);
              })
              .catch(final_redirect);
          })
          .catch(final_redirect);
      }
    });

    // Sign In
    firebase
      .auth()
      .signInWithCustomToken(token)
      // Fail
      .catch(final_redirect);
  },
};

export default login;
