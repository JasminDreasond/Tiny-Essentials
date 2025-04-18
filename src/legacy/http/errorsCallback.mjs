export default function errorsCallback(callback) {
  return function (err, req, res, next) {
    // Err Code
    const errCode = Number(err.status);

    // Error
    if (
      (typeof err.status !== 'number' && typeof err.status !== 'string') ||
      isNaN(errCode) ||
      !isFinite(errCode) ||
      errCode < 400
    )
      next();
    // Nope
    else
      callback(req, res, next, {
        code: err.status,
        path: req.url,
        originalUrl: req.originalUrl,
        err: err,
      });
  };
}
