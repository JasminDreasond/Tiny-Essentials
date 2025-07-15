import _ from 'lodash';

/**
 * @typedef {{ value: string[] | string, type: string | null }} IpResult
 */

/**
 * Retrieves the client's IP address from the Express request object,
 * supporting detection for Firebase/Cloud Functions, proxies, and direct connections.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {Object} [options] - Optional configuration.
 * @param {boolean} [options.isFirebase=false] - Enable detection for Firebase environments (e.g., Fastly).
 *
 * @returns {IpResult} An object containing the list of IP addresses and the detection source type.
 * @deprecated
 *
 * @example
 * const ipInfo = userIp(req);
 * console.log(ipInfo.value); // ['192.168.0.1']
 * console.log(ipInfo.type);  // 'x-forwarded-for'
 */
export default function userIp(req, options) {
  /** @type {IpResult} */
  const ip = {};

  const tinyCfg = _.defaultsDeep({}, options, {
    isFirebase: false,
  });

  if (req.headers) {
    // Firebase / Fastly
    if (tinyCfg.isFirebase && req.headers['fastly-client-ip']) {
      ip.value = req.headers['fastly-client-ip'];
      ip.type = 'fastly-client-ip';
    }

    // Proxies
    if (typeof ip.value !== 'string' && req.headers['x-forwarded-for']) {
      ip.value = req.headers['x-forwarded-for'];
      ip.type = 'x-forwarded-for';
    }
  }

  // Connection IP
  if (typeof ip.value !== 'string' && req.connection && req.connection.remoteAddress) {
    ip.value = req.connection.remoteAddress;
    ip.type = 'connection.remoteAddress';
  }

  // Fallback: req.ip (Express built-in)
  if (typeof ip.value !== 'string' && req.ip) {
    ip.value = req.ip;
    ip.type = 'req.ip';
  }

  // Normalize as array
  if (typeof ip.value === 'string') ip.value = ip.value.split(',').map((i) => i.trim());

  return ip;
}
