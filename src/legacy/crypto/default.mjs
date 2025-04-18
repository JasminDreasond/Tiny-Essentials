/**
 * Default cryptographic configuration for encryption and decryption operations.
 *
 * @typedef {Object} DefaultCrypto
 * @property {number} IV_LENGTH - Length (in bytes) of the Initialization Vector (IV). Usually 16 for AES.
 * @property {string} algorithm - The encryption algorithm used (e.g., 'aes-256-cbc').
 * @property {string} key - The default encryption/decryption key (must match the required length for the chosen algorithm).
 * @property {BufferEncoding} stringType - Encoding used for converting strings to Buffers (e.g., 'hex', 'base64').
 */

/**
 * @type {DefaultCrypto}
 */
const defaultCrypto = {
  IV_LENGTH: 16,
  algorithm: 'aes-256-cbc',
  key: 'tinypudding123456789012345678900',
  stringType: 'hex',
};

export default defaultCrypto;
