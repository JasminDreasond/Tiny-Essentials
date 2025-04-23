import asyncReplace from '../../legacy/libs/replaceAsync.mjs';
import { shuffleArray } from './array.mjs';
import { formatCustomTimer, formatDayTimer, formatTimer, getTimeDuration } from './clock.mjs';
import {
  countObj,
  extendObjType,
  reorderObjTypeOrder,
  cloneObjTypeOrder,
  objType,
} from './objFilter.mjs';
import { getAge, getSimplePerc, ruleOfThree } from './simpleMath.mjs';
import { toTitleCase, toTitleCaseLowerFirst } from './text.mjs';

export {
  extendObjType,
  reorderObjTypeOrder,
  cloneObjTypeOrder,
  countObj,
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
