const login = {
  // Run Function
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
