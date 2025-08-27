// test-tinyi18.js
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import TinyI18 from '../../dist/v1/libs/TinyI18.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testI18() {
  const tmpDir = path.join(__dirname, './tmp-locales');
  const resultDir = path.join(tmpDir, './temp');

  // Reset test folder
  if (existsSync(resultDir)) {
    await rm(resultDir, { recursive: true, force: true });
  }
  await mkdir(resultDir);

  // Create sample locale JSON files
  const enFile = path.join(tmpDir, 'en.json');
  const ptFile = path.join(tmpDir, 'pt.json');
  const esFile = path.join(tmpDir, 'es.json');

  // --- Test TinyI18 with file mode ---
  const i18 = new TinyI18({
    mode: 'file',
    basePath: tmpDir,
    defaultLocale: 'en',
  });

  await i18.setLocale('en');
  console.log('EN title:', i18.t('app.title')); // Inventory
  console.log('EN greeting:', i18.t('greeting', { name: 'Alice' }));

  await i18.setLocale('pt');
  console.log('PT title:', i18.t('app.title')); // Inventário
  console.log('PT greeting:', i18.t('greeting', { name: 'Alice' }));

  // --- Test mergeLocaleFiles ---
  const mergedFile = path.join(resultDir, 'merged.json');

  await TinyI18.mergeLocaleFiles({
    files: [enFile, ptFile, esFile],
    output: mergedFile,
    spaces: 2,
  });

  console.log('✅ mergeLocaleFiles created', mergedFile);

  // Load from merged file
  const i18Merged = new TinyI18({
    mode: 'file',
    basePath: tmpDir,
    defaultLocale: 'en',
  });

  await i18Merged.setLocale('temp/merged');
  console.log('Merged ES title:', i18Merged.t('greeting', { name: 'Alice' }));
}

export default testI18;
