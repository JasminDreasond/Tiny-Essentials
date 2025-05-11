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
import { formatBytes, getAge, getSimplePerc, ruleOfThree } from './simpleMath.mjs';
import { addAiMarkerShortcut, toTitleCase, toTitleCaseLowerFirst } from './text.mjs';

export {
  formatBytes,
  addAiMarkerShortcut,
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
