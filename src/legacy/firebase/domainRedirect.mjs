// @ts-nocheck

// https://stackoverflow.com/questions/34212039/redirect-to-firebase-hosting-custom-domain

/**
 * Redirects requests from invalid domains to a specified base URL or calls a callback function.
 * This middleware checks the 'x-forwarded-host' header of incoming requests and compares it to a list of valid domains.
 * If the domain is invalid, it either redirects to the base URL or calls a provided callback.
 *
 * @param {string[]} [domains=['localhost:5000', 'example.com']] - A list of valid domains that the request must come from.
 * @param {string} [baseurl='https://example.com/'] - The URL to redirect invalid requests to.
 * @param {Function} [callback] - An optional callback function that is called when an invalid domain is detected.
 *
 * @returns {Function} A middleware function for use in an Express.js application.
 */
export default function domainRedirect(
  domains = ['localhost:5000', 'example.com'],
  baseurl = 'https://example.com/',
  callback,
) {
  return (req, res, next) => {
    // Invalid Domain Detected
    if (!domains.includes(req.headers['x-forwarded-host'])) {
      // No Callback
      if (typeof callback !== 'function') return res.status(301).redirect(baseurl + req.url);
      // Yes
      else callback(req, res, next);
    }

    // Complete
    return next();
  };
}
