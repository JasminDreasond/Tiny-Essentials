import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TinyCertCrypto } from '../../dist/v1/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDirectoryExistence(filePath) {
  const dir = path.dirname(filePath);
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}

const publicKeyPath = path.join(__dirname, 'temp/public.pem');
const privateKeyPath = path.join(__dirname, 'temp/private.pem');
const certPath = path.join(__dirname, 'temp/cert.pem');
const main = async () => {
  console.log('🔐✨ Starting TinyCertCrypto Tests');

  const cryptoInstance = new TinyCertCrypto();

  console.log('📜 Generating X.509 certificate...');
  const { publicKey, privateKey, cert } = await cryptoInstance.generateX509Cert({
    countryName: 'BR',
    organizationName: 'JasminOrg',
    commonName: 'localhost',
    emailAddress: 'tiny@puddy.club',
  });

  console.log('💾 Saving keys and certificate to disk...');
  await ensureDirectoryExistence(publicKeyPath);
  await ensureDirectoryExistence(privateKeyPath);
  await ensureDirectoryExistence(certPath);

  fs.writeFileSync(publicKeyPath, publicKey);
  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(certPath, cert);

  const cryptoFromFiles = new TinyCertCrypto({
    publicCertPath: certPath,
    privateKeyPath: privateKeyPath,
  });

  console.log('📂 Initializing instance with keys from file...');
  await cryptoFromFiles.init();

  console.log('🔍 Extracting certificate metadata...');
  const metadata = cryptoFromFiles.extractCertMetadata();
  console.log('📋 Certificate Metadata:', metadata);

  const testData = {
    name: 'Yasmin',
    isBrony: true,
    favoritePony: 'Fluttershy',
  };

  console.log('🔒 Encrypting test JSON...');
  const encrypted = await cryptoFromFiles.encryptJson(testData);
  console.log('📦 Encrypted Base64:', encrypted);

  console.log('🔓 Decrypting back to JSON...');
  const decrypted = await cryptoFromFiles.decryptToJson(encrypted);
  console.log('✅ Decrypted JSON:', decrypted);

  console.log('🎉 All tests completed successfully!');
};

main().catch((err) => {
  console.error('❌ Test failed:', err);
});
