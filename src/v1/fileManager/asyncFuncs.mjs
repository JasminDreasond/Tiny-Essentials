import { existsSync } from 'fs';
import { readFile, writeFile, copyFile, unlink, readdir, lstat, rm, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { dirExists, ensureDirectory, fileExists, getLatestBackupPath } from './normalFuncs.mjs';

/*========================*
 * JSON Operations
 *========================*/

/**
 * Reads and parses a JSON file.
 * Throws an error if the file content is not valid JSON.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
export async function readJsonFileAsync(filePath) {
  if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Saves an object as JSON to a file.
 * Automatically creates the directory if it does not exist.
 * @param {string} filePath
 * @param {any} data
 * @param {number} [spaces=2]
 * @returns {Promise<void>}
 */
export function writeJsonFileAsync(filePath, data, spaces = 2) {
  const json = JSON.stringify(data, null, spaces);
  return writeFile(filePath, json, 'utf-8');
}

/*========================*
 * Directory Management
 *========================*/

/**
 * Clears all contents inside a directory but keeps the directory.
 * @param {string} dirPath
 */
export async function clearDirectoryAsync(dirPath) {
  if (!existsSync(dirPath)) return;
  const files = await readdir(dirPath);

  /** @type {Record<string, import('fs').Stats>} */
  const dataList = {};
  const promises = [];

  for (const file of files) {
    const fullPath = join(dirPath, file);
    const lsResult = lstat(fullPath);

    lsResult.then((statData) => {
      dataList[fullPath] = statData;
      return statData;
    });
    promises.push(lsResult);
  }

  await Promise.all(promises);
  const promises2 = [];
  for (const fullPath in dataList) {
    const statData = dataList[fullPath];
    if (statData.isDirectory()) {
      promises2.push(rm(fullPath, { recursive: true, force: true }));
    } else {
      promises2.push(unlink(fullPath));
    }
  }

  await Promise.all(promises2);
}

/*========================*
 * File Checks
 *========================*/

/**
 * Checks whether a directory is empty.
 * @param {string} dirPath
 * @returns {Promise<boolean>}
 */
export async function isDirEmptyAsync(dirPath) {
  const data = await readdir(dirPath);
  return data.length === 0;
}

/*========================*
 * File Operations
 *========================*/

/**
 * Copies a file to a destination.
 * @param {string} src
 * @param {string} dest
 * @param {number} [mode]
 * @returns {Promise<void>}
 */
export function ensureCopyFileAsync(src, dest, mode) {
  ensureDirectory(dirname(dest));
  return copyFile(src, dest, mode);
}

/**
 * Deletes a file (If the file exists).
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export async function tryDeleteFileAsync(filePath) {
  if (fileExists(filePath)) {
    await unlink(filePath);
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
 * @param {import('fs').WriteFileOptions} [ops='utf-8']
 * @returns {Promise<void>}
 */
export function writeTextFileAsync(filePath, content, ops = 'utf-8') {
  const dir = dirname(filePath);
  ensureDirectory(dir);
  return writeFile(filePath, content, ops);
}

/*========================*
 * Directory Listings
 *========================*/

/**
 * Lists all files and dirs in a directory (optionally recursive).
 * @param {string} dirPath
 * @param {boolean} [recursive=false]
 * @returns {Promise<{ files: string[]; dirs: string[] }>}
 */
export async function listFilesAsync(dirPath, recursive = false) {
  /** @type {{ files: string[]; dirs: string[] }} */
  const results = { files: [], dirs: [] };
  if (!dirExists(dirPath)) return results;

  const entries = await readdir(dirPath);
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const statData = await lstat(fullPath);
    if (statData.isDirectory()) {
      results.dirs.push(fullPath);
      if (recursive) {
        const results2 = await listFilesAsync(fullPath, true);
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
 * @returns {Promise<string[]>}
 */
export async function listDirsAsync(dirPath, recursive = false) {
  /** @type {string[]} */
  const results = [];
  if (!dirExists(dirPath)) return results;

  const entries = await readdir(dirPath);
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const statData = await lstat(fullPath);
    if (statData.isDirectory()) {
      results.push(fullPath);
      if (recursive) {
        results.push(...(await listDirsAsync(fullPath, true)));
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
 * @returns {Promise<number>}
 */
export async function fileSizeAsync(filePath) {
  if (!fileExists(filePath)) return 0;
  const stats = await stat(filePath);
  return stats.size;
}

/**
 * Returns the total size of a directory in bytes.
 * @param {string} dirPath
 * @returns {Promise<number>}
 */
export async function dirSizeAsync(dirPath) {
  let total = 0;
  const { files } = await listFilesAsync(dirPath, true);
  const promises = [];
  for (const file of files) {
    const result = fileSizeAsync(file);
    result.then((item) => {
      total += item;
      return item;
    });
    promises.push(result);
  }
  await Promise.all(promises);
  return total;
}

/*========================*
 * Backup Utilities
 *========================*/

/**
 * Restores the most recent backup of a file.
 * @param {string} filePath
 * @param {string} [ext='bak']
 * @returns {Promise<void>}
 */
export function restoreLatestBackupAsync(filePath, ext = 'bak') {
  const latestBackup = getLatestBackupPath(filePath, ext);
  return ensureCopyFileAsync(latestBackup, filePath);
}

/**
 * Creates a backup copy of a file with .bak timestamp suffix.
 * @param {string} filePath
 * @param {string} [ext='bak']
 * @returns {Promise<void>}
 */
export async function backupFileAsync(filePath, ext = 'bak') {
  if (!fileExists(filePath)) return;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.${ext}.${timestamp}`;
  return ensureCopyFileAsync(filePath, backupPath);
}
