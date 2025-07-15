/**
 * @module http_base
 *
 * HTTP status utility for sending standardized HTTP responses using Express.
 * Includes a comprehensive list of HTTP status codes and helper methods for sending responses.
 */

const http_base = {
  /**
   * A list of standard HTTP status codes and their default messages.
   * Follows the format { [statusCode]: message }.
   *
   * @readonly
   * @type {Object<number, string>}
   */
  list: {
    // Informational
    100: 'Continue',
    101: 'Switching Protocols',

    // Successful
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',

    // Redirection
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: 'Unused',
    307: 'Temporary Redirect',

    // Client Error
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',

    // Server Error
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
  },

  /**
   * Sends an HTTP response with the given status code.
   * If a callback is provided, it will be called instead of sending an empty response.
   *
   * @function send
   * @param {import('express').Response} res - Express response object.
   * @param {number} http_code - HTTP status code to send.
   * @param {function(number): import('express').Response} [callback] - Optional callback to handle response body manually.
   *
   * @returns {import('express').Response} The result of `res.send()` or the callback function.
   * @deprecated
   *
   * @example
   * http_base.send(res, 404); // Sends 404 Not Found with empty body
   */
  send: function (res, http_code, callback) {
    // Exist Error Code?
    if (typeof http_code === 'number' && typeof http_base.list[http_code] === 'string') {
      // Set HTTP Code
      res.status(http_code);
      res.header(`HTTP/1.0 ${http_code} ${http_base.list[http_code]}`);

      // Send Page
      if (typeof callback !== 'function') {
        return res.send('');
      }

      // Nope
      else {
        return callback(http_code);
      }
    }

    // Nope
    else {
      return res.send('');
    }
  },

  /**
   * Asynchronously sends an HTTP response with the given status code.
   * Awaits the provided callback before completing.
   *
   * @function sendAsync
   * @param {import('express').Response} res - Express response object.
   * @param {number} http_code - HTTP status code to send.
   * @param {function(number): Promise<any>} [callback] - Optional async callback to handle response.
   *
   * @returns {Promise<any>} The result of the async callback or the empty response.
   * @deprecated
   *
   * @example
   * await http_base.sendAsync(res, 500, async (code) => {
   *   res.send('Server error occurred.');
   * });
   */
  sendAsync: async function (res, http_code, callback) {
    // Exist Error Code?
    if (typeof http_code === 'number' && typeof http_base.list[http_code] === 'string') {
      // Set HTTP Code
      res.status(http_code);
      res.header(`HTTP/1.0 ${http_code} ${http_base.list[http_code]}`);

      // Send Page
      if (typeof callback !== 'function') {
        return res.send('');
      }

      // Nope
      else {
        const result = await callback(http_code);
        return result;
      }
    }

    // Nope
    else {
      return res.send('');
    }
  },
};

// Module
export default http_base;
