/**
 * Creates an Express middleware for Basic HTTP Authentication.
 *
 * This middleware checks for an `Authorization` header and validates
 * the username and password using base64-decoded credentials.
 *
 * If the credentials match, `next()` is called to proceed to the next middleware.
 * If the credentials are invalid or missing, a 401 Unauthorized response is sent.
 *
 * @function auth
 * @param {Object} data - Configuration object.
 * @param {string} data.login - The expected username.
 * @param {string} data.password - The expected password.
 * @param {function(import('express').Request, import('express').Response): import('express').Response} [data.customError] - Optional function `(req, res) => {}` called on auth failure.
 * @param {Function} [callback] - Optional fallback function `(req, res, next) => {}` executed after customError.
 *
 * @returns {function(import('express').Request, import('express').Response, import('express').NextFunction): void} Express middleware function.
 * @deprecated
 *
 * @example
 * import express from 'express';
 * import auth from './auth.mjs';
 *
 * const app = express();
 *
 * app.use(auth({
 *   login: 'admin',
 *   password: '1234',
 *   customError: (req, res) => {
 *     res.send('Custom unauthorized message');
 *   }
 * }));
 *
 * app.get('/', (req, res) => {
 *   res.send('Hello, authenticated user!');
 * });
 */
export default function auth(data, callback) {
  // Simple Basic Auth with vanilla JavaScript (ES6)
  // https://stackoverflow.com/questions/23616371/basic-http-authentication-with-node-and-express-4
  return async (req, res, next) => {
    // -----------------------------------------------------------------------
    // authentication middleware

    const auth = { login: data.login, password: data.password };

    // Parse credentials from Authorization header
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Check credentials
    if (login && password && login === auth.login && password === auth.password) {
      return next(); // Access granted
    }

    // Access denied
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401);
    if (typeof data.customError === 'function') await data.customError(req, res);

    // Optional fallback
    if (typeof callback === 'function') return callback(req, res, next);
    else res.send('');

    // -----------------------------------------------------------------------
  };
}
