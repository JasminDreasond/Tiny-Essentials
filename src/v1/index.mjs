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
import { formatBytes, getAge, getSimplePerc, ruleOfThree } from './basics/simpleMath.mjs';
import { addAiMarkerShortcut, toTitleCase, toTitleCaseLowerFirst } from './basics/text.mjs';
import ColorSafeStringify from './libs/ColorSafeStringify.mjs';
import TinyPromiseQueue from './libs/TinyPromiseQueue.mjs';
import TinyRateLimiter from './libs/TinyRateLimiter.mjs';
import TinyNotifyCenter from './libs/TinyNotifyCenter.mjs';
import TinyToastNotify from './libs/TinyToastNotify.mjs';
import { areElementsColliding, readJsonBlob, saveJsonFile, fetchJson } from './basics/html.mjs';
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
} from './basics/fileManager.mjs';

export {
  TinyDragDropDetector,
  TinyToastNotify,
  TinyNotifyCenter,
  TinyRateLimiter,
  ColorSafeStringify,
  TinyPromiseQueue,
  TinyLevelUp,
  fetchJson,
  readJsonBlob,
  saveJsonFile,
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
  documentIsFullScreen,
  isScreenFilled,
  requestFullScreen,
  exitFullScreen,
  isFullScreenMode,
  onFullScreenChange,
  offFullScreenChange,
  areElementsColliding,
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
