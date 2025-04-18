import _ from 'lodash';
import moment from 'moment-timezone';
import md5 from 'md5';
import byteLength from 'byte-length';

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
