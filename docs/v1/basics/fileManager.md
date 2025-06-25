# 📁 Node.js File & Directory Utilities

A powerful and flexible utility toolkit for managing files and directories in Node.js using `fs` and `path`. Includes support for JSON operations, text handling, backups, renaming strategies, and more!

---

## 📦 JSON Operations

### `readJsonFile(filePath: string): any`

📖 Reads and parses a JSON file.

* Throws an error if the file doesn't exist or contains invalid JSON.

### `writeJsonFile(filePath: string, data: any, spaces: number = 2): void`

💾 Saves a JavaScript object as a formatted JSON file.

* Automatically creates the directory if it doesn't exist.

---

## 📂 Directory Management

### `ensureDirectory(dirPath: string): void`

🛠️ Ensures a directory exists. Creates it recursively if needed.

### `clearDirectory(dirPath: string): void`

🧹 Deletes all contents inside a directory while keeping the directory itself.

---

## 🧪 File Checks

### `fileExists(filePath: string): boolean`

🔎 Checks if a file exists.

### `dirExists(dirPath: string): boolean`

🏢 Checks if a directory exists.

### `isDirEmpty(dirPath: string): boolean`

📭 Checks if a directory is empty.

---

## 📄 File Operations

### `ensureCopyFile(src: string, dest: string): void`

📋 Copies a file from `src` to `dest`, ensuring the destination directory exists.

### `tryDeleteFile(filePath: string): boolean`

🗑️ Tries to delete a file if it exists. Returns `true` if deleted.

---

## 📝 Text Operations

### `writeTextFile(filePath: string, content: string, ops?: fs.WriteFileOptions): void`

✍️ Writes text content to a file. Ensures the directory exists before writing.

---

## 🧾 Directory Listings

### `listFiles(dirPath: string, recursive?: boolean): string[]`

📃 Lists all files and folders in a directory. Can be recursive.

### `listDirs(dirPath: string, recursive?: boolean): string[]`

📁 Lists all directories in a directory. Can be recursive.

---

## 📏 File Info

### `fileSize(filePath: string): number`

⚖️ Gets the size of a single file in bytes.

### `dirSize(dirPath: string): number`

📦 Gets the total size of all files inside a directory (recursive).

---

## 💾 Backup Utilities

### `backupFile(filePath: string, ext: string = 'bak'): void`

🛟 Creates a timestamped `.bak` copy of the file.

### `restoreLatestBackup(filePath: string, ext: string = 'bak'): void`

♻️ Restores the most recent backup for the file.

---

## 🔄 Rename Utilities

### `renameFileBatch(dirPath, renameFn, extensions?)`

🧠 Renames all files using a custom renaming function.

* Only affects files with the specified extensions (if any).

### `renameFileRegex(dirPath, pattern, replacement, extensions?)`

🔡 Renames files using a regex pattern and replacement string.

### `renameFileAddPrefixSuffix(dirPath, { prefix, suffix }, extensions?)`

🔠 Adds a prefix and/or suffix to each filename.

### `renameFileNormalizeCase(dirPath, mode, extensions?)`

🆎 Converts filenames to lowercase or uppercase.

* `mode`: `'lower'` or `'upper'`.

### `renameFilePadNumbers(dirPath, totalDigits, extensions?)`

🔢 Pads the first numeric sequence in a filename with leading zeros.

---

## 🔡 `renameFileNormalizeCase(dirPath, mode = 'lower', extensions = [])`

Normalizes all filenames in a directory to lowercase or uppercase.

### 📥 Parameters:

* `dirPath` *(string)*: Path to the target directory.
* `mode` *(`'lower' | 'upper'`)*: Case conversion mode.

  * `'lower'`: Converts filenames to lowercase.
  * `'upper'`: Converts filenames to uppercase.
* `extensions` *(string\[])* *(optional)*: List of file extensions to filter. If provided, only files with these extensions will be renamed.

### 🎯 Example:

```js
renameFileNormalizeCase('./images', 'lower', ['.jpg', '.png']);
```

🔁 **Effect**:
`Photo01.JPG` → `photo01.jpg`
`Logo.PNG` → `logo.png`

---

## 🔢 `renameFilePadNumbers(dirPath, totalDigits = 3, extensions = [])`

Pads the first numeric sequence found in each filename to a specified number of digits.

### 📥 Parameters:

* `dirPath` *(string)*: Path to the target directory.
* `totalDigits` *(number)*: Minimum number of digits. Numbers will be padded with leading zeros.
* `extensions` *(string\[])* *(optional)*: Only rename files with matching extensions.

### 🎯 Example:

```js
renameFilePadNumbers('./screenshots', 4, ['.jpg']);
```

🔁 **Effect**:
`screenshot1.jpg` → `screenshot0001.jpg`
`photo23.jpg` → `photo0023.jpg`

### 🧠 Notes:

* Only the **first** number in the filename is affected.
* If a filename has no digits, it will not be changed.

---

## 📦 More Example Use

```js
import { readJsonFile, writeJsonFile, listFiles, backupFile } from './utils/files.js';

const data = readJsonFile('./config/settings.json');
data.debug = false;
writeJsonFile('./config/settings.json', data);

const files = listFiles('./src/assets', true);
console.log('Found files:', files);

backupFile('./config/settings.json');
```
