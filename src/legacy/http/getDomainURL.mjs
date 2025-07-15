import checkDomain from './check_domain.mjs';

/**
 * @function getDomainURL
 *
 * Constructs a full URL string from a domain and optional port, determining the proper protocol.
 * It also supports extracting the domain from an Express `req` object via `checkDomain.get(req)`.
 *
 * @param {string|import('express').Request} domain - A domain string (e.g. "example.com") or Express `req` object.
 * @param {number} [port] - Optional port to include in the URL (not added for ports 80 or 443).
 * @param {string} [httpResult='https'] - The protocol to use (usually "http" or "https").
 *
 * @returns {string} A fully constructed URL string. Returns an empty string if the domain is invalid.
 * @deprecated
 *
 * @example
 * getDomainURL('example.com', 443); // "https://example.com"
 * getDomainURL('localhost', 3000);  // "http://localhost:3000"
 * getDomainURL(req, 8080);          // Uses domain from request object
 */
export default function getDomainURL(domain, port, httpResult = 'https') {
  // Domain Selected
  let domainSelected = null;

  // String
  if (typeof domain === 'string') domainSelected = domain;
  // Nope
  else domainSelected = checkDomain.get(domain);

  // Domain
  if (typeof domainSelected === 'string') {
    // Port
    let finalPort = '';
    let finalURL = '';
    if (typeof port === 'number' && port !== 80 && port !== 443) {
      finalPort = ':' + finalPort;
    } else {
      finalPort = '';
    }

    // Normal Domain
    if (!domainSelected.startsWith('localhost:') && domainSelected !== 'localhost')
      finalURL = `${httpResult}://${domainSelected}`;
    // Localhost
    else finalURL = `http://${domainSelected}`;

    // Exist Port
    if (finalPort && typeof finalURL.split(':')[2] !== 'string') finalURL += finalPort;

    // Complete
    return finalURL;
  }

  // Nope
  else return '';
}
