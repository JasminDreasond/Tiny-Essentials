import asyncReplace from '../legacy/libs/replaceAsync.mjs';
import TinyLevelUp from '../legacy/libs/userLevel.mjs';
import arraySortPositions from '../legacy/libs/arraySortPositions.mjs';
import { shuffleArray } from './basics/array.mjs';
import {
  formatCustomTimer,
  formatDayTimer,
  formatTimer,
  getTimeDuration,
} from './basics/clock.mjs';
import {
  countObj,
  extendObjType,
  reorderObjTypeOrder,
  cloneObjTypeOrder,
  objType,
  checkObj,
  isJsonObject,
} from './basics/objFilter.mjs';
import {
  documentIsFullScreen,
  isScreenFilled,
  requestFullScreen,
  exitFullScreen,
  isFullScreenMode,
  onFullScreenChange,
  offFullScreenChange,
} from './basics/fullScreen.mjs';
import {
  formatBytes,
  genFibonacciSeq,
  getAge,
  getSimplePerc,
  ruleOfThree,
} from './basics/simpleMath.mjs';
import { addAiMarkerShortcut, toTitleCase, toTitleCaseLowerFirst } from './basics/text.mjs';
import ColorSafeStringify from './libs/ColorSafeStringify.mjs';
import TinyPromiseQueue from './libs/TinyPromiseQueue.mjs';
import TinyRateLimiter from './libs/TinyRateLimiter.mjs';
import TinyNotifyCenter from './libs/TinyNotifyCenter.mjs';
import TinyToastNotify from './libs/TinyToastNotify.mjs';
import {
  areHtmlElsColliding,
  readJsonBlob,
  saveJsonFile,
  fetchJson,
  getHtmlElBorders,
  getHtmlElBordersWidth,
  getHtmlElMargin,
  getHtmlElPadding,
  installWindowHiddenScript,
} from './basics/html.mjs';
import TinyDragDropDetector from './libs/TinyDragDropDetector.mjs';

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
  renameFileBatch,
  renameFileRegex,
  renameFileAddPrefixSuffix,
  renameFileNormalizeCase,
  renameFilePadNumbers,
  getLatestBackupPath,
} from './fileManager/normalFuncs.mjs';

import {
  listFilesAsync,
  listDirsAsync,
  clearDirectoryAsync,
  isDirEmptyAsync,
  fileSizeAsync,
  dirSizeAsync,
} from './fileManager/asyncFuncs.mjs';

import TinyDragger from './libs/TinyDragger.mjs';
import TinyDomReadyManager from './libs/TinyDomReadyManager.mjs';

export {
  TinyDomReadyManager,
  TinyDragger,
  TinyDragDropDetector,
  TinyToastNotify,
  TinyNotifyCenter,
  TinyRateLimiter,
  ColorSafeStringify,
  TinyPromiseQueue,
  TinyLevelUp,
  installWindowHiddenScript,
  genFibonacciSeq,
  isDirEmptyAsync,
  fileSizeAsync,
  dirSizeAsync,
  listFilesAsync,
  listDirsAsync,
  getHtmlElBorders,
  getHtmlElBordersWidth,
  getHtmlElMargin,
  getHtmlElPadding,
  getLatestBackupPath,
  fetchJson,
  readJsonBlob,
  saveJsonFile,
  readJsonFile,
  writeJsonFile,
  ensureDirectory,
  clearDirectoryAsync,
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
  renameFileBatch,
  renameFileRegex,
  renameFileAddPrefixSuffix,
  renameFileNormalizeCase,
  renameFilePadNumbers,
  documentIsFullScreen,
  isScreenFilled,
  requestFullScreen,
  exitFullScreen,
  isFullScreenMode,
  onFullScreenChange,
  offFullScreenChange,
  areHtmlElsColliding,
  isJsonObject,
  arraySortPositions,
  formatBytes,
  addAiMarkerShortcut,
  extendObjType,
  reorderObjTypeOrder,
  cloneObjTypeOrder,
  countObj,
  checkObj,
  objType,
  ruleOfThree,
  getSimplePerc,
  asyncReplace,
  getAge,
  formatCustomTimer,
  formatDayTimer,
  formatTimer,
  getTimeDuration,
  shuffleArray,
  toTitleCase,
  toTitleCaseLowerFirst,
};
