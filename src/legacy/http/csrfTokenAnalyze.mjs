/**
 * @function csrfTokenAnalyze
 *
 * Checks if the CSRF token in the request body matches the expected token from the session.
 * If invalid, returns a 401 response and optionally executes a custom callback.
 *
 * @param {import('express').Request} req - The Express request object. Should contain:
 *   - `req.csrfToken.now`: The expected CSRF token.
 *   - `req.body.csrfToken`: The token provided by the client.
 * @param {import('express').Response} res - The Express response object.
 * @param {Function} [callback] - Optional custom callback to execute when CSRF validation fails.
 *
 * @returns {boolean} Returns `true` if the token is invalid and a response was sent, otherwise `false`.
 * @deprecated
 *
 * @example
 * app.post('/submit', (req, res) => {
 *   if (csrfTokenAnalyze(req, res)) return;
 *   // Continue with request logic if CSRF is valid
 * });
 */
export default function csrfTokenAnalyze(req, res, callback) {
  // Check Values
  if (
    // @ts-ignore
    req.csrfToken &&
    // @ts-ignore
    typeof req.csrfToken.now === 'string' &&
    // @ts-ignore
    (typeof req.body.csrfToken !== 'string' || req.body.csrfToken !== req.csrfToken.now)
  ) {
    // Result
    res.status(401);

    // Normal Callback
    if (typeof callback !== 'function') res.json({ code: 401, text: 'CSRFToken!' });
    // Custom
    else callback();

    // Complete
    return true;
  }

  // Nope
  else return false;
}
