import asyncReplace from '../legacy/libs/replaceAsync.mjs';
import TinyLevelUp from '../legacy/libs/userLevel.mjs';
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
} from './basics/objFilter.mjs';
import { formatBytes, getAge, getSimplePerc, ruleOfThree } from './basics/simpleMath.mjs';
import { addAiMarkerShortcut, toTitleCase, toTitleCaseLowerFirst } from './basics/text.mjs';
import ColorSafeStringify from './libs/ColorSafeStringify.mjs';
import TinyPromiseQueue from './libs/TinyPromiseQueue.mjs';

export {
  ColorSafeStringify,
  TinyPromiseQueue,
  TinyLevelUp,
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
