// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Retrieves user information from the Discord API.
 *
 * This function is typically used to fetch the authenticated user's information
 * (`@me`) or a specific user's data by their user ID.
 *
 * @param {string} access_token - The access token used for authentication (typically obtained via OAuth2).
 * @param {string} [type='Bearer'] - The token type (usually 'Bearer' for OAuth2 or 'Bot' for bot tokens).
 * @param {string} [user='@me'] - The user ID to fetch. Use '@me' to get the authenticated user's profile.
 * @param {string} [version=''] - Optional API version prefix (e.g., 'v10/') if needed by your API setup.
 *
 * @returns {Promise<Record<string, any>>} Resolves with the user's profile data returned by Discord.
 *
 * @throws {Record<string, any>} If the request fails, rejects with an error object containing `code` and `message`.
 *
 * @example
 * getUser('access_token_here')
 *   .then(user => console.log('Logged in as:', user.username))
 *   .catch(err => console.error('User fetch failed:', err));
 *
 * @example
 * // Using a bot token to fetch another user
 * getUser('bot_token', 'Bot', '123456789012345678')
 *   .then(user => console.log('User info:', user))
 *   .catch(err => console.error('Error:', err));
 */
export default function getUser(access_token, type = 'Bearer', user = '@me', version = '') {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(`${apiURL}${version}users/${user}`, {
      method: 'GET',
      headers: {
        Authorization: `${type} ${access_token}`,
        'Content-Type': 'application/json',
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
