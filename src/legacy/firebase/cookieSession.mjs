// @ts-nocheck

/**
 * Class representing an authentication system for generating session cookies.
 *
 * The AuthSystem handles checking the authentication time and generating session cookies based on
 * ID token verification. It supports custom time checking and cookie generation logic.
 *
 * @class AuthSystem
 */
class AuthSystem {
  /**
   * Creates an instance of AuthSystem.
   * Initializes default configurations for authentication time checking and session cookie expiration.
   *
   * @constructor
   */
  constructor() {
    this.auth_time = 5;

    // Default Values
    const authSystem = this;
    this.default = {
      /**
       * Checks whether the authentication time is within the last 5 minutes.
       *
       * @param {Object} decodedIdToken - The decoded ID token object.
       * @param {number} decodedIdToken.auth_time - The authentication time from the ID token.
       * @returns {boolean} Returns `true` if the authentication time is within the last 5 minutes.
       */
      checkAuthTime: (decodedIdToken) => {
        // Only process if the user just signed in in the last {this.auth_time} minutes.
        if (new Date().getTime() / 1000 - decodedIdToken.auth_time < authSystem.auth_time * 60)
          return true;
        // Nope
        else return false;
      },

      /**
       * Generates the session cookie expiration time ({this.auth_time} days by default).
       *
       * @returns {number} Returns the expiration time in milliseconds (5 days).
       */
      cookieTimeGenerator: () => {
        // Set session expiration to 5 days.
        const expiresIn = 60 * 60 * 24 * authSystem.auth_time * 1000;

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

  /**
   * Sets a custom callback to check authentication time.
   *
   * @param {Function} callback - The callback function to validate authentication time.
   * @returns {void}
   */
  setCookieTimeGenerator(callback) {
    if (typeof callback === 'function') this.cookieTimeGenerator = callback;
  }

  /**
   * Sets a custom callback to generate the cookie expiration time.
   *
   * @param {Function} callback - The callback function to generate cookie expiration time.
   * @returns {void}
   */
  setCheckAuthTime(callback) {
    if (typeof callback === 'function') this.checkAuthTime = callback;
  }

  /**
   * Generates a session cookie for the user after verifying the ID token.
   *
   * @param {Record<string, any>} auth - The authentication object used to verify the ID token and create session cookies.
   * @param {string} token - The ID token of the authenticated user.
   * @returns {Promise<string>} A promise that resolves with the session cookie or rejects with an error.
   */
  genCookieSession(auth, token) {
    const tinyThis = this;
    return new Promise(function (resolve, reject) {
      auth
        .verifyIdToken(token)
        .then(async (decodedIdToken) => {
          try {
            // Validate the authentication time
            const checkedTime = await tinyThis.checkAuthTime(decodedIdToken);
            if (checkedTime) {
              // Generate session cookie
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
