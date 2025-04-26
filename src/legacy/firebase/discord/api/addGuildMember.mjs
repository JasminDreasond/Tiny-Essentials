// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Adds a member to a Discord guild (server) using a valid OAuth2 access token and a bot token.
 * This method requires the `guilds.join` OAuth2 scope to be granted by the user.
 *
 * @param {string} bot_token - The Bot Token used for authorization (`Bot <token>`).
 * @param {Object} data - The data required to add the member to the guild.
 * @param {string} data.guild_id - The ID of the guild (server) the user should be added to.
 * @param {string} data.user_id - The ID of the user to be added.
 * @param {string} data.access_token - The OAuth2 access token granted by the user.
 * @param {string[]} [data.roles] - An optional array of role IDs to assign to the member.
 * @param {string} [data.nickname] - Optional nickname to assign to the user in the guild.
 * @param {boolean} [data.mute=false] - Whether the user should be server-muted.
 * @param {boolean} [data.deaf=false] - Whether the user should be server-deafened.
 *
 * @returns {Promise<Record<string, any>>} Resolves with the user object if successful, or rejects with an error object.
 *
 * @throws {Record<string, any>} If the request fails or Discord returns an error, rejects with an object containing a `code` and `message`.
 *
 * @example
 * const result = await addGuildMember('your_bot_token', {
 *   guild_id: '1234567890',
 *   user_id: '0987654321',
 *   access_token: 'user_access_token',
 *   roles: ['1122334455'],
 *   nickname: 'CoolUser',
 *   mute: false,
 *   deaf: false,
 * });
 */
export default function addGuildMember(bot_token, data) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(
      `${apiURL}guilds/${encodeURIComponent(data.guild_id)}/members/${encodeURIComponent(data.user_id)}`,
      {
        method: 'PUT',
        body: new URLSearchParams({
          deaf: data.deaf,
          mute: data.mute,
          nick: data.nickname,
          roles: data.roles,
          access_token: data.access_token,
        }),
        headers: {
          Authorization: `Bot ${bot_token}`,
          'Content-Type': 'application/json',
        },
      },
    )
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
