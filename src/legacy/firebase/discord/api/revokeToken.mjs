// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import credentials from '../get/credentials.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Revokes an OAuth2 access token from the Discord API.
 *
 * This function makes a `POST` request to the `/oauth2/token/revoke` endpoint to invalidate
 * a user's access token. This is useful for logout or unlink flows, and requires HTTP Basic Auth
 * using the application's client ID and client secret encoded in base64.
 *
 * @param {string} access_token - The Discord OAuth2 access token to be revoked.
 * @param {Object} tinyAuth - An object with the client_id and client_secret used to generate the Basic Auth credentials.
 * @param {string} tinyAuth.client_id - The Discord application client ID.
 * @param {string} tinyAuth.client_secret - The Discord application client secret.
 *
 * @returns {Promise<Record<string, any>>} Resolves when the token is successfully revoked.
 * The response may not contain any body if successful, so `result.data` may be empty.
 *
 * @throws {Record<string, any>} If the request fails, rejects with an error object containing `code` and `message`.
 *
 * @example
 * revokeToken('user-access-token', {
 *   client_id: '1234567890',
 *   client_secret: 'superSecret'
 * })
 *   .then(() => console.log('Token revoked'))
 *   .catch(err => console.error('Failed to revoke token:', err));
 */
export default function revokeToken(access_token, tinyAuth) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;
    const credentials = credentials(tinyAuth);

    // Response
    getJsonFetch(`${apiURL}oauth2/token/revoke`, {
      method: 'POST',
      body: new URLSearchParams({
        token: access_token,
      }),
      headers: {
        Authorization: `Basic ${credentials}`,
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
