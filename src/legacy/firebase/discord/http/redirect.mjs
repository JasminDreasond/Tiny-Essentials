// @ts-nocheck

import _ from 'lodash';

import defaultCrypto from '../../../crypto/default.mjs';
import objType from '../../../get/objType.mjs';
import { decrypt } from '../../../crypto/decrypt.mjs';
import getToken from '../api/getToken.mjs';
import getUser from '../api/getUser.mjs';

/**
 * Handles the redirection logic for the OAuth flow, including state validation, token retrieval, and user session management.
 * This function is used for handling Discord OAuth redirects and session creation or restoration.
 *
 * @param {Record<string, any>} req - The request object from the client, which contains query parameters such as `state`, `code`, and `csrfToken`.
 * @param {Record<string, any>} cfg - The configuration object containing settings like `crypto`, `auth`, and `discordScope`.
 * @param {boolean} existSession - Indicates if the user already has an active session.
 *
 * @returns {Promise<Record<string, any>>} - A promise that resolves with an object containing the redirection URL and session information.
 * If a new session is created, it also includes user data and the token request.
 *
 * @throws {Record<string, any>} - Throws an error with a `code` and `message` if any validation fails (e.g., missing token, invalid state).
 *
 * @example
 * // Example usage of redirect function
 * redirect(req, cfg, true)
 *   .then((result) => {
 *     console.log('Redirection successful', result);
 *   })
 *   .catch((err) => {
 *     console.error('Error during redirect', err);
 *   });
 */
export default async function redirect(req, cfg, existSession) {
  return new Promise(function (resolve, reject) {
    // Detect Config
    if (objType(cfg, 'object')) {
      // Create Settings
      const tinyCrypto = _.defaultsDeep({}, cfg.crypto, defaultCrypto);

      // Detect Config
      if (objType(tinyCrypto, 'object')) {
        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.auth, {
          redirect: 'http://localhost/redirect',
          discordScope: [],
          client_id: '',
          client_secret: '',
          first_get_user: true,
        });

        // Check Type
        if (req.query.state.type === 'login_command') {
          tinyCfg.discordScope = ['applications.commands', 'applications.commands.update'];
        }

        // Detect Query
        if (objType(req.query, 'object')) {
          // Get State
          if (typeof req.query.state === 'string') {
            // Crypto
            req.query.state = decrypt(tinyCrypto, req.query.state);

            // Convert
            try {
              req.query.state = JSON.parse(req.query.state);
            } catch (err) {
              req.query.state = {};
            }
          } else {
            req.query.state = {};
          }

          // Detect State
          if (objType(req.query.state, 'object')) {
            // Check Session
            if (
              typeof tinyCfg.csrfToken !== 'string' ||
              tinyCfg.csrfToken.length < 1 ||
              (typeof req.query.state.csrfToken === 'string' &&
                req.query.state.csrfToken === tinyCfg.csrfToken)
            ) {
              // Prepare Resolve Data
              const resolveData = { newSession: false, state: req.query.state };

              // Final Redirect
              resolveData.redirect = '/';
              if (typeof req.query.state.redirect === 'string') {
                resolveData.redirect += req.query.state.redirect;
              }

              // Exist Session
              if (!existSession || req.query.state.type === 'webhook') {
                if (
                  (typeof req.query.code === 'string' && req.query.code.length > 0) ||
                  (typeof req.query.code === 'number' && !isNaN(req.query.code))
                ) {
                  // Discord Token
                  getToken({
                    client_id: tinyCfg.client_id,
                    client_secret: tinyCfg.client_secret,
                    code: req.query.code,
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
                          resolveData.tokenRequest = json;

                          // Login Type
                          if (req.query.state.type === 'login') {
                            // Check New Session
                            resolveData.newSession = true;

                            // Get User Data
                            if (tinyCfg.first_get_user) {
                              // Get User
                              getUser(json.access_token)
                                // Get User
                                .then((dsUser) => {
                                  // Validate Data
                                  if (objType(dsUser, 'object')) {
                                    resolveData.user = dsUser;
                                    resolve(resolveData);
                                  }

                                  // Nope
                                  else reject({ code: 500, message: 'Invalid JSON User Data!' });
                                })
                                // Fail
                                .catch(reject);
                            }

                            // Nope
                            else {
                              // Return Result
                              resolve(resolveData);
                            }
                          }

                          // Webhook Type
                          else if (req.query.state.type === 'webhook') {
                            // Guild ID
                            if (typeof req.query.guild_id === 'string')
                              resolveData.guild_id = req.query.guild_id;

                            // Return Result
                            resolve(resolveData);
                          }

                          // Unknown
                          else reject({ code: 400, message: 'Invalid State Type!' });
                        }
                        // Nope
                        else reject({ code: 500, message: 'Invalid User Token Data!' });
                      }
                      // Nope
                      else reject({ code: 500, message: 'Invalid JSON Token Data!' });
                    })

                    // Fail
                    .catch(reject);
                } else reject({ code: 401, message: 'Invalid Discord Code!' });
              } else resolve({ newSession: false });
            } else reject({ code: 401, message: 'Incorrect csrfToken!' });
          }
          // Nope
          else reject({ code: 401, message: 'Invalid State Query!' });
        }
        // Nope
        else reject({ code: 401, message: 'Invalid Query URL!' });
      }
      // Nope
      else reject({ code: 500, message: 'Invalid Crypto Values!' });
    }
    // Nope
    else reject({ code: 500, message: 'Invalid Config Values!' });
  });
}
