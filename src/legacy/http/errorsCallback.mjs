/**
 * @function errorsCallback
 *
 * Creates an Express error-handling middleware that filters and handles HTTP errors
 * with a status code >= 400 using a custom callback function.
 *
 * If the error does not meet the criteria (e.g., status not defined or < 400), it delegates to the next middleware.
 *
 * @param {function(import('express').Request, import('express').Response, import('express').NextFunction, {
 *  code: number,
 *  path: string,
 *  originalUrl: string,
 *  err: Error
 * }): void} callback - A function called when an error with valid status is detected.
 *   Receives parameters: (req, res, next, info)
 *   - `info.code`: HTTP status code.
 *   - `info.path`: `req.url` value.
 *   - `info.originalUrl`: `req.originalUrl` value.
 *   - `info.err`: The original error object.
 *
 * @returns {function(Error, import('express').Request, import('express').Response, import('express').NextFunction): void} Express middleware function: (err, req, res, next)
 * @deprecated
 *
 * @example
 * import errorsCallback from './errorsCallback.mjs';
 *
 * app.use(errorsCallback((req, res, next, info) => {
 *   res.status(info.code).json({
 *     error: true,
 *     message: info.err.message || 'Unknown error',
 *     path: info.path
 *   });
 * }));
 */
export default function errorsCallback(callback) {
  return function (err, req, res, next) {
    // Err Code
    // @ts-ignore
    const errCode = Number(err.status);

    // Error
    if (
      // @ts-ignore
      (typeof err.status !== 'number' && typeof err.status !== 'string') ||
      isNaN(errCode) ||
      !isFinite(errCode) ||
      errCode < 400
    )
      next();
    // Nope
    else
      callback(req, res, next, {
        // @ts-ignore
        code: err.status,
        path: req.url,
        originalUrl: req.originalUrl,
        err: err,
      });
  };
}
