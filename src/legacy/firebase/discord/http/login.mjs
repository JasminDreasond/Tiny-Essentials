// @ts-nocheck

import _ from 'lodash';

import objType from '../../../get/objType.mjs';
import defaultCrypto from '../../../crypto/default.mjs';
import http_status from '../../../http/HTTP-1.0.mjs';
import getDomainURL from '../../../http/getDomainURL.mjs';
import authURLGenerator from '../get/authURLGenerator.mjs';

/**
 * Handles the login process by checking the configuration, generating authentication URLs, and redirecting the user to the appropriate destination.
 * Depending on the configuration type, it handles various authentication methods like login, login_command, and webhook.
 *
 * @function
 * @param {Record<string, any>} req - The request object, typically provided by the web framework (e.g., Express).
 * @param {Record<string, any>} res - The response object, typically provided by the web framework (e.g., Express).
 * @param {Record<string, any>} cfg - The configuration object that includes various settings for the login process.
 * @param {boolean} existSession - A flag indicating whether the user already has an active session.
 *
 * @returns {void} This function does not return anything. It sends a redirect response to the user based on the configuration.
 *
 * @throws {Error} If any validation or configuration fails, an error response will be sent.
 *
 * @example
 * // Example usage with Express:
 * app.get('/login', (req, res) => {
 *   login(req, res, config, sessionExists);
 * });
 */
export default function login(req, res, cfg, existSession) {
  // Send Error
  const sendError = function (data) {
    if (typeof cfg.errorCallback !== 'function') return http_status.send(res, data.code);
    else return cfg.errorCallback(data, req, res);
  };

  // Detect Config
  if (
    objType(cfg, 'object') &&
    typeof cfg.type === 'string' &&
    (cfg.type === 'login' || cfg.type === 'login_command' || cfg.type === 'webhook')
  ) {
    // Create Settings
    const tinyCrypto = _.defaultsDeep({}, cfg.crypto, defaultCrypto);

    // Detect Config
    if (objType(tinyCrypto, 'object')) {
      // Create Settings
      const tinyCfg = _.defaultsDeep({}, cfg.auth, {
        redirect: 'http://localhost/redirect',
        discordScope: [],
        client_id: '',
      });

      // Validate Config
      if (objType(tinyCfg, 'object')) {
        // Default Values State
        let tinyState = _.defaultsDeep({}, cfg.state, {
          csrfToken: '',
          redirect: '',
          type: cfg.type,
        });

        // Validate
        if (typeof tinyState.type !== 'string') tinyState.type = cfg.type;

        // Validate State
        if (objType(tinyState, 'object')) {
          // Create Settings
          const tinyQuery = _.defaultsDeep({}, cfg.query, {
            redirect: 'redirect',
          });

          // Exist Cfg
          if (objType(tinyQuery, 'object')) {
            // Get Domain
            const tinyDomain = getDomainURL(req, cfg.port);

            // Redirect
            let returnRedirect = tinyDomain + '/';
            if (objType(req.query, 'object')) {
              if (typeof req.query[tinyQuery.redirect] === 'string') {
                req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].trim();
                if (!req.query[tinyQuery.redirect].startsWith('http')) {
                  if (req.query[tinyQuery.redirect].startsWith('/'))
                    req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].substring(1);

                  // Return Redirect
                  tinyState.redirect = req.query[tinyQuery.redirect];
                  returnRedirect = req.query[tinyQuery.redirect];

                  // Fix Redirect
                  returnRedirect = tinyDomain + '/' + returnRedirect;
                } else tinyState.redirect = '';
              } else {
                tinyState.redirect = '';
                delete req.query[tinyQuery.redirect];
              }
            } else tinyState.redirect = '';

            // Don't exist session
            if (!existSession || cfg.type === 'login_command' || cfg.type === 'webhook') {
              // Redirect Result
              const redirect_discord = authURLGenerator(tinyCfg, tinyState, tinyCrypto, cfg.type);
              return res.redirect(redirect_discord);
            }

            // Yes
            else return res.redirect(returnRedirect);
          }
          // Nope
          else return sendError({ code: 400, message: 'Invalide Request!' });
        }
        // Error
        else return sendError({ code: 400, message: 'Invalide State Config!' });
      }
      // Error
      else return sendError({ code: 500, message: 'Invalide System Config!' });
    }
    // Nope
    else return sendError({ code: 500, message: 'Invalid Crypto Values!' });
  }
  // Nope
  else return sendError({ code: 500, message: 'Invalid Config Values!' });
}
