import path from 'path';
import { fileURLToPath } from 'url';

import {
  readJsonFile,
  writeJsonFile,
  ensureDirectory,
  clearDirectory,
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
} from '../../dist/v1/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFolderManager = () => {
  // Setup test dir
  const testRoot = path.join(__dirname, './temp');
  const testJsonPath = path.join(testRoot, 'data.json');
  const testTextPath = path.join(testRoot, 'notes.txt');

  const normalizeFolder = path.join(testRoot, 'normalize');
  const paddingFolder = path.join(testRoot, 'padding');
  const regexFolder = path.join(testRoot, 'regex');
  const suffixFolder = path.join(testRoot, 'suffix');

  console.log(`\n🔧 Ensuring test directory: ${testRoot}`);
  clearDirectory(testRoot);
  ensureDirectory(testRoot);
  ensureDirectory(normalizeFolder);
  ensureDirectory(paddingFolder);
  ensureDirectory(regexFolder);
  ensureDirectory(suffixFolder);

  // 📝 JSON Write/Read
  const jsonData = { user: 'Yasmin', dev: true };
  console.log('📥 Writing JSON...');
  writeJsonFile(testJsonPath, jsonData);

  console.log('📤 Reading JSON...');
  const jsonRead = readJsonFile(testJsonPath);
  console.log('✅ JSON content:', jsonRead);

  // 📄 Text File
  console.log('🖊️ Writing text file...');
  writeTextFile(testTextPath, 'Hello world!\nThis is a test.');

  console.log('📏 File exists:', fileExists(testTextPath));
  console.log('📁 Directory exists:', dirExists(testRoot));
  console.log('📭 Is directory empty:', isDirEmpty(testRoot));

  // 🔂 File Copy + Backup
  const copyPath = path.join(testRoot, 'notes_copy.txt');
  console.log('📂 Copying text file...');
  console.log(testTextPath);
  ensureCopyFile(testTextPath, copyPath);

  // 🧪 Create files to rename
  console.log('🧪 Creating image files for rename...');
  const copyImgPath = path.join(__dirname, '../img/6d01c26e-e523-4439-8bfc-f656a83cdab0.png');
  const copyImgPath2 = path.join(__dirname, '../img/1012b1ff-536b-4134-8bfb-01ba7b87a186.png');
  console.log(copyImgPath);
  console.log(copyImgPath2);

  const imgFiles = ['img1.png', 'img2.png', 'IMG3.PNG'];
  imgFiles.forEach((name) => {
    ensureCopyFile(copyImgPath, path.join(testRoot, name));
    ensureCopyFile(copyImgPath, path.join(normalizeFolder, name));
    ensureCopyFile(copyImgPath, path.join(paddingFolder, name));
    ensureCopyFile(copyImgPath, path.join(regexFolder, name));
    ensureCopyFile(copyImgPath, path.join(suffixFolder, name));
  });

  console.log('💾 Creating backup...');
  backupFile(testTextPath);

  console.log('🧼 Deleting original...');
  tryDeleteFile(testTextPath);

  console.log('♻️ Restoring from backup...');
  restoreLatestBackup(testTextPath);

  // 🗃️ Directory Listing
  console.log('📜 Listing files...');
  const listed = listFiles(testRoot, true);
  console.log('🧾 Files:', listed.files);
  console.log('📁 Folders:', listed.dirs);

  console.log('📜 Listing dirs only...');
  const listedDirs = listDirs(testRoot, true);
  console.log('📁 Dirs:', listedDirs);

  console.log('📏 File size:', fileSize(testTextPath), 'bytes');
  console.log('📦 Directory size:', dirSize(testRoot), 'bytes');

  // 🔠 Rename Case
  console.log('🔡 Normalizing case...');
  renameFileNormalizeCase(normalizeFolder, 'lower', ['.png', '.PNG']);

  // 🔢 Pad Numbers
  console.log('🧮 Padding numbers...');
  renameFilePadNumbers(paddingFolder, 3, ['.png']);

  // 🔄 Regex Replace
  console.log('🧬 Replacing "img" with "photo"...');
  renameFileRegex(regexFolder, /^img/, 'photo', ['.png']);

  // ➕ Prefix/Suffix
  console.log('🔧 Adding suffix "_edited"...');
  renameFileAddPrefixSuffix(suffixFolder, { suffix: '_edited' }, ['.png']);

  // ✅ Done
  console.log('\n🎉 Test completed successfully.');
};

export default testFolderManager;
