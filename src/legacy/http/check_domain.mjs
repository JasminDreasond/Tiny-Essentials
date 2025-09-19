/**
 * @module check_domain
 *
 * Utility module to validate or retrieve the domain from a request object.
 * It supports multiple methods to check the domain, including:
 * - `x-forwarded-host`
 * - `req.hostname`
 * - `req.headers.host`
 *
 * Can be used to check if the incoming request matches a specific domain or to
 * simply retrieve the current domain of the request.
 */
const check_domain = {
  /**
   * A list of domain validators using different request properties.
   *
   * Each validator includes a `type` and a `callback` function that checks or returns the domain.
   * If a domain (`the_domain`) is passed, the function returns a boolean.
   * If not, it returns the found domain string or `null`.
   *
   */
  validators: [
    {
      type: 'x-forwarded-host',
      /**
       * @deprecated
       */
      callback: function (
        /** @type {import('express').Request} */ req,
        /** @type {string|null} */ the_domain,
      ) {
        const isString = typeof req.headers['x-forwarded-host'] === 'string';
        if (the_domain) return isString && req.headers['x-forwarded-host'] === the_domain;

        return isString ? req.headers['x-forwarded-host'] : null;
      },
    },
    {
      type: 'hostname',
      /**
       * @deprecated
       */
      callback: function (
        /** @type {import('express').Request} */ req,
        /** @type {string|null} */ the_domain,
      ) {
        const isString = typeof req.hostname === 'string';
        if (the_domain) return isString && req.hostname === the_domain;

        return isString ? req.hostname : null;
      },
    },
    {
      type: 'hostname',
      /**
       * @deprecated
       */
      callback: function (
        /** @type {import('express').Request} */ req,
        /** @type {string|null} */ the_domain,
      ) {
        const isString = typeof req.headers.host === 'string';
        if (the_domain) return isString && req.headers.host === the_domain;
        return isString ? req.headers.host : null;
      },
    },
  ],

  /**
   * Validates the request against a given domain using all available validators.
   *
   * @function
   * @param {import('express').Request} req - The request object from Express.
   * @param {string} the_domain - The domain to validate against.
   * @returns {boolean} True if any validator matches the domain.
   * @deprecated
   */
  validator: function (req, the_domain) {
    for (const item in check_domain.validators)
      if (check_domain.validators[item].callback(req, the_domain)) return true;
    return false;
  },

  /**
   * Returns the domain found from the first valid source in the request object.
   *
   * @function
   * @param {import('express').Request} req - The request object from Express.
   * @returns {string|true|string[]|null} The found domain string or `null` if none matched.
   * @deprecated
   */
  get: function (req) {
    for (const item in check_domain.validators) {
      const result = check_domain.validators[item].callback(req, null);
      if (result) return result;
    }
    return null;
  },
};

export default check_domain;
