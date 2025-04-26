// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Refreshes the Discord OAuth2 access token using a valid refresh token.
 *
 * This function makes a `POST` request to the Discord API's `/oauth2/token` endpoint
 * to obtain a new access token and refresh token. It uses the `refresh_token` grant type.
 *
 * @param {Object} dsData - The Discord OAuth2 data required for token refresh.
 * @param {string} dsData.client_id - Your application's client ID.
 * @param {string} dsData.client_secret - Your application's client secret.
 * @param {string} dsData.code - The original authorization code (optional but may be required by some flows).
 * @param {string} dsData.refresh_token - The current valid refresh token.
 * @param {string} dsData.redirect_uri - The redirect URI used in the original OAuth2 flow.
 * @param {string} dsData.scope - The scope(s) to request (e.g., 'identify guilds').
 *
 * @returns {Promise<Record<string, any>>} Resolves with a new token object from the Discord API:
 * {
 *   access_token: string,
 *   token_type: string,
 *   expires_in: number,
 *   refresh_token: string,
 *   scope: string
 * }
 *
 * @throws {Record<string, any>} If the request fails, rejects with an error object containing `code` and `message`.
 *
 * @example
 * refreshToken({
 *   client_id: '1234567890',
 *   client_secret: 'mySecret',
 *   code: 'optional-code',
 *   refresh_token: 'old-refresh-token',
 *   redirect_uri: 'https://myapp.com/callback',
 *   scope: 'identify guilds'
 * })
 *   .then(newTokens => console.log('New Access Token:', newTokens.access_token))
 *   .catch(err => console.error('Failed to refresh token:', err));
 */
export default function refreshToken(dsData) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(`${apiURL}oauth2/token`, {
      method: 'POST',
      body: new URLSearchParams({
        client_id: dsData.client_id,
        client_secret: dsData.client_secret,
        grant_type: 'refresh_token',
        code: dsData.code,
        refresh_token: dsData.refresh_token,
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
