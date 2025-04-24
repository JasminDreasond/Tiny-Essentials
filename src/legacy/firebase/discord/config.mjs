// @ts-nocheck

/**
 * Configuration object containing Discord API and OAuth2 URLs.
 *
 * @typedef {Object} Config
 * @property {string} url - The base URL for the Discord API.
 * @property {string} oauth2 - The OAuth2 authorization URL for Discord.
 */

/**
 * The configuration object for the Discord API and OAuth2.
 *
 * @type {Config}
 */
const config = {
  url: 'https://discord.com/api/',
  oauth2: 'https://discord.com/oauth2/authorize',
};

export default config;
