import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TinyCertCrypto } from '../../dist/v1/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicKeyPath = path.join(__dirname, 'temp/public.pem');
const privateKeyPath = path.join(__dirname, 'temp/private.pem');
const certPath = path.join(__dirname, 'temp/cert.pem');

async function ensureDirectoryExistence(filePath) {
  const dir = path.dirname(filePath);
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}

async function saveCertFiles(publicKey, privateKey, cert) {
  await ensureDirectoryExistence(publicKeyPath);
  await fs.promises.writeFile(publicKeyPath, publicKey);
  await fs.promises.writeFile(privateKeyPath, privateKey);
  await fs.promises.writeFile(certPath, cert);
}

function printSeparator(title, colorCode = '\x1b[36m') {
  const line = '─'.repeat(60);
  console.log(`\n${colorCode}%s\x1b[0m`, `\n${line}\n${title}\n${line}\n`);
}

const testWithInstance = async (cryptoInstance, title = 'Instance') => {
  printSeparator(`🔬 TESTING: ${title}`, '\x1b[35m');

  const testData = {
    name: 'Yasmin',
    isBrony: true,
    favoritePony: 'Fluttershy',
  };

  const encrypted = await cryptoInstance.encryptJson(testData);
  console.log('📦 Encrypted Base64:', encrypted);

  const decrypted = await cryptoInstance.decryptToJson(encrypted);
  console.log('✅ Decrypted JSON:', decrypted);

  console.log('🔍 Extracting certificate metadata...');
  const metadata = cryptoInstance.extractCertMetadata();
  console.log('📋 Certificate Metadata:', metadata);
};

const main = async () => {
  console.log('🔐✨ Starting TinyCertCrypto Tests');

  let cryptoInstance;

  printSeparator('📜 IN-MEMORY CERTIFICATE TESTS', '\x1b[36m');
  cryptoInstance = new TinyCertCrypto();
  const { publicKey, privateKey, cert } = await cryptoInstance.generateX509Cert({
    countryName: 'BR',
    organizationName: 'JasminOrg',
    commonName: 'localhost',
    emailAddress: 'tiny@puddy.club',
  });

  console.log('💾 Saving generated certs to disk...');
  await saveCertFiles(publicKey, privateKey, cert);

  await testWithInstance(cryptoInstance, 'In-Memory Instance');

  printSeparator('📂 FILE-BASED CERTIFICATE TESTS', '\x1b[33m');
  cryptoInstance = new TinyCertCrypto({
    publicCertPath: certPath,
    privateKeyPath: privateKeyPath,
  });

  console.log('📂 Initializing instance with keys from file...');
  await cryptoInstance.init();

  await testWithInstance(cryptoInstance, 'File-Based Instance');

  printSeparator('🎉 ALL TESTS COMPLETED SUCCESSFULLY', '\x1b[32m');
};

main().catch((err) => {
  console.error('❌ Test failed:', err);
});
