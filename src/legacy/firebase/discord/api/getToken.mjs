// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Exchanges an authorization code for an access token using Discord's OAuth2 API.
 *
 * This function is used in the OAuth2 authorization code flow.
 * It sends a POST request to the `/oauth2/token` endpoint with the required parameters.
 *
 * @param {Object} dsData - The data required for the token exchange.
 * @param {string} dsData.client_id - Your application's client ID.
 * @param {string} dsData.client_secret - Your application's client secret.
 * @param {string} dsData.code - The authorization code received from Discord.
 * @param {string} dsData.redirect_uri - The redirect URI used during the authorization.
 * @param {string} [dsData.scope] - The OAuth2 scopes being requested (optional but recommended).
 *
 * @returns {Promise<Record<string, any>>} Resolves with the access token data (access_token, token_type, expires_in, refresh_token, scope).
 *
 * @throws {Record<string, any>} If the request fails or Discord returns an error, rejects with an object containing a `code` and `message`.
 *
 * @example
 * getToken({
 *   client_id: '123456789012345678',
 *   client_secret: 's3cr3t',
 *   code: 'authcodefromdiscord',
 *   redirect_uri: 'https://your.app/redirect',
 *   scope: 'identify guilds'
 * })
 * .then(token => console.log('Access Token:', token.access_token))
 * .catch(err => console.error('Token error:', err));
 */
export default function getToken(dsData) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(`${apiURL}oauth2/token`, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: dsData.client_id,
        client_secret: dsData.client_secret,
        grant_type: 'authorization_code',
        code: dsData.code,
        redirect_uri: dsData.redirect_uri,
        scope: dsData.scope,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then((data) => {
        // Error Validator
        const result = errorValidator(data);
        if (!result.error) resolve(result.data);
        else reject(result.error);
      })
      .catch((err) => {
        reject({ code: err.response.status, message: err.message });
      });
  });
}
