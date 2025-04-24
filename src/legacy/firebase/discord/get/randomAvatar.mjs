// @ts-nocheck

import tinyDice from '../../../libs/dice.mjs';

/**
 * Generates a random Discord avatar URL or returns a specified avatar URL based on the provided value.
 * If no value is provided, a random avatar from the Discord CDN is selected.
 *
 * @function
 * @param {string|number|null} [value=null] - The avatar number or string. If provided, it will return the avatar associated with that number or string.
 * If no value is provided or the value is invalid, a random avatar will be generated.
 * @param {string} [url='https://cdn.discordapp.com/embed/avatars/'] - The base URL for the Discord avatars. By default, it uses the CDN URL.
 *
 * @returns {string} The URL of the avatar image.
 *
 * @example
 * // Returns a random avatar URL
 * const avatarURL = randomAvatar();
 * console.log(avatarURL); // Example output: https://cdn.discordapp.com/embed/avatars/1234.png
 *
 * @example
 * // Returns a specific avatar URL based on the value
 * const avatarURL = randomAvatar(2);
 * console.log(avatarURL); // Example output: https://cdn.discordapp.com/embed/avatars/2.png
 */
export default function randomAvatar(
  value = null,
  url = 'https://cdn.discordapp.com/embed/avatars/',
) {
  // Random
  if (typeof value !== 'number' && typeof value !== 'string')
    return url + tinyDice.vanilla(4) + '.png';
  // Nope
  else return url + 'https://cdn.discordapp.com/embed/avatars/' + value + '.png';
}
