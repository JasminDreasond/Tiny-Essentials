// @ts-nocheck

// Credits
// https://github.com/joonhocho/firebase-encode/blob/master/src/index.js

// http://stackoverflow.com/a/6969486/692528

/**
 * Escapes special characters in a string to make them safe for use in regular expressions.
 *
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
const escapeRegExp = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

/**
 * Creates encoding and decoding functions for custom characters.
 *
 * This function returns two pairs of functions: one for encoding and decoding
 * the characters to/from their hexadecimal representations and another for encoding
 * and decoding components (without the `/` character).
 *
 * @param {Array<string>} chars - The list of characters to encode/decode.
 * @returns {Record<string, any>} An object containing:
 * - `encode`: Function that encodes characters to hexadecimal format.
 * - `decode`: Function that decodes hexadecimal values back to characters.
 */
const create = (chars) => {
  // Map characters to their hexadecimal representations
  const charCodes = chars.map((c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

  // Maps to convert between character and hexadecimal code
  const charToCode = {};
  const codeToChar = {};

  chars.forEach((c, i) => {
    charToCode[c] = charCodes[i];
    codeToChar[charCodes[i]] = c;
  });

  // Regex for matching characters and their corresponding hex codes
  const charsRegex = new RegExp(`[${escapeRegExp(chars.join(''))}]`, 'g');
  const charCodesRegex = new RegExp(charCodes.join('|'), 'g');

  /**
   * Encodes a string by replacing its characters with their corresponding hexadecimal codes.
   *
   * @param {string} str - The string to encode.
   * @returns {string} The encoded string.
   */
  const encode = (str) => str.replace(charsRegex, (match) => charToCode[match]);

  /**
   * Decodes a string by replacing its hexadecimal codes with their corresponding characters.
   *
   * @param {string} str - The string to decode.
   * @returns {string} The decoded string.
   */
  const decode = (str) => str.replace(charCodesRegex, (match) => codeToChar[match]);

  return { encode, decode };
};

// http://stackoverflow.com/a/19148116/692528
// Create encode and decode functions for specific characters.
const { encode, decode } = create('.$[]#/%'.split(''));

// Create encode and decode functions for components (without `/`).
const { encode: encodeComponents, decode: decodeComponents } = create('.$[]#%'.split(''));

// Export the functions for use.
export { create, encode, decode, encodeComponents, decodeComponents };
