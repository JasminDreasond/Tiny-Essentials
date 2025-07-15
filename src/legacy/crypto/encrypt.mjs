// Module
import { createCipheriv, randomBytes } from 'crypto';

/**
 * Encrypts a given string using the specified algorithm, key, and string encoding.
 *
 * @private
 * @param {Object} tinyCrypto - The crypto configuration object.
 * @param {number} tinyCrypto.IV_LENGTH - The byte length of the initialization vector (e.g., 16).
 * @param {string} tinyCrypto.algorithm - The encryption algorithm (e.g., 'aes-256-cbc').
 * @param {BufferEncoding} tinyCrypto.stringType - The encoding to use when converting buffers to strings (e.g., 'hex', 'base64').
 * @param {string} key - The encryption key.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} The encrypted string in the format `iv:encryptedData`.
 */
const cryptoAction = function (tinyCrypto, key, text) {
  let iv = randomBytes(tinyCrypto.IV_LENGTH);
  let cipher = createCipheriv(tinyCrypto.algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString(tinyCrypto.stringType) + ':' + encrypted.toString(tinyCrypto.stringType);
};

/**
 * Encrypts a string using one or more keys from the provided crypto configuration.
 *
 * If `tinyCrypto.key` is an array, the encryption is applied sequentially (layered encryption).
 *
 * @param {Object} tinyCrypto - The crypto configuration object.
 * @param {string|string[]} tinyCrypto.key - A single encryption key or an array of keys to apply in sequence.
 * @param {number} tinyCrypto.IV_LENGTH - The byte length of the initialization vector.
 * @param {string} tinyCrypto.algorithm - The encryption algorithm to use.
 * @param {BufferEncoding} tinyCrypto.stringType - The encoding type used for output (e.g., 'hex', 'base64').
 * @param {string} text - The plain text string to encrypt.
 * @returns {string} The final encrypted string.
 * @deprecated
 */
export function encrypt(tinyCrypto, text) {
  // Prepare Result
  let result = text;
  if (!Array.isArray(tinyCrypto.key)) {
    tinyCrypto.key = [tinyCrypto.key];
  }
  for (const item in tinyCrypto.key) {
    result = cryptoAction(tinyCrypto, tinyCrypto.key[item], result);
  }

  // Complete
  return result;
}
