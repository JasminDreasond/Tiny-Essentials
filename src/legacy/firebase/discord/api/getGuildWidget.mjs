// @ts-nocheck

import getJsonFetch from '../../../http/fetch/json.mjs';
import config from '../config.mjs';
import errorValidator from '../get/errorValidator.mjs';

/**
 * Fetches the public widget data for a Discord guild (server).
 * This includes online members, presence counts, and basic guild information,
 * but only if the widget is enabled in the server settings.
 *
 * @param {string} guildID - The ID of the guild whose widget is to be fetched.
 *
 * @returns {Promise<Record<string, any>>} Resolves with the guild widget data if successful.
 *
 * @throws {Record<string, any>} If the request fails or the widget is disabled, rejects with an object containing a `code` and `message`.
 *
 * @example
 * getGuildWidget('123456789012345678')
 *   .then((data) => console.log(data))
 *   .catch((err) => console.error('Widget error:', err));
 */
export default function getGuildWidget(guildID) {
  return new Promise(function (resolve, reject) {
    // API URL
    const apiURL = config.url;

    // Response
    getJsonFetch(`${apiURL}guilds/${encodeURIComponent(guildID)}/widget.json`, {
      method: 'GET',
      headers: {
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
