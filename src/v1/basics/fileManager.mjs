import fs from 'fs';
import path from 'path';
import { toTitleCase } from './text.mjs';

/*========================*
 * JSON Operations
 *========================*/

/**
 * Reads and parses a JSON file.
 * Throws an error if the file content is not valid JSON.
 * @param {string} filePath
 * @returns {any}
 */
export function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Saves an object as JSON to a file.
 * Automatically creates the directory if it does not exist.
 * @param {string} filePath
 * @param {any} data
 * @param {number} [spaces=2]
 */
export function writeJsonFile(filePath, data, spaces = 2) {
  const json = JSON.stringify(data, null, spaces);
  fs.writeFileSync(filePath, json, 'utf-8');
}

/*========================*
 * Directory Management
 *========================*/

/**
 * Ensures that the directory exists, creating it recursively if needed.
 * @param {string} dirPath
 */
export function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Clears all contents inside a directory but keeps the directory.
 * @param {string} dirPath
 */
export function clearDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

/*========================*
 * File Checks
 *========================*/

/**
 * Checks whether a file exists.
 * @param {string} filePath
 * @returns {boolean}
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
}

/**
 * Checks whether a directory exists.
 * @param {string} dirPath
 * @returns {boolean}
 */
export function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
}

/**
 * Checks whether a directory is empty.
 * @param {string} dirPath
 * @returns {boolean}
 */
export function isDirEmpty(dirPath) {
  return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0;
}

/*========================*
 * File Operations
 *========================*/

/**
 * Copies a file to a destination.
 * @param {string} src
 * @param {string} dest
 * @param {number} [mode]
 */
export function ensureCopyFile(src, dest, mode) {
  ensureDirectory(path.dirname(dest));
  fs.copyFileSync(src, dest, mode);
}

/**
 * Deletes a file (If the file exists).
 * @param {string} filePath
 * @returns {boolean}
 */
export function tryDeleteFile(filePath) {
  if (fileExists(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

/*========================*
 * Text Operations
 *========================*/

/**
 * Writes text to a file (Ensures that the directory exists, creating it recursively if needed).
 * @param {string} filePath
 * @param {string} content
 * @param {fs.WriteFileOptions} [ops='utf-8']
 */
export function writeTextFile(filePath, content, ops = 'utf-8') {
  const dir = path.dirname(filePath);
  ensureDirectory(dir);
  fs.writeFileSync(filePath, content, ops);
}

/*========================*
 * Directory Listings
 *========================*/

/**
 * Lists all files and dirs in a directory (optionally recursive).
 * @param {string} dirPath
 * @param {boolean} [recursive=false]
 * @returns {{ files: string[]; dirs: string[] }}
 */
export function listFiles(dirPath, recursive = false) {
  /** @type {{ files: string[]; dirs: string[] }} */
  const results = { files: [], dirs: [] };
  if (!dirExists(dirPath)) return results;

  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      results.dirs.push(fullPath);
      if (recursive) {
        const results2 = listFiles(fullPath, true);
        results.files.push(...results2.files);
        results.dirs.push(...results2.dirs);
      }
    } else {
      results.files.push(fullPath);
    }
  }
  return results;
}

/**
 * Lists all directories in a directory (optionally recursive).
 * @param {string} dirPath
 * @param {boolean} [recursive=false]
 * @returns {string[]}
 */
export function listDirs(dirPath, recursive = false) {
  /** @type {string[]} */
  const results = [];
  if (!dirExists(dirPath)) return results;

  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.lstatSync(fullPath);
    if (stat.isDirectory()) {
      results.push(fullPath);
      if (recursive) {
        results.push(...listDirs(fullPath, true));
      }
    }
  }
  return results;
}

/*========================*
 * File Info
 *========================*/

/**
 * Returns the size of a file in bytes.
 * @param {string} filePath
 * @returns {number}
 */
