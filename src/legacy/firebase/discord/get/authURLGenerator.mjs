// @ts-nocheck

import { encrypt } from '../../../crypto/encrypt.mjs';
import config from '../config.mjs';

/**
 * Generates an authorization URL for either login or webhook requests,
 * including scopes, state, and redirect URIs. This URL can be used in OAuth2
 * authentication flows, such as logging in or connecting a webhook.
 *
 * @function
 * @param {Record<string, any>} tinyCfg - The configuration object containing the app's OAuth2 settings.
 * @param {Record<string, any>} jsonState - The state object to be encrypted and passed in the authorization URL.
 * @param {Record<string, any>} tinyCrypto - The crypto object used to encrypt the state.
 * @param {string} type - The type of the request, which determines the URL generation process.
 *                         Can be `'login'`, `'login_command'`, or `'webhook'`.
 *
 * @returns {string} The generated authorization URL for OAuth2 authorization.
 *
 * @example
 * const authUrl = authURLGenerator(tinyCfg, jsonState, tinyCrypto, 'login');
 * console.log(authUrl);
 *
 * @example
 * const webhookAuthUrl = authURLGenerator(tinyCfg, jsonState, tinyCrypto, 'webhook');
 * console.log(webhookAuthUrl);
 */
export default function authURLGenerator(tinyCfg, jsonState, tinyCrypto, type) {
  // Scopes
  let tinyScopeURI = '';

  // Login
  let needRedirect = false;
  if (type === 'login' || type === 'login_command') {
    // Normal Login
    if (type === 'login') needRedirect = true;

    // Read Scope
    if (Array.isArray(tinyCfg.discordScope)) {
      for (const item in tinyCfg.discordScope) {
        if (tinyScopeURI) tinyScopeURI += '%20';
        if (tinyCfg.discordScope[item] === 'applications.commands.update') needRedirect = true;
        tinyScopeURI += encodeURIComponent(tinyCfg.discordScope[item]);
      }
    }
  }

  // Webhook
  else if (type === 'webhook') {
    needRedirect = true;
    tinyScopeURI += 'webhook.incoming';
  }

  // Redirect Fixed
  let tinyRedirect = '';
  if (needRedirect && typeof tinyCfg.redirect === 'string')
    tinyRedirect = '&redirect_uri=' + encodeURIComponent(tinyCfg.redirect);

  // State
  let tinyState = '';
  let responseType = '';
  if (needRedirect) {
    // Crypto
    tinyState = encrypt(tinyCrypto, JSON.stringify(jsonState));
    tinyState = '&state=' + encodeURIComponent(tinyState);
    responseType = '&response_type=code';
  }

  // API URL
  const apiURL = config.url;

  // Redirect URL
  return `${apiURL}oauth2/authorize?client_id=${encodeURIComponent(tinyCfg.client_id)}&scope=${tinyScopeURI}${responseType}${tinyRedirect}${tinyState}`;
}
