import _ from 'lodash';
import moment from 'moment-timezone';
import md5 from 'md5';
import byteLength from 'byte-length';

/**
 * @function fileCache
 *
 * Sends a stringified file as a response with caching, security headers, and optional metadata.
 * If `data.file` is not a string, the request is passed to the next middleware.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @param {object} data - Configuration object for the file response.
 * @param {string} [data.file] - The content of the file to send (must be a string).
 * @param {number} [data.fileMaxAge] - Max age in seconds for cache expiration.
 * @param {string} [data.date] - A date string used for the `Last-Modified` header.
 * @param {string} [data.timezone="Universal"] - Timezone for `moment.tz()`.
 * @param {string} [data.contentType="application/javascript"] - MIME type for the response.
 * @deprecated
 *
 * @example
 * import fileCache from './fileCache.mjs';
 *
 * app.get('/my-script.js', (req, res, next) => {
 *   const content = fs.readFileSync('./public/my-script.js', 'utf8');
 *   fileCache(res, next, {
 *     file: content,
 *     fileMaxAge: 3600,
 *     date: fs.statSync('./public/my-script.js').mtime,
 *     contentType: 'application/javascript'
 *   });
 * });
 */
export default function fileCache(res, next, data) {
  // Prepare Config
  const tinyCfg = _.defaultsDeep({}, data, {
    timezone: 'Universal',
    contentType: 'application/javascript',
  });

  // Is String
  if (typeof tinyCfg.file === 'string') {
    // File Type
    res.setHeader('Content-Type', tinyCfg.contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Timing-Allow-Origin', 'same-origin');
    res.removeHeader('Connection');
    res.removeHeader('X-Powered-By');

    // MD5
    if (md5) res.setHeader('Content-MD5', Buffer.from(md5(tinyCfg.file)).toString('base64'));

    // Time
    if (tinyCfg.date && moment)
      res.setHeader('Last-Modified', moment.tz(tinyCfg.date, tinyCfg.timezone).toString());

    // Cache Control
    if (typeof tinyCfg.fileMaxAge === 'number')
      res.setHeader('Expires', moment.tz('UTC').add(tinyCfg.fileMaxAge, 'seconds').toString());
    res.set('Cache-Control', `public, max-age=${tinyCfg.fileMaxAge}`);

    // File Size
    if (byteLength) res.setHeader('Content-Length', byteLength.byteLength(tinyCfg.file));

    // Send FIle
    res.send(tinyCfg.file);
  }

  // Nope
  else next();
}