export function fileSize(filePath) {
  if (!fileExists(filePath)) return 0;
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Returns the total size of a directory in bytes.
 * @param {string} dirPath
 * @returns {number}
 */
export function dirSize(dirPath) {
  let total = 0;
  const files = listFiles(dirPath, true).files;
  for (const file of files) {
    total += fileSize(file);
  }
  return total;
}

/*========================*
 * Backup Utilities
 *========================*/

/**
 * Creates a backup copy of a file with .bak timestamp suffix.
 * @param {string} filePath
 * @param {string} [ext='bak']
 */
export function backupFile(filePath, ext = 'bak') {
  if (!fileExists(filePath)) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.${ext}.${timestamp}`;
  ensureCopyFile(filePath, backupPath);
}

/**
 * Returns the most recent backup file path for a given file.
 * @param {string} filePath
 * @param {string} [ext='bak']
 * @returns {string} Full path to the most recent backup
 */
export function getLatestBackupPath(filePath, ext = 'bak') {
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath);
  const backups = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith(`${baseName}.${ext}.`))
    .sort()
    .reverse();

  if (backups.length === 0) throw new Error(`No backups found for ${filePath}`);

  return path.join(dir, backups[0]);
}

/**
 * Restores the most recent backup of a file.
 * @param {string} filePath
 * @param {string} [ext='bak']
 */
export function restoreLatestBackup(filePath, ext = 'bak') {
  const latestBackup = getLatestBackupPath(filePath, ext);
  ensureCopyFile(latestBackup, filePath);
}

/*========================*
 * Rename Utilities
 *========================*/

/**
 * Renames multiple files in a directory using a rename function.
 * @param {string} dirPath - The target directory.
 * @param {(original: string, index: number) => string} renameFn - Function that returns new filename.
 * @param {string[]} [extensions] - Optional: Only rename files with these extensions.
 *
 * @throws {TypeError} If any argument has an invalid type.
 * @throws {Error} If the directory does not exist or contains invalid files.
 */
export function renameFileBatch(dirPath, renameFn, extensions = []) {
  // Validate types
  if (typeof dirPath !== 'string') throw new TypeError('dirPath must be a string');
  if (typeof renameFn !== 'function') throw new TypeError('renameFn must be a function');
  if (!Array.isArray(extensions)) throw new TypeError('extensions must be an array of strings');
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory())
    throw new Error(`Directory not found or invalid: ${dirPath}`);
  for (const ext of extensions) {
    if (typeof ext !== 'string' || !ext.startsWith('.'))
      throw new TypeError(`Invalid extension: ${ext}`);
  }

  const files = listFiles(dirPath).files;
  let index = 0;

  for (const file of files) {
    const ext = path.extname(file);
    if (extensions.length && !extensions.includes(ext)) continue;

    const originalName = path.basename(file);
    const newName = renameFn(originalName, index++);
    const newPath = path.join(dirPath, newName);

    if (originalName === newName) continue;

    fs.renameSync(file, newPath);
  }
}

/**
 * Renames files using regex replacement.
 * @param {string} dirPath
 * @param {RegExp} pattern - Regex to match in the filename.
 * @param {string} replacement - Replacement string.
 * @param {string[]} [extensions]
 */
export function renameFileRegex(dirPath, pattern, replacement, extensions = []) {
  renameFileBatch(
    dirPath,
    (filename) => {
      const ext = path.extname(filename);
      const name = path.basename(filename, ext).replace(pattern, replacement);
      return `${name}${ext}`;
    },
    extensions,
  );
}

/**
 * Adds a prefix or suffix to filenames.
 * @param {string} dirPath
 * @param {{ prefix?: string, suffix?: string }} options
 * @param {string[]} [extensions]
 */
export function renameFileAddPrefixSuffix(dirPath, { prefix = '', suffix = '' }, extensions = []) {
  renameFileBatch(
    dirPath,
    (filename) => {
      const ext = path.extname(filename);
      const name = path.basename(filename, ext);
      return `${prefix}${name}${suffix}${ext}`;
    },
    extensions,
  );
}

/**
 * Normalizes all filenames to lowercase (or uppercase).
 * @param {string} dirPath
 * @param {'lower' | 'upper' | 'title'} mode
 * @param {string[]} [extensions]
 * @param {boolean} [normalizeExt=false] - Whether to apply case change to file extensions too.
 * @throws {Error} If mode is invalid.
 */
export function renameFileNormalizeCase(
  dirPath,
  mode = 'lower',
  extensions = [],
  normalizeExt = false,
) {
  if (typeof mode !== 'string' || !['lower', 'upper', 'title'].includes(mode))
    throw new Error(`Invalid mode "${mode}". Must be 'lower', 'upper' or 'title'.`);
  renameFileBatch(
    dirPath,
    (filename) => {
      /**
       * @param {string} text
       * @returns {string}
       */
      const changeToMode = (text) => {
        if (mode === 'lower') return text.toLowerCase();
        else if (mode === 'upper') return text.toUpperCase();
        else if (mode === 'title') return toTitleCase(text);
        else return text;
      };

      const rawExt = path.extname(filename);
      const ext = normalizeExt ? changeToMode(rawExt) : rawExt;
      const name = changeToMode(path.basename(filename, rawExt));
      return `${name}${ext}`;
    },
    extensions,
  );
}

/**
 * Pads numbers in filenames (e.g., "img1.jpg" -> "img001.jpg").
 * @param {string} dirPath
 * @param {number} totalDigits
 * @param {string[]} [extensions]
 */
export function renameFilePadNumbers(dirPath, totalDigits = 3, extensions = []) {
  renameFileBatch(
    dirPath,
    (filename) => {
      return filename.replace(/\d+/, (match) => match.padStart(totalDigits, '0'));
    },
    extensions,
  );
}
