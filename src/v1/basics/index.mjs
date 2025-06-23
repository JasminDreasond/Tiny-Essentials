import arraySortPositions from '../../legacy/libs/arraySortPositions.mjs';
import asyncReplace from '../../legacy/libs/replaceAsync.mjs';
import { shuffleArray } from './array.mjs';
import { formatCustomTimer, formatDayTimer, formatTimer, getTimeDuration } from './clock.mjs';
import { areElementsColliding } from './html.mjs';
import {
  countObj,
  extendObjType,
  reorderObjTypeOrder,
  cloneObjTypeOrder,
  objType,
  isJsonObject,
} from './objFilter.mjs';
import {
  documentIsFullScreen,
  isScreenFilled,
  requestFullScreen,
  exitFullScreen,
  isFullScreenMode,
  onFullScreenChange,
  offFullScreenChange,
} from './fullScreen.mjs';
import { formatBytes, getAge, getSimplePerc, ruleOfThree } from './simpleMath.mjs';
import { addAiMarkerShortcut, toTitleCase, toTitleCaseLowerFirst } from './text.mjs';

export {
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
