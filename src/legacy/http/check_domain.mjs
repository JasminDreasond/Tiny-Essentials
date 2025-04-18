// Module Base
const check_domain = {
  // Validators
  validators: [
    // X Forwarded Host
    {
      type: 'x-forwarded-host',
      callback: function (req, the_domain) {
        const isString = typeof req.headers['x-forwarded-host'] === 'string';
        if (the_domain) {
          if (isString && req.headers['x-forwarded-host'] === the_domain) {
            return true;
          } else {
            return false;
          }
        } else {
          if (isString) {
            return req.headers['x-forwarded-host'];
          } else {
            return null;
          }
        }
      },
    },

    // Hostname
    {
      type: 'hostname',
      callback: function (req, the_domain) {
        const isString = typeof req.hostname === 'string';
        if (the_domain) {
          if (isString && req.hostname === the_domain) {
            return true;
          } else {
            return false;
          }
        } else {
          if (isString) {
            return req.hostname;
          } else {
            return null;
          }
        }
      },
    },

    // Hostname
    {
      type: 'hostname',
      callback: function (req, the_domain) {
        const isString = typeof req.headers.host === 'string';
        if (the_domain) {
          if (isString && req.headers.host === the_domain) {
            return true;
          } else {
            return false;
          }
        } else {
          if (isString) {
            return req.headers.host;
          } else {
            return null;
          }
        }
      },
    },
  ],

  // Validator
  validator: function (req, the_domain) {
    // Check All
    for (const item in check_domain.validators) {
      if (check_domain.validators[item].callback(req, the_domain)) {
        return true;
      }
    }

    // Nope
    return false;
  },

  // Get
  get: function (req) {
    // Check All
    for (const item in check_domain.validators) {
      const result = check_domain.validators[item].callback(req);
      if (result) {
        return result;
      }
    }

    // Nothing
    return null;
  },
};

// Module
export default check_domain;
