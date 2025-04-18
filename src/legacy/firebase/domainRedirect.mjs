// https://stackoverflow.com/questions/34212039/redirect-to-firebase-hosting-custom-domain
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
