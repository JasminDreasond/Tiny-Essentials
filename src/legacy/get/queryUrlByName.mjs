/**
 * Extracts the value of a specific query parameter from a URL.
 *
 * - Supports parameter names with brackets (e.g. `arr[0]`).
 * - Returns `null` if the parameter is not found.
 * - Returns an empty string if the parameter exists without a value.
 *
 * Examples:
 * ```js
 * queryUrlByName('foo', 'http://example.com/?foo=bar'); // "bar"
 * queryUrlByName('foo', 'http://example.com/?foo=');    // ""
 * queryUrlByName('foo', 'http://example.com/');         // null
 * queryUrlByName('arr[0]', 'http://x.com/?arr[0]=yes'); // "yes"
 * ```
 *
 * @param {string} name - The name of the query parameter to retrieve.
 * @param {string} url - The full URL from which to extract the parameter.
 * @returns {string|null} The decoded value of the parameter, or `null` if not found.
 * @deprecated
 */
export default function queryUrlByName(name, url) {
  let newName = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + newName + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
