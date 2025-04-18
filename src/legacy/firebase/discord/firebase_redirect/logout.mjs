const logout = {
  // Run Function
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
