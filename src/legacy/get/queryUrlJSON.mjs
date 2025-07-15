/**
 * Parses the query string from a URL into a JSON object.
 *
 * - Supports `key=value` pairs.
 * - Supports array syntax (`arr[]=1&arr[]=2`, or `arr[1]=x`).
 * - Ignores fragments (`#`).
 * - If no URL is passed, uses `window.location.href` by default.
 *
 * Examples:
 * ```js
 * queryUrlJSON('http://example.com/?name=John&colors[]=red&colors[]=blue');
 * // => { name: 'John', colors: ['red', 'blue'] }
 *
 * queryUrlJSON('http://x.com/?arr[1]=a&arr[0]=b');
 * // => { arr: ['b', 'a'] }
 * ```
 *
 * @param {string} [url=location.href] - The full URL to parse.
 * @returns {Object.<string, string|string[]>} A key-value object representing the parsed query.
 * @deprecated
 */
export default function queryUrlJSON(url) {
  if (!url) url = location.href;
  var question = url.indexOf('?');
  var hash = url.indexOf('#');
  if (hash === -1 && question === -1) return {};
  if (hash === -1) hash = url.length;
  var query =
    question === -1 || hash === question + 1
      ? url.substring(hash)
      : url.substring(question + 1, hash);

  /** @type {Record<string, *>} */
  var result = {};
  query.split('&').forEach((part) => {
    if (!part) return;
    part = part.split('+').join(' '); // replace every + with space, regexp-free version
    var eq = part.indexOf('=');
    var key = eq > -1 ? part.substr(0, eq) : part;
    var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
    var from = key.indexOf('[');
    if (from === -1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf(']', from);
      var index = decodeURIComponent(key.substring(from + 1, to));
      key = decodeURIComponent(key.substring(0, from));
      if (!result[key]) result[key] = [];
      if (!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}
