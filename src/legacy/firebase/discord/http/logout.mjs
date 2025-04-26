// @ts-nocheck

import _ from 'lodash';

import objType from '../../../get/objType.mjs';
import revokeToken from '../api/revokeToken.mjs';
import getUser from '../api/getUser.mjs';

/**
 * Handles the logout process for the user by revoking the token and redirecting.
 *
 * @param {Record<string, any>} req - The HTTP request object.
 * @param {string|number} access_token - The access token of the user to be revoked.
 * @param {Record<string, any>} cfg - Configuration object containing settings for the logout process.
 * @param {boolean} existSession - A flag indicating whether a session exists.
 *
 * @returns {Promise<Record<string, any>>} Resolves with a result object or rejects with an error.
 *
 * @throws {Record<string, any>} Rejects with an error if configuration or token values are invalid.
 *
 * @example
 * logout(req, 'userAccessToken', cfg, true)
 *   .then(result => {
 *     // Handle successful logout
 *   })
 *   .catch(err => {
 *     // Handle error during logout
 *   });
 */
export default async function logout(req, access_token, cfg, existSession) {
  return new Promise(function (resolve, reject) {
    // Detect Config
    if (objType(cfg, 'object')) {
      // Create Settings
      const tinyQuery = _.defaultsDeep({}, cfg.query, {
        csrfToken: 'csrfToken',
        redirect: 'redirect',
      });

      const tinyState = _.defaultsDeep({}, cfg.state, {
        csrfToken: '',
        redirect: '',
      });

      // Exist Query Setting
      if (objType(tinyQuery, 'object')) {
        // Exist Query
        if (
          typeof tinyState.csrfToken !== 'string' ||
          tinyState.csrfToken.length < 1 ||
          (objType(req.query, 'object') &&
            typeof cfg.csrfToken === 'string' &&
            tinyState.csrfToken === cfg.csrfToken)
        ) {
          // Result
          const result = {
            data: null,
            existSession: existSession,
            complete: false,
            state: { csrfToken: cfg.csrfToken },
          };

          // Prepare Final Redirect
          result.redirect = '/';

          // Redirect
          if (typeof tinyState.redirect === 'string' && tinyState.redirect.length > 0) {
            if (tinyState.redirect.startsWith('/'))
              result.redirect = tinyState.redirect.substring(1);
            else result.redirect = tinyState.redirect;
          }

          // Get Query
          else if (typeof req.query[tinyQuery.redirect] === 'string') {
            if (req.query[tinyQuery.redirect].startsWith('/'))
              result.redirect = req.query[tinyQuery.redirect].substring(1);
            else result.redirect = req.query[tinyQuery.redirect];
          }

          // Exist Session
          if (existSession) {
            // Exist Token
            if (
              (typeof access_token === 'string' && access_token.length > 0) ||
              (typeof access_token === 'number' && !isNaN(access_token))
            ) {
              // Prepare Auth
              const tinyAuth = _.defaultsDeep({}, cfg.auth, {
                client_id: '',
                client_secret: '',
                redirect_uri: '',
              });

              // Exist Client ID
              if (
                (typeof tinyAuth.client_id === 'string' && tinyAuth.client_id.length > 0) ||
                (typeof tinyAuth.client_id === 'number' && !isNaN(tinyAuth.client_id))
              ) {
                // Exist Client Secret
                if (
                  (typeof tinyAuth.client_secret === 'string' &&
                    tinyAuth.client_secret.length > 0) ||
                  (typeof tinyAuth.client_secret === 'number' && !isNaN(tinyAuth.client_secret))
                ) {
                  // End Discord
                  const end_discord_session = function () {
                    // Get API HTTP and Revoke the Token
                    revokeToken(access_token, tinyAuth)
                      .then((data) => {
                        result.data = data;
                        resolve(result);
                      })
                      .catch((err) => {
                        result.err = err;
                        reject(result);
                      });
                  };

                  // Don't need user info
                  if (typeof access_token !== 'string' || access_token.length < 1)
                    end_discord_session();
                  // Yes
                  else {
                    // Get User
                    getUser(access_token)
                      .then((data) => {
                        result.user = data;
                        end_discord_session();
                      })
                      .catch(reject);
                  }
                }
                // Nope
                else reject({ code: 401, message: 'Invalid Client Secret!' });
              }
              // Nope
              else reject({ code: 401, message: 'Invalid Client ID!' });
            }
            // Nope
            else reject({ code: 401, message: 'Invalid Token Data!' });
          }
          // Nope
          else resolve(result);
        }
        // Nope
        else reject({ code: 401, message: 'Invalid csrfToken!' });
      }
      // Nope
      else reject({ code: 401, message: 'Invalid query setting!' });
    }
    // Nope
    else reject({ code: 500, message: 'Invalid Config Values!' });
  });
}
