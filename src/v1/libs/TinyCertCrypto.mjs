import fs from 'fs';
import crypto from 'crypto';
import { Buffer } from 'buffer';

/**
 * Determines if the environment is a browser.
 *
 * This constant checks if the code is running in a browser environment by verifying if
 * the `window` object and the `window.document` object are available. It will return `true`
 * if the environment is a browser, and `false` otherwise (e.g., in a Node.js environment).
 *
 * @constant {boolean}
 */
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Class representing a certificate and key management utility.
 *
 * This class provides functionality to load, initialize, and manage X.509 certificates and RSA keys.
 * It supports encryption and decryption operations using RSA keys, and also includes utility methods
 * for certificate handling and metadata extraction.
 *
 * @class
 */
class TinyCertCrypto {
  /**
   * Regular expression for matching X.509 PEM certificates.
   *
   * This pattern captures the base64-encoded body of a certificate
   * enclosed between `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`.
   * It supports multi-line content.
   *
   * @type {RegExp}
   * @private
   */
  #certRegex = /-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/;

  /**
   * Regular expression for matching RSA PEM keys.
   *
   * This pattern captures both RSA public and private keys, supporting
   * the standard PEM formatting:
   * `-----BEGIN [RSA] PUBLIC|PRIVATE KEY-----` to `-----END ... KEY-----`.
   * It captures the key type (PUBLIC|PRIVATE) and the base64 content.
   *
   * @type {RegExp}
   * @private
   */
  #keyRegex =
    /-----BEGIN\s+(?:RSA\s+)?(PUBLIC|PRIVATE)\s+KEY-----([\s\S]+?)-----END\s+(?:RSA\s+)?\1\s+KEY-----/;

  /**
   * Constructs a new instance of TinyCertCrypto.
   *
   * This class provides cross-platform (Node.js and browser) support
   * for handling X.509 certificates and performing RSA-based encryption and decryption.
   *
   * The constructor accepts optional paths or PEM buffers for the public certificate and private key.
   * If used in a browser environment, either `publicCertPath` or `publicCertBuffer` is required.
   *
   * @param {Object} [options={}] - Initialization options.
   * @param {string|null} [options.publicCertPath=null] - Path or URL to the public certificate in PEM format.
   * @param {string|null} [options.privateKeyPath=null] - Path or URL to the private key in PEM format.
   * @param {string|Buffer|null} [options.publicCertBuffer=null] - The public certificate as a PEM string or Buffer.
   * @param {string|Buffer|null} [options.privateKeyBuffer=null] - The private key as a PEM string or Buffer.
   * @param {string} [options.cryptoType='RSA-OAEP'] - The algorithm identifier used with Crypto API.
   *
   * @throws {Error} If in a browser and neither `publicCertPath` nor `publicCertBuffer` is provided.
   * @throws {TypeError} If provided buffers are not strings or Buffers.
   */
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

