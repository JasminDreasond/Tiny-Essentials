// @ts-nocheck

import _ from 'lodash';

import objType from '../../../get/objType.mjs';
import refreshTokenApi from '../api/refreshToken.mjs';

/**
 * Refreshes the Discord token using the provided refresh token.
 *
 * @async
 * @function refreshToken
 * @param {Record<string, any>} req - The request object containing query parameters and csrfToken.
 * @param {Record<string, any>} cfg - The configuration object containing auth and state configurations.
 * @param {boolean} existSession - A flag indicating if the user session exists.
 *
 * @returns {Promise<Record<string, any>>} Resolves to an object containing the status of the refresh and the new token data, or rejects with an error object.
 *
 * @throws {Record<string, any>} Rejects with an error object containing the following properties:
 *   - `code` {number} The error code (e.g., 401 for invalid CSRF token, 500 for server errors).
 *   - `message` {string} The error message describing the issue.
 *
 * @example
 * const result = await refreshToken(req, cfg, existSession);
 * if (result.refreshed) {
 *   console.log('Token refreshed:', result.tokenRequest);
 * } else {
 *   console.log('Token refresh failed');
 * }
 */
export default async function refreshToken(req, cfg, existSession) {
  return new Promise(function (resolve, reject) {
    // Detect Config
    if (objType(cfg, 'object')) {
      // Create Settings
      const tinyCfg = _.defaultsDeep({}, cfg.auth, {
        redirect: 'http://localhost/redirect',
        discordScope: [],
        client_id: '',
        client_secret: '',
      });

      // Check Session
      if (
        typeof tinyCfg.csrfToken !== 'string' ||
        tinyCfg.csrfToken.length < 1 ||
        (typeof req.csrfToken.now.value === 'string' &&
          req.csrfToken.now.value === tinyCfg.csrfToken)
      ) {
        // Prepare more settings
        const tinyQuery = _.defaultsDeep({}, cfg.auth, {
          redirect: 'redirect',
        });

        const tinyState = _.defaultsDeep({}, cfg.state, {
          redirect: '',
        });

        // Result
        const result = { refreshed: false };

        // Prepare Final Redirect
        result.redirect = '/';

        // Redirect
        if (typeof tinyState.redirect === 'string' && tinyState.redirect.length > 0) {
          if (tinyState.redirect.startsWith('/')) result.redirect = tinyState.redirect.substring(1);
          else result.redirect = tinyState.redirect;
        }

        // Get Query
        else if (
          objType(tinyQuery, 'object') &&
          objType(req.query, 'object') &&
          typeof tinyQuery.redirect === 'string' &&
          typeof req.query[tinyQuery.redirect] === 'string'
        ) {
          if (req.query[tinyQuery.redirect].startsWith('/'))
            result.redirect = req.query[tinyQuery.redirect].substring(1);
          else result.redirect = req.query[tinyQuery.redirect];
        }

        // Exist Session
        if (existSession) {
          if (
            (typeof cfg.refresh_token === 'string' && cfg.refresh_token.length > 0) ||
            (typeof cfg.refresh_token === 'number' && !isNaN(cfg.refresh_token))
          ) {
            // Discord Token
            refreshTokenApi({
              client_id: tinyCfg.client_id,
              client_secret: tinyCfg.client_secret,
              refresh_token: cfg.refresh_token,
              redirect_uri: tinyCfg.redirect,
              scope: tinyCfg.discordScope.join(' '),
            })
              // Success
              .then((json) => {
                // Valid Json Data
                if (objType(json, 'object')) {
                  // Check Token
                  if (
                    typeof json.access_token === 'string' ||
                    typeof json.access_token === 'number'
                  ) {
                    // Token
                    result.refreshed = true;
                    result.tokenRequest = json;

                    // Return Result
                    resolve(result);
                  }
                  // Nope
                  else reject({ code: 500, message: 'Invalid User Token Data!' });
                }
                // Nope
                else reject({ code: 500, message: 'Invalid JSON Token Data!' });
              })
              // Fail
              .catch(reject);
          }

          // Nope
          else reject({ code: 401, message: 'Invalid Refresh Token Data!' });
        } else resolve(result);
      } else reject({ code: 401, message: 'Incorrect csrfToken!' });
    }

    // Nope
    else reject({ code: 500, message: 'Invalid Config Values!' });
  });
}
