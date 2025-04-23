import fs from 'fs';
import crypto from 'crypto';
import { Buffer } from 'buffer';

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

class TinyCertCrypto {
  #certRegex = /-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/;
  #keyRegex =
    /-----BEGIN\s+(?:RSA\s+)?(PUBLIC|PRIVATE)\s+KEY-----([\s\S]+?)-----END\s+(?:RSA\s+)?\1\s+KEY-----/;

  constructor({
    publicCertPath = null,
    privateKeyPath = null,
    publicCertBuffer = null,
    privateKeyBuffer = null,
    cryptoType = 'RSA-OAEP',
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
    this.cryptoType = cryptoType;
    this.publicCertPath = publicCertPath;
    this.privateKeyPath = privateKeyPath;
    this.publicCertBuffer = publicCertBuffer;
    this.privateKeyBuffer = privateKeyBuffer;
    this.publicKey = null;
    this.privateKey = null;
    this.publicCert = null;
    this.metadata = null;
    this.forge = null;
  }

  async #fetchNodeForge() {
    if (!this.forge) {
      const forge = await import(/* webpackMode: "eager" */ 'node-forge');
      this.forge = forge.default;
    }
    return this.#getNodeForge();
  }

  async fetchNodeForge() {
    return this.#fetchNodeForge();
  }

