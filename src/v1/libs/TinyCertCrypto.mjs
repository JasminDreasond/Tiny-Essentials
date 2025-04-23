import fs from 'fs';
import crypto from 'crypto';
import { Buffer } from 'buffer';

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

class TinyCertCrypto {
  #certRegex =
    /-----BEGIN\s+(?:RSA\s+)?(PUBLIC|PRIVATE)\s+KEY-----([\s\S]+?)-----END\s+(?:RSA\s+)?\1\s+KEY-----/;

  constructor({
    publicCertPath = null,
    privateKeyPath = null,
    publicCertBuffer = null,
    privateKeyBuffer = null,
  } = {}) {
    if (!publicCertPath && !publicCertBuffer && isBrowser)
      throw new Error('In browser, publicCertPath or publicCertBuffer must be provided');

    if (
      publicCertBuffer &&
      typeof publicCertBuffer !== 'string' &&
      !Buffer.isBuffer(publicCertBuffer)
    )
      throw new TypeError('publicCertBuffer must be a string or Buffer');

    if (
      privateKeyBuffer &&
      typeof privateKeyBuffer !== 'string' &&
      !Buffer.isBuffer(privateKeyBuffer)
    )
      throw new TypeError('privateKeyBuffer must be a string or Buffer');

    this.source = null;
    this.publicCertPath = publicCertPath;
    this.privateKeyPath = privateKeyPath;
    this.publicCertBuffer = publicCertBuffer;
    this.privateKeyBuffer = privateKeyBuffer;
    this.publicKey = null;
    this.privateKey = null;
    this.publicCert = null;
    this.metadata = null;
  }

