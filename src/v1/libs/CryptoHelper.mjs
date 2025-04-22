import crypto from 'crypto';
import fs from 'fs';
import { objType } from '../../v1/basics/objFilter.mjs';

// Detecta se estamos no browser
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

class CryptoHelper {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'aes-256-gcm';
    this.outputEncoding = options.outputEncoding || 'hex';
    this.inputEncoding = options.inputEncoding || 'utf8';
    this.authTagLength = options.authTagLength || 16;

    // Key deve ter 32 bytes para AES-256
    this.key = options.key || this.generateKey();
  }

  // --- Geração Segura de Chave e IV ---

  generateKey(value = 32) {
    return crypto.randomBytes(value); // 256-bit
  }

  generateIV(value = 12) {
    return crypto.randomBytes(value); // 96-bit padrão para GCM
  }

  // --- Criptografia ---

  encrypt(data, iv = this.generateIV()) {
    const plainText = this.#serialize(data);

    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv, {
      authTagLength: this.authTagLength,
    });

    let encrypted = cipher.update(plainText, this.inputEncoding);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString(this.outputEncoding),
      encrypted: encrypted.toString(this.outputEncoding),
      authTag: authTag.toString(this.outputEncoding),
    };
  }

  // --- Descriptografia ---

  decrypt({ iv, encrypted, authTag }, expectedType = null) {
    const ivBuffer = Buffer.from(iv, this.outputEncoding);
    const encryptedBuffer = Buffer.from(encrypted, this.outputEncoding);
    const authTagBuffer = Buffer.from(authTag, this.outputEncoding);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer, {
      authTagLength: this.authTagLength,
    });

    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encryptedBuffer, null, this.inputEncoding);
    decrypted += decipher.final(this.inputEncoding);
    const { value, type } = this.#deserialize(decrypted);

    if (expectedType) this.#validateDeserializedType(expectedType, type);
    return value;
  }

  getTypeFromEncrypted({ iv, encrypted, authTag }) {
    const ivBuffer = Buffer.from(iv, this.outputEncoding);
    const encryptedBuffer = Buffer.from(encrypted, this.outputEncoding);
    const authTagBuffer = Buffer.from(authTag, this.outputEncoding);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer, {
      authTagLength: this.authTagLength,
    });

    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encryptedBuffer, null, this.inputEncoding);
    decrypted += decipher.final(this.inputEncoding);

    const { type } = this.#deserialize(decrypted);
    return type;
  }

  // --- Utilitários: salvar e carregar chave/IV de arquivo ---

  saveKeyToFile(filename = 'secret.key') {
    const data = this.key.toString('hex');
    if (isBrowser) {
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else fs.writeFileSync(filename, data);
  }

  saveConfigToFile(filename = 'crypto-config.json') {
    const configData = JSON.stringify(this.exportConfig(), null, 2);
    if (isBrowser) {
      const blob = new Blob([configData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else fs.writeFileSync(filename, configData);
  }

  async loadConfigFromFile(file) {
    if (isBrowser) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const config = JSON.parse(reader.result);
            resolve(this.importConfig(config));
          } catch (err) {
            reject(new Error('Invalid config JSON file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    } else {
      const raw = fs.readFileSync(file, 'utf8');
      const config = JSON.parse(raw);
      return this.importConfig(config);
    }
  }

  async loadKeyFromFile(file) {
    if (isBrowser) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const hexKey = reader.result.trim();
          const keyBuffer = Buffer.from(hexKey, 'hex');
          if (keyBuffer.length !== 32) reject(new Error('Key must be 32 bytes for AES-256'));
          else {
            this.key = keyBuffer;
            resolve(keyBuffer);
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    } else {
      const hexKey = fs.readFileSync(file, 'utf8');
      const keyBuffer = Buffer.from(hexKey, 'hex');
      if (keyBuffer.length !== 32) throw new Error('Key must be 32 bytes');

      this.key = keyBuffer;
      return keyBuffer;
    }
  }

  // --- Exportar e importar configuração como JSON ---

  exportConfig() {
    return {
      algorithm: this.algorithm,
      outputEncoding: this.outputEncoding,
      inputEncoding: this.inputEncoding,
      key: this.key.toString('hex'),
      authTagLength: this.authTagLength,
    };
  }

  importConfig(config) {
    if (typeof config.algorithm === 'string') this.algorithm = config.algorithm;
    if (typeof config.outputEncoding === 'string') this.outputEncoding = config.outputEncoding;
    if (typeof config.inputEncoding === 'string') this.inputEncoding = config.inputEncoding;
    if (typeof config.authTagLength === 'string') this.authTagLength = config.authTagLength;
    if (typeof config.key === 'string') this.key = Buffer.from(config.key, 'hex');
  }

  #valueConvertTypes = {
    weakmap: () => {
      throw new Error('WeakMap cannot be serialized');
    },
    weakset: () => {
      throw new Error('WeakSet cannot be serialized');
    },
    promise: () => {
      throw new Error('Promise cannot be serialized');
    },
    function: () => {
      throw new Error('Function cannot be serialized');
    },
    regexp: (data) => JSON.stringify({ __type: 'RegExp', value: data.toString() }),
    htmlElement: (data) => JSON.stringify({ __type: 'HTMLElement', value: data.outerHTML }),
    date: (data) => JSON.stringify({ __type: 'Date', value: data.toISOString() }),
    bigint: (data) => JSON.stringify({ __type: 'BigInt', value: data.toString() }),
    number: (data) => JSON.stringify({ __type: 'Number', value: data }),
    boolean: (data) => JSON.stringify({ __type: 'Boolean', value: data }),
    null: (data) => JSON.stringify({ __type: 'Null' }),
    undefined: (data) => JSON.stringify({ __type: 'Undefined' }),
    map: (data) =>
      JSON.stringify({
        __type: 'Map',
        value: Array.from(data.entries()),
      }),
    set: (data) =>
      JSON.stringify({
        __type: 'Set',
        value: Array.from(data.values()),
      }),
    symbol: (data) => JSON.stringify({ __type: 'Symbol', value: data.description }),
    array: (data) => JSON.stringify({ __type: 'Array', value: data }),
    object: (data) => JSON.stringify({ __type: 'JSON', value: data }),
    buffer: (data) => JSON.stringify({ __type: 'Buffer', value: data.toString('base64') }),
  };

  #valueTypes = {
    RegExp: (value) => {
      const match = value.match(/^\/(.*)\/([gimsuy]*)$/);
      return match ? new RegExp(match[1], match[2]) : new RegExp(value);
    },
    HTMLElement: (value) => {
      if (typeof document === 'undefined')
        throw new Error('HTMLElement deserialization is only supported in browsers');
      const div = document.createElement('div');
      div.innerHTML = value;
      return div.firstElementChild;
    },
    Date: (value) => new Date(value),
    BigInt: (value) => BigInt(value),
    Number: (value) => Number(value),
    Boolean: (value) => Boolean(value),
    Null: (value) => null,
    Undefined: (value) => undefined,
    Map: (value) => new Map(value),
    Set: (value) => new Set(value),
    Symbol: (value) => Symbol(value),
    Array: (value) => value,
    JSON: (value) => value,
    Buffer: (value) => Buffer.from(value, 'base64'),
  };

  #serialize(data) {
    const type = objType(data) || 'undefined';
    if (type === 'string') return data;
    else if (this.#valueConvertTypes[type]) return this.#valueConvertTypes[type](data);
    throw new Error(`Unsupported data type for encryption: ${type}`);
  }

  #deserialize(text) {
    try {
      const parsed = JSON.parse(text);
      const type = parsed.__type;

      if (typeof type !== 'string') return { value: text, type: 'String' };
      if (typeof this.#valueTypes[type] === 'function')
        return {
          value: this.#valueTypes[type](parsed.value),
          type,
        };
      else return { value: text, type: 'Unknown' };
    } catch {
      return { value: text, type: 'Unknown' };
    }
  }

  #validateDeserializedType(expected, actual) {
    if (expected !== actual)
      throw new Error(`Type mismatch: expected ${expected}, but got ${actual}`);
  }
}

export default CryptoHelper;
