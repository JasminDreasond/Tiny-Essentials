// Module
import { createDecipheriv } from 'crypto';

/**
 * Decrypts a given encrypted string using the specified algorithm, key, and string format.
 *
 * @private
 * @param {Object} tinyCrypto - The crypto configuration object.
 * @param {string} tinyCrypto.algorithm - The encryption algorithm (e.g., 'aes-256-cbc').
 * @param {BufferEncoding} tinyCrypto.stringType - The encoding type used in the encrypted string (e.g., 'hex', 'base64').
 * @param {string} key - The secret key used for decryption.
 * @param {string} text - The encrypted text to decrypt. It must be formatted as `iv:encryptedData`.
 * @returns {string} The decrypted string.
 */
const cryptoAction = function (tinyCrypto, key, text) {
  let textParts = text.split(':');
  // @ts-ignore
  let iv = Buffer.from(textParts.shift(), tinyCrypto.stringType);
  let encryptedText = Buffer.from(textParts.join(':'), tinyCrypto.stringType);
  let decipher = createDecipheriv(tinyCrypto.algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

/**
 * Decrypts an encrypted string using one or more keys.
 *
 * If `tinyCrypto.key` is a single key, it will be used directly.
 * If it's an array of keys, decryption will be applied iteratively in sequence (as if reversing layered encryption).
 *
 * @param {Object} tinyCrypto - The crypto configuration object.
 * @param {string|string[]} tinyCrypto.key - A single decryption key or an array of keys to apply sequentially.
 * @param {string} tinyCrypto.algorithm - The encryption algorithm (e.g., 'aes-256-cbc').
 * @param {BufferEncoding} tinyCrypto.stringType - The encoding type used in the encrypted string (e.g., 'hex', 'base64').
 * @param {string} text - The encrypted string to decrypt.
 * @returns {string} The fully decrypted string.
 * @deprecated
 */
export function decrypt(tinyCrypto, text) {
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