  async generateX509Cert(subjectFields, options = {}) {
    if (this.publicKey || this.privateKey || this.publicCert)
      throw new Error('A certificate is already loaded into the instance.');

    const {
      modulusLength = 2048,
      publicKeyEncoding = { type: 'spki', format: 'pem' },
      privateKeyEncoding = { type: 'pkcs8', format: 'pem' },
      validityInYears = 1,
      randomBytesLength = 16,
    } = options;

    const publicKeyType = options.publicKeyType || publicKeyEncoding.type;
    const privateKeyType = options.privateKeyType || privateKeyEncoding.type;

    if (isBrowser) throw new Error('generateKeyPair can only be used in Node.js environments');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength,
      publicKeyEncoding: { ...publicKeyEncoding, type: publicKeyType },
      privateKeyEncoding: { ...privateKeyEncoding, type: privateKeyType },
    });

    this.publicKey = crypto.createPublicKey(publicKey);
    this.privateKey = crypto.createPrivateKey(privateKey);
    this.publicCertPath = 'MEMORY';
    this.privateKeyPath = 'MEMORY';
    this.source = 'memory';
    this.publicCertBuffer = publicKey;
    this.privateKeyBuffer = privateKey;

    const cert = await this.#generateCertificate(
      subjectFields,
      publicKey,
      privateKey,
      validityInYears,
      randomBytesLength,
    );

    await this.#loadX509Certificate(cert);
    return { publicKey, privateKey, cert };
  }

  async #generateCertificate(subject, publicKey, privateKey, validityInYears, randomBytesLength) {
    const forge = await import('node-forge');
    const { pki } = forge.default;
    const cert = pki.createCertificate();

    cert.publicKey = pki.publicKeyFromPem(publicKey);
    cert.serialNumber = Buffer.from(crypto.randomBytes(randomBytesLength)).toString('hex');
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + validityInYears);

    const attrs = [];
    for (const name in subject) attrs.push({ name, value: subject[name] });

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(pki.privateKeyFromPem(privateKey));
    return pki.certificateToPem(cert);
  }

  async init() {
    if (this.publicKey || this.privateKey || this.publicCert)
      throw new Error('A certificate is already loaded into the instance.');

    if (!this.publicCertPath && !this.publicCertBuffer)
      throw new Error('Public certificate is required to initialize');

    if (!isBrowser) {
      const usedPublicBuffer = !!this.publicCertBuffer;
      const usedPrivateBuffer = !!this.privateKeyBuffer;
      const publicPem = usedPublicBuffer
        ? typeof this.publicCertBuffer === 'string'
          ? this.publicCertBuffer
          : this.publicCertBuffer.toString('utf-8')
        : fs.readFileSync(this.publicCertPath, 'utf-8');

      this.publicKey = crypto.createPublicKey(publicPem);
      await this.#loadX509Certificate(publicPem);

      if (this.privateKeyPath || this.privateKeyBuffer) {
        const privatePem = usedPrivateBuffer
          ? typeof this.privateKeyBuffer === 'string'
            ? this.privateKeyBuffer
            : this.privateKeyBuffer.toString('utf-8')
          : fs.readFileSync(this.privateKeyPath, 'utf-8');

        this.privateKey = crypto.createPrivateKey(privatePem);
      }

      this.source = this.publicCertBuffer || this.privateKeyBuffer ? 'memory' : 'file';
    } else {
      const publicPem = this.publicCertBuffer
        ? typeof this.publicCertBuffer === 'string'
          ? this.publicCertBuffer
          : new TextDecoder().decode(this.publicCertBuffer)
        : await fetch(this.publicCertPath).then((r) => r.text());

      this.publicKey = await window.crypto.subtle.importKey(
        'spki',
        this.#pemToArrayBuffer(publicPem),
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt'],
      );

      await this.#loadX509Certificate(publicPem);

      if (this.privateKeyPath || this.privateKeyBuffer) {
        const privatePem = this.privateKeyBuffer
          ? typeof this.privateKeyBuffer === 'string'
            ? this.privateKeyBuffer
            : new TextDecoder().decode(this.privateKeyBuffer)
          : await fetch(this.privateKeyPath).then((r) => r.text());

        this.privateKey = await window.crypto.subtle.importKey(
          'pkcs8',
          this.#pemToArrayBuffer(privatePem),
          {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
          },
          true,
          ['decrypt'],
        );
      }

      this.source = 'url';
    }
  }

  async #loadX509Certificate(certPem) {
    if (!isBrowser) {
      this.publicCert = new crypto.X509Certificate(certPem);
      this.metadata = {
        subject: this.publicCert.subject,
        issuer: this.publicCert.issuer,
        serialNumber: this.publicCert.serialNumber,
        validFrom: this.publicCert.validFrom,
        validTo: this.publicCert.validTo,
      };
    } else {
      const forge = await import('node-forge');
      const { pki } = forge.default;
      try {
        const cert = pki.certificateFromPem(certPem);
        this.metadata = {
          subject: cert.subject.attributes
            .map((attr) => `${attr.shortName}=${attr.value}`)
            .join(', '),
          issuer: cert.issuer.attributes
            .map((attr) => `${attr.shortName}=${attr.value}`)
            .join(', '),
          serialNumber: cert.serialNumber,
          validFrom: cert.validity.notBefore.toISOString(),
          validTo: cert.validity.notAfter.toISOString(),
        };
      } catch (err) {
        throw new Error('Failed to parse X.509 certificate in browser: ' + err.message);
      }
    }
  }

  extractCertMetadata() {
    return this.metadata || {};
  }

  async encryptJson(jsonObject) {
    if (!this.publicKey)
      throw new Error('Public key is not initialized. Call init() or generateKeyPair() first.');

    const jsonString = JSON.stringify(jsonObject);
    const data = new TextEncoder().encode(jsonString);

    if (!isBrowser) {
      const encrypted = crypto.publicEncrypt(this.publicKey, data);
      return encrypted.toString('base64');
    } else {
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        this.publicKey,
        data,
      );
      return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    }
  }

  async decryptToJson(encryptedBase64) {
    if (!this.privateKey) throw new Error('Private key is required for decryption');

    const data = !isBrowser
      ? Buffer.from(encryptedBase64, 'base64')
      : Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

    if (!isBrowser) {
      const decrypted = crypto.privateDecrypt(this.privateKey, data);
      return JSON.parse(decrypted.toString('utf-8'));
    } else {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        this.privateKey,
        data,
      );
      return JSON.parse(new TextDecoder().decode(decrypted));
    }
  }

  hasKeys() {
    return this.publicKey !== null && this.privateKey !== null;
  }

  reset() {
    this.publicKey = null;
    this.privateKey = null;
    this.publicCert = null;
    this.metadata = null;
    this.source = null;
  }

  #pemToArrayBuffer(pem) {
    const match = pem.match(this.#certRegex);
    if (!match) throw new Error('Invalid PEM format');

    const b64 = match[2].replace(/\s/g, '');
    const byteStr = atob(b64);
    const bytes = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
    return bytes.buffer;
  }
}

export default TinyCertCrypto;