  /**
   * Dynamically imports the `node-forge` module and stores it in the instance.
   * Ensures the module is loaded only once (lazy singleton).
   *
   * This method is private and should not be called directly from outside.
   *
   * @returns {Promise<Object>} The loaded `node-forge` module.
   * @private
   */
  async #fetchNodeForge() {
    if (!this.forge) {
      const forge = await import(/* webpackMode: "eager" */ 'node-forge');
      this.forge = forge.default;
    }
    return this.#getNodeForge();
  }

  /**
   * Public wrapper for fetching the `node-forge` module.
   * Useful for on-demand loading in environments like browsers.
   *
   * @returns {Promise<Object>} The loaded `node-forge` module.
   */
  async fetchNodeForge() {
    return this.#fetchNodeForge();
  }

  /**
   * Returns the previously loaded `node-forge` instance.
   * Assumes the module has already been loaded.
   *
   * @returns {Object} The `node-forge` module.
   * @private
   */
  #getNodeForge() {
    return this.forge;
  }

  /**
   * Public wrapper for accessing the `node-forge` instance.
   *
   * @returns {Object} The `node-forge` module.
   */
  getNodeForge() {
    return this.#getNodeForge();
  }

  /**
   * Detects the type of a PEM-formatted string.
   *
   * Recognizes X.509 certificates and RSA keys (public/private).
   * Returns a string describing the type, such as `'certificate'`, `'public_key'`, `'private_key'`,
   * or `'unknown'` if the format is not recognized.
   *
   * @param {string} pemString - The PEM string to inspect.
   * @returns {'certificate' | 'public_key' | 'private_key' | 'unknown'} The detected PEM type.
   * @private
   */
  #detectPemType(pemString) {
    if (this.#certRegex.test(pemString)) return 'certificate';
    const keyMatch = this.#keyRegex.exec(pemString);
    if (keyMatch) return keyMatch[1].toLowerCase() + '_key'; // "public_key" or "private_key"
    return 'unknown';
  }

  /**
   * Generates a new X.509 certificate along with a public/private RSA key pair.
   *
   * This method can only be used in Node.js environments. It throws an error if a certificate
   * or key is already loaded into the instance.
   *
   * @param {Object} subjectFields - An object representing the subject fields of the certificate (e.g., CN, O, C).
   * @param {Object} [options={}] - Optional configuration for key and certificate generation.
   * @param {number} [options.modulusLength=2048] - Length of the RSA key in bits.
   * @param {Object} [options.publicKeyEncoding={ type: 'spki', format: 'pem' }] - Options for public key encoding.
   * @param {Object} [options.privateKeyEncoding={ type: 'pkcs8', format: 'pem' }] - Options for private key encoding.
   * @param {string} [options.publicKeyType] - Overrides `publicKeyEncoding.type` if provided.
   * @param {string} [options.privateKeyType] - Overrides `privateKeyEncoding.type` if provided.
   * @param {number} [options.validityInYears=1] - Number of years the certificate will be valid.
   * @param {number} [options.randomBytesLength=16] - Number of random bytes to use for serial number generation.
   *
   * @returns {Promise<{publicKey: string, privateKey: string, cert: string}>} The generated keys and certificate in PEM format.
   * @throws {Error} If running in a browser or if a cert/key is already loaded.
   */
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

  /**
   * Generates a self-signed X.509 certificate using the given public and private RSA keys.
   *
   * This method creates a certificate, assigns the subject and issuer fields,
   * sets the validity period, and signs it with the private key.
   *
   * @param {Object} subject - An object representing the subject/issuer fields (e.g., { CN: 'example.com' }).
   * @param {string} publicKey - The public key in PEM format.
   * @param {string} privateKey - The private key in PEM format.
   * @param {number} validityInYears - Number of years the certificate will remain valid.
   * @param {number} randomBytesLength - Number of random bytes used to generate the serial number.
   *
   * @returns {Object} An object containing:
   *   - {string} cert: The generated certificate in PEM format.
   *   - {Object} publicPem: The parsed public key object (from node-forge).
   *   - {Object} privatePem: The parsed private key object (from node-forge).
   */
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

  /**
   * Initializes the instance by loading the public certificate and, optionally, the private key.
   *
   * This method must be called before using cryptographic operations that depend on a loaded certificate.
   * It supports both Node.js and browser environments.
   *
   * In Node.js:
   * - It loads PEM data from provided file paths or buffers.
   *
   * In browsers:
   * - It loads PEM data from provided URLs or ArrayBuffers.
   *
   * @async
   * @throws {Error} If a certificate is already loaded.
   * @throws {Error} If no public certificate is provided.
   * @throws {Error} If the PEM type cannot be determined or is invalid.
   */
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

  /**
   * Parses and stores an X.509 certificate in the instance, extracting metadata such as
   * subject, issuer, serial number, and validity period.
   *
   * This method supports both PEM strings and already-parsed Forge certificate objects.
   * The parsed certificate is saved to `this.publicCert` and its metadata is extracted to `this.metadata`.
   *
   * @private
   * @param {string|object} certPem - A PEM-encoded certificate string or a `forge.pki.Certificate` object.
   * @throws {Error} If the certificate cannot be parsed or processed.
   */
  #loadX509Certificate(certPem) {
    try {
      const { pki } = this.forge;
      const cert = typeof certPem === 'string' ? pki.certificateFromPem(certPem) : certPem;
      this.publicCert = cert;

      const insertData = (attributes) => {
        const names = {};
        const shortNames = {};
        const raw = attributes.map((attr) => `${attr.shortName}=${attr.value}`).join(',');
        for (const item of attributes) {
          names[item.name] = item.value;
          shortNames[item.shortName] = item.value;
        }
        return { names, shortNames, raw };
      };

      this.metadata = {
        subject: insertData(cert.subject.attributes),
        issuer: insertData(cert.issuer.attributes),
        serialNumber: cert.serialNumber,
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
      };
    } catch (err) {
      throw new Error('Failed to parse X.509 certificate in browser: ' + err.message);
    }
  }

  /**
   * Extracts the metadata of the loaded X.509 certificate.
   *
   * Returns an object containing the certificate's metadata such as the subject, issuer,
   * serial number, and validity period. If no certificate is loaded, an empty object is returned.
   *
   * @returns {Object} The metadata of the certificate, or an empty object if no certificate is loaded.
   */
  extractCertMetadata() {
    return this.metadata || {};
  }

  /**
   * Encrypts a JSON object using the initialized public key.
   *
   * This method serializes the provided JSON object to a string and encrypts it using the
   * public key in PEM format. The encryption is done using the algorithm defined in the
   * `cryptoType` property (e.g., 'RSA-OAEP').
   *
   * @param {Object} jsonObject - The JSON object to be encrypted.
   * @returns {string} The encrypted JSON object, encoded in Base64 format.
   * @throws {Error} If the public key is not initialized (i.e., if `init()` or `generateKeyPair()` has not been called).
   */
  encryptJson(jsonObject) {
    if (!this.publicKey)
      throw new Error('Public key is not initialized. Call init() or generateKeyPair() first.');
    const jsonString = JSON.stringify(jsonObject);
    const encrypted = this.publicKey.encrypt(jsonString, this.cryptoType);
    return this.forge.util.encode64(encrypted);
  }

  /**
   * Decrypts a Base64-encoded encrypted JSON string using the initialized private key.
   *
   * This method takes the encrypted Base64 string, decodes it, and decrypts it using the
   * private key in PEM format. It then parses the decrypted string back into a JSON object.
   *
   * @param {string} encryptedBase64 - The encrypted JSON string in Base64 format to be decrypted.
   * @returns {Object} The decrypted JSON object.
   * @throws {Error} If the private key is not initialized.
   */
  decryptToJson(encryptedBase64) {
    if (!this.privateKey) throw new Error('Private key is required for decryption');
    const data = this.forge.util.decode64(encryptedBase64);
    const decrypted = this.privateKey.decrypt(data, this.cryptoType);
    return JSON.parse(decrypted);
  }

  /**
   * Checks if both the public and private keys are initialized.
   *
   * This method verifies if both the public key and private key have been initialized
   * in the instance. It returns `true` if both keys are present, otherwise `false`.
   *
   * @returns {boolean} `true` if both public and private keys are initialized, `false` otherwise.
   */
  hasKeys() {
    return this.publicKey !== null && this.privateKey !== null;
  }

  /**
   * Checks if a public certificate is initialized.
   *
   * This method checks if the public certificate has been loaded or initialized in the instance.
   * It returns `true` if the public certificate is available, otherwise `false`.
   *
   * @returns {boolean} `true` if the public certificate is initialized, `false` otherwise.
   */
  hasCert() {
    return this.publicCert !== null;
  }

  /**
   * Resets the instance by clearing the keys and certificate data.
   *
   * This method sets the public and private keys, the public certificate, metadata, and
   * the source to `null`, effectively resetting the instance to its initial state.
   */
  reset() {
    this.publicKey = null;
    this.privateKey = null;
    this.publicCert = null;
    this.metadata = null;
    this.source = null;
  }
}

export default TinyCertCrypto;
