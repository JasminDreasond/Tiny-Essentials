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
import { getAge, getSimplePerc, ruleOfThree } from './basics/simpleMath.mjs';
import { toTitleCase, toTitleCaseLowerFirst } from './basics/text.mjs';
import TinyPromiseQueue from './libs/TinyPromiseQueue.mjs';

export {
  TinyPromiseQueue,
  TinyLevelUp,
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
