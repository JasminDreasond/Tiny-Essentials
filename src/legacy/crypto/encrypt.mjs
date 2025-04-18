// Module
import crypto from 'crypto';

const cryptoAction = function (tinyCrypto, key, text) {
  let iv = crypto.randomBytes(tinyCrypto.IV_LENGTH);
  let cipher = crypto.createCipheriv(tinyCrypto.algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString(tinyCrypto.stringType) + ':' + encrypted.toString(tinyCrypto.stringType);
};

// Export
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
