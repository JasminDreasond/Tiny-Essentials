// Prepare Module
class AuthSystem {
  // Constructor
  constructor() {
    // Default Values
    this.default = {
      // Check Auth Time
      checkAuthTime: (decodedIdToken) => {
        // Only process if the user just signed in in the last 5 minutes.
        if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) return true;
        // Nope
        else return false;
      },

      // Cookie Time Generator
      cookieTimeGenerator: () => {
        // Set session expiration to 5 days.
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        // Create the session cookie. This will also verify the ID token in the process.
        // The session cookie will have the same claims as the ID token.
        // To only allow session cookie setting on recent sign-in, auth_time in ID token
        // can be checked to ensure user was recently signed in before creating a session cookie.

        // Complete
        return expiresIn;
      },
    };

    // Set Value
    this.checkAuthTime = this.default.checkAuthTime;
    this.cookieTimeGenerator = this.default.cookieTimeGenerator;
  }

  // Check Auth Time
  setCookieTimeGenerator(callback) {
    if (typeof callback === 'function') this.cookieTimeGenerator = callback;
  }

  // Check Auth Time
  setCheckAuthTime(callback) {
    if (typeof callback === 'function') this.checkAuthTime = callback;
  }

  // Cookie Session Generator
  genCookieSession(auth, token) {
    const tinyThis = this;
    return new Promise(function (resolve, reject) {
      auth
        .verifyIdToken(token)
        .then(async (decodedIdToken) => {
          // Try
          try {
            // Check Time
            const checkedTime = await tinyThis.checkAuthTime(decodedIdToken);
            if (checkedTime) {
              // Create Session
              const expiresIn = await tinyThis.cookieTimeGenerator(decodedIdToken);
              auth.createSessionCookie(token, { expiresIn }).then(resolve).catch(reject);
            }

            // Nope
            else {
              const err = new Error('Invalid Account ID Token Time.');
              err.code = 401;
              reject(err);
            }
          } catch (err) {
            // Fail
            reject(err);
          }
        })
        .catch(reject);
    });
  }
}

// Module
export default AuthSystem;
