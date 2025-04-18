// Module Base
const http_base = {
  // https://github.com/TinyPudding/Puddy-Lib/blob/main/docs/WEB_STATUS.md
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