  #getNodeForge() {
    return this.forge;
  }

  getNodeForge() {
    return this.#getNodeForge();
  }

  #detectPemType(pemString) {
    if (this.#certRegex.test(pemString)) return 'certificate';
    const keyMatch = this.#keyRegex.exec(pemString);
    if (keyMatch) return keyMatch[1].toLowerCase() + '_key'; // "public_key" or "private_key"
    return 'unknown';
  }

  async generateX509Cert(subjectFields, options = {}) {
    // Errors
    if (this.publicKey || this.privateKey || this.publicCert)
      throw new Error('A certificate is already loaded into the instance.');

    // Prepare cert
    const { pki } = await this.#fetchNodeForge();
    const {
      modulusLength = 2048,
      publicKeyEncoding = { type: 'spki', format: 'pem' },
      privateKeyEncoding = { type: 'pkcs8', format: 'pem' },
      validityInYears = 1,
      randomBytesLength = 16,
    } = options;

    // Value types
    const publicKeyType = options.publicKeyType || publicKeyEncoding.type;
    const privateKeyType = options.privateKeyType || privateKeyEncoding.type;

    // Validator
    if (isBrowser) throw new Error('generateKeyPair can only be used in Node.js environments');

    // Generate keys
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength,
      publicKeyEncoding: { ...publicKeyEncoding, type: publicKeyType },
      privateKeyEncoding: { ...privateKeyEncoding, type: privateKeyType },
    });

    // Get pem files
    const { cert, publicPem, privatePem } = this.#generateCertificate(
      subjectFields,
      publicKey,
      privateKey,
      validityInYears,
      randomBytesLength,
    );

    // Insert data
    this.publicKey = publicPem;
    this.privateKey = privatePem;

    this.publicCertPath = 'MEMORY';
    this.privateKeyPath = 'MEMORY';
    this.source = 'memory';
    this.publicCertBuffer = publicKey;
    this.privateKeyBuffer = privateKey;

    this.#loadX509Certificate(cert);
    return { publicKey, privateKey, cert };
  }

  #generateCertificate(subject, publicKey, privateKey, validityInYears, randomBytesLength) {
    const { pki } = this.forge;
    const cert = pki.createCertificate();
    const publicPem = pki.publicKeyFromPem(publicKey);
    const privatePem = pki.privateKeyFromPem(privateKey);

    cert.publicKey = publicPem;
    cert.serialNumber = Buffer.from(crypto.randomBytes(randomBytesLength)).toString('hex');
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + validityInYears);

    const attrs = [];
    for (const name in subject) attrs.push({ name, value: subject[name] });

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(privatePem);
    return { cert: pki.certificateToPem(cert), publicPem, privatePem };
  }

  async init() {
    // Errors
    if (this.publicKey || this.privateKey || this.publicCert)
      throw new Error('A certificate is already loaded into the instance.');

    if (!this.publicCertPath && !this.publicCertBuffer)
      throw new Error('Public certificate is required to initialize');

    // Load public key
    this.metadata = {};
    const { pki } = await this.#fetchNodeForge();
    const loadPublicKey = (publicPem) => {
      // File type
      const fileType = this.#detectPemType(publicPem);

      // Cert
      if (fileType === 'certificate') {
        const cert = pki.certificateFromPem(publicPem);
        this.publicKey = cert.publicKey;
        this.#loadX509Certificate(cert);
      }

      // Public key
      else if (fileType === 'public_key') this.publicKey = pki.publicKeyFromPem(publicPem);
      else throw new Error('Public key is required to initialize');
    };

    const loadPrivateKey = (privatePem) => {
      const fileType = this.#detectPemType(privatePem);
      if (fileType === 'private_key') this.privateKey = pki.privateKeyFromPem(privatePem);
      else throw new Error('Private key is required to initialize');
    };

    // Nodejs
    if (!isBrowser) {
      const usedPublicBuffer = !!this.publicCertBuffer;
      const usedPrivateBuffer = !!this.privateKeyBuffer;

      // Public key
      const publicPem = usedPublicBuffer
        ? typeof this.publicCertBuffer === 'string'
          ? this.publicCertBuffer
          : this.publicCertBuffer.toString('utf-8')
        : fs.readFileSync(this.publicCertPath, 'utf-8');
      loadPublicKey(publicPem);

      // Private Key
      if (this.privateKeyPath || this.privateKeyBuffer) {
        const privatePem = usedPrivateBuffer
          ? typeof this.privateKeyBuffer === 'string'
            ? this.privateKeyBuffer
            : this.privateKeyBuffer.toString('utf-8')
          : fs.readFileSync(this.privateKeyPath, 'utf-8');

        loadPrivateKey(privatePem);
      }

      // Insert source
      this.source = this.publicCertBuffer || this.privateKeyBuffer ? 'memory' : 'file';
    }

    // Browser
    else {
      // Public key
      const publicPem = this.publicCertBuffer
        ? typeof this.publicCertBuffer === 'string'
          ? this.publicCertBuffer
          : new TextDecoder().decode(this.publicCertBuffer)
        : await fetch(this.publicCertPath).then((r) => r.text());
      loadPublicKey(publicPem);

      // Private key
      if (this.privateKeyPath || this.privateKeyBuffer) {
        const privatePem = this.privateKeyBuffer
          ? typeof this.privateKeyBuffer === 'string'
            ? this.privateKeyBuffer
            : new TextDecoder().decode(this.privateKeyBuffer)
          : await fetch(this.privateKeyPath).then((r) => r.text());
        loadPrivateKey(privatePem);
      }

      // Insert key
      this.source = 'url';
    }
  }

  #loadX509Certificate(certPem) {
    const { pki } = this.forge;
    try {
      const cert = typeof certPem === 'string' ? pki.certificateFromPem(certPem) : certPem;
      this.metadata = {
        subject: cert.subject.attributes
          .map((attr) => `${attr.shortName}=${attr.value}`)
          .join(', '),
        issuer: cert.issuer.attributes.map((attr) => `${attr.shortName}=${attr.value}`).join(', '),
        serialNumber: cert.serialNumber,
        validFrom: cert.validity.notBefore.toISOString(),
        validTo: cert.validity.notAfter.toISOString(),
      };
    } catch (err) {
      throw new Error('Failed to parse X.509 certificate in browser: ' + err.message);
    }
  }

  extractCertMetadata() {
    return this.metadata || {};
  }

  encryptJson(jsonObject) {
    if (!this.publicKey)
      throw new Error('Public key is not initialized. Call init() or generateKeyPair() first.');
    const jsonString = JSON.stringify(jsonObject);
    const encrypted = this.publicKey.encrypt(jsonString, this.cryptoType);
    return this.forge.util.encode64(encrypted);
  }

  decryptToJson(encryptedBase64) {
    if (!this.privateKey) throw new Error('Private key is required for decryption');
    const data = this.forge.util.decode64(encryptedBase64);
    const decrypted = this.privateKey.decrypt(data, this.cryptoType);
    return JSON.parse(decrypted);
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
}

export default TinyCertCrypto;
