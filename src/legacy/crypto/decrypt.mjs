// Module
import crypto from 'crypto';

const cryptoAction = function (tinyCrypto, key, text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), tinyCrypto.stringType);
  let encryptedText = Buffer.from(textParts.join(':'), tinyCrypto.stringType);
  let decipher = crypto.createDecipheriv(tinyCrypto.algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

// Export
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
