// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Retrieves the authenticated user's linked connections from the Discord API.
 *
 * This includes external accounts the user has connected to their Discord profile,
 * such as Steam, Twitch, YouTube, GitHub, etc.
 *
 * Requires the `connections` scope to be present in the OAuth2 token.
 *
 * @param {string} access_token - The OAuth2 access token used to authenticate the user.
 *
 * @returns {Promise<Array<Record<string, any>>>} Resolves with an array of connection objects.
 *
 * @throws {Record<string, any>} If the request fails, rejects with an error object containing `code` and `message`.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#get-user-connections} Discord API Reference
 *
 * @example
 * getUserConnections('your_access_token')
 *   .then(connections => {
 *     connections.forEach(conn => {
 *       console.log(`${conn.type}: ${conn.name}`);
 *     });
 *   })
 *   .catch(err => console.error('Failed to get connections:', err));
 */
export default function getUserConnections(access_token) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(`${apiURL}users/@me/connections`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
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
