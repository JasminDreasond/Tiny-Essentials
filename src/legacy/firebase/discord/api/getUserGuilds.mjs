// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Retrieves a list of guilds (servers) the authenticated user is a member of.
 *
 * This function uses the Discord OAuth2 API and requires the `guilds` scope
 * in the access token. It returns basic information about each guild, such as
 * name, ID, owner status, permissions, and icon.
 *
 * Note: This does NOT include information available only to bots, like full member lists.
 *
 * @param {string} access_token - The OAuth2 access token used to authenticate the user.
 *
 * @returns {Promise<Array<Record<string, any>>>} Resolves with an array of guild objects the user is in.
 *
 * @throws {Record<string, any>} If the request fails, rejects with an error object containing `code` and `message`.
 *
 * @example
 * getUserGuilds('your_access_token')
 *   .then(guilds => {
 *     guilds.forEach(guild => {
 *       console.log(`${guild.name} (${guild.id})`);
 *     });
 *   })
 *   .catch(err => console.error('Failed to get guilds:', err));
 */
export default function getUserGuilds(access_token) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(`${apiURL}users/@me/guilds`, {
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
