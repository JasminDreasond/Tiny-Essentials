import path from 'path';
import { fileURLToPath } from 'url';

import {
  ColorSafeStringify,
  readJsonFile,
  writeJsonFile,
  ensureDirectory,
  fileExists,
  dirExists,
  isDirEmpty,
  ensureCopyFile,
  tryDeleteFile,
  writeTextFile,
  listFiles,
  listDirs,
  fileSize,
  dirSize,
  backupFile,
  restoreLatestBackup,
  renameFileRegex,
  renameFileAddPrefixSuffix,
  renameFileNormalizeCase,
  renameFilePadNumbers,
  getLatestBackupPath,
  clearDirectoryAsync,
} from '../../dist/v1/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colorizer = new ColorSafeStringify();
const stringifyJson = (json, space = 3) => colorizer.colorize(JSON.stringify(json, null, space));

// ANSI Colors
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const RED = '\x1b[91m';

const section = (title) => {
  console.log(`\n${YELLOW}${'='.repeat(50)}\n📂 ${title}\n${'='.repeat(50)}${RESET}\n`);
};

const testFolderManager = async () => {
  const testRoot = path.join(__dirname, './temp');
  const testJsonPath = path.join(testRoot, 'data.json');
  const testTextPath = path.join(testRoot, 'notes.txt');

  const normalizeFolder = path.join(testRoot, 'normalize');
  const paddingFolder = path.join(testRoot, 'padding');
  const regexFolder = path.join(testRoot, 'regex');
  const suffixFolder = path.join(testRoot, 'suffix');

  // === Setup
  section('Preparing Test Environment');
  if (dirExists(testRoot)) {
    console.log(`${BLUE}🧹 Cleaning test root directory:${RESET}\n  → ${CYAN}${testRoot}${RESET}`);
    await clearDirectoryAsync(testRoot);
    await new Promise((resolve) => setTimeout(() => resolve(), 1000));
  } else
    console.log(`${BLUE}🔧 Creating test root directory:${RESET}\n  → ${CYAN}${testRoot}${RESET}`);

  ensureDirectory(testRoot);
  ensureDirectory(normalizeFolder);
  ensureDirectory(paddingFolder);
  ensureDirectory(regexFolder);
  ensureDirectory(suffixFolder);

  // === JSON Test
  section('JSON File Test');
  const jsonData = { user: 'Yasmin', dev: true };
  console.log(`${BLUE}📥 Writing JSON file...${RESET}`);
  writeJsonFile(testJsonPath, jsonData);

  console.log(`${BLUE}📤 Reading JSON file...${RESET}`);
  const jsonRead = readJsonFile(testJsonPath);
  console.log(`${GREEN}✅ JSON content:${RESET}\n`, stringifyJson(jsonRead));

  // === Text File Test
  section('Text File Test');
  console.log(`${BLUE}🖊️ Writing plain text...${RESET}`);
  writeTextFile(testTextPath, 'Hello world!\nThis is a tiny test.');

  console.log(`${CYAN}📏 File exists?       ${RESET}${fileExists(testTextPath)}`);
  console.log(`${CYAN}📁 Directory exists?  ${RESET}${dirExists(testRoot)}`);
  console.log(`${CYAN}📭 Directory is empty?${RESET}${isDirEmpty(testRoot)}`);

  // === Copy & Backup
  section('Copying and Backing Up');
  const copyPath = path.join(testRoot, 'notes_copy.txt');
  console.log(`${BLUE}📂 Copying text file...${RESET}`);
  ensureCopyFile(testTextPath, copyPath);

  const imgFiles = ['img1.png', 'img2.png', 'IMG3.PNG'];
  const copyImgPath = path.join(__dirname, '../img/6d01c26e-e523-4439-8bfc-f656a83cdab0.png');
  const copyImgPath2 = path.join(__dirname, '../img/1012b1ff-536b-4134-8bfb-01ba7b87a186.png');

  console.log(`${BLUE}🧪 Creating dummy images for rename tests...${RESET}`);
  imgFiles.forEach((name) => {
    ensureCopyFile(copyImgPath, path.join(testRoot, name));
    ensureCopyFile(copyImgPath2, path.join(normalizeFolder, name));
    ensureCopyFile(copyImgPath2, path.join(paddingFolder, name));
    ensureCopyFile(copyImgPath2, path.join(regexFolder, name));
    ensureCopyFile(copyImgPath2, path.join(suffixFolder, name));
  });

  console.log(`\n${MAGENTA}💾 Backing up original text file...${RESET}`);
  backupFile(testTextPath);
  await new Promise((resolve) => setTimeout(() => resolve(), 1000));
  backupFile(testTextPath);
  await new Promise((resolve) => setTimeout(() => resolve(), 1000));
  backupFile(testTextPath);

  console.log(`${RED}🧼 Deleting original...${RESET}`);
  tryDeleteFile(testTextPath);

  console.log(`${GREEN}♻️ Restoring from backup...${RESET}`);
  await new Promise((resolve) => setTimeout(() => resolve(), 1000));
  console.log(`${GREEN}♻️ ${getLatestBackupPath(testTextPath)}...${RESET}`);
  restoreLatestBackup(testTextPath);

  // === Listing
  section('Directory & File Info');
  const listed = listFiles(testRoot, true);
  console.log(`${BLUE}🧾 Files:${RESET}`, stringifyJson(listed.files));
  console.log(`${BLUE}📁 Folders:${RESET}`, stringifyJson(listed.dirs));

  const listedDirs = listDirs(testRoot, true);
  console.log(`${BLUE}📁 Directories only:${RESET}`, stringifyJson(listedDirs));

  console.log(`${CYAN}📏 File size:      ${RESET}${fileSize(testTextPath)} bytes`);
  console.log(`${CYAN}📦 Directory size: ${RESET}${dirSize(testRoot)} bytes`);

  // === Rename Operations
  section('Rename Operations');

  console.log(`${MAGENTA}🔡 Normalizing filename case...${RESET}`);
  renameFileNormalizeCase(normalizeFolder, 'lower', ['.png', '.PNG']);

  console.log(`${MAGENTA}🔢 Padding numbers...${RESET}`);
  renameFilePadNumbers(paddingFolder, 3, ['.png']);

  console.log(`${MAGENTA}🔄 Applying regex replace: "img" → "photo"...${RESET}`);
  renameFileRegex(regexFolder, /^img/, 'photo', ['.png']);

  console.log(`${MAGENTA}➕ Adding suffix "_edited"...${RESET}`);
  renameFileAddPrefixSuffix(suffixFolder, { suffix: '_edited' }, ['.png']);

  // === Done
  section('All Tests Completed');
  console.log(`${GREEN}🎉 Everything executed successfully!${RESET}\n`);
};

export default testFolderManager;
