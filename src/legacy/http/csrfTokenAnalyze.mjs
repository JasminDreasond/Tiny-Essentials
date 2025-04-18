export default function csrfTokenAnalyze(req, res, callback) {
  // Check Values
  if (
    req.csrfToken &&
    typeof req.csrfToken.now === 'string' &&
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
