export default function auth(data, callback) {
  // Simple Basic Auth with vanilla JavaScript (ES6)
  // https://stackoverflow.com/questions/23616371/basic-http-authentication-with-node-and-express-4
  return async (req, res, next) => {
    // -----------------------------------------------------------------------
    // authentication middleware

    const auth = { login: data.login, password: data.password };

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
      // Access granted...
      return next();
    }

    // Access denied...

    // Function
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401);
    if (typeof data.customError === 'function') await data.customError(req, res);

    // Return Error
    if (typeof callback === 'function') return callback(req, res, next);
    // Default
    else res.send('');

    // -----------------------------------------------------------------------
  };
}
