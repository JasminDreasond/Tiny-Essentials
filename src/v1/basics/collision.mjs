// Normal numbers

/**
 * Checks if rect1 is completely above rect2 (no vertical collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is above rect2 without overlapping.
 */
export const areElsCollTop = (rect1, rect2) => rect1.bottom < rect2.top;

/**
 * Checks if rect1 is completely below rect2 (no vertical collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is below rect2 without overlapping.
 */
export const areElsCollBottom = (rect1, rect2) => rect1.top > rect2.bottom;

/**
 * Checks if rect1 is completely to the left of rect2 (no horizontal collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is left of rect2 without overlapping.
 */
export const areElsCollLeft = (rect1, rect2) => rect1.right < rect2.left;

/**
 * Checks if rect1 is completely to the right of rect2 (no horizontal collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is right of rect2 without overlapping.
 */
export const areElsCollRight = (rect1, rect2) => rect1.left > rect2.right;

// Perfect numbers

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is above rect2 without overlapping.
 */
export const areElsCollPerfTop = (rect1, rect2) => rect1.bottom <= rect2.top;

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is below rect2 without overlapping.
 */
export const areElsCollPerfBottom = (rect1, rect2) => rect1.top >= rect2.bottom;

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is left of rect2 without overlapping.
 */
export const areElsCollPerfLeft = (rect1, rect2) => rect1.right <= rect2.left;

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is right of rect2 without overlapping.
 */
export const areElsCollPerfRight = (rect1, rect2) => rect1.left >= rect2.right;

// Main Collision

/**
 * Checks if two elements (via their bounding rectangles) are overlapping or touching.
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if the elements are colliding or intersecting; false if fully separated.
 */
export const areElsColliding = (rect1, rect2) =>
  !(
    areElsCollLeft(rect1, rect2) ||
    areElsCollRight(rect1, rect2) ||
    areElsCollTop(rect1, rect2) ||
    areElsCollBottom(rect1, rect2)
  );

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if the elements are colliding or intersecting; false if fully separated.
 */
export const areElsPerfColliding = (rect1, rect2) =>
  !(
    areElsCollPerfLeft(rect1, rect2) ||
    areElsCollPerfRight(rect1, rect2) ||
    areElsCollPerfTop(rect1, rect2) ||
    areElsCollPerfBottom(rect1, rect2)
  );

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {string|null}
 */
export const getElsColliding = (rect1, rect2) => {
  if (areElsCollLeft(rect1, rect2)) return 'left';
  else if (areElsCollRight(rect1, rect2)) return 'right';
  else if (areElsCollTop(rect1, rect2)) return 'top';
  else if (areElsCollBottom(rect1, rect2)) return 'bottom';
  return null;
};

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {string|null}
 */
export const getElsPerfColliding = (rect1, rect2) => {
  if (areElsCollPerfLeft(rect1, rect2)) return 'left';
  else if (areElsCollPerfRight(rect1, rect2)) return 'right';
  else if (areElsCollPerfTop(rect1, rect2)) return 'top';
  else if (areElsCollPerfBottom(rect1, rect2)) return 'bottom';
  return null;
};

// Overlap

/**
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {}
 */
export const getElsCollOverlap = (rect1, rect2) => ({
  overlapLeft: rect2.right - rect1.left,
  overlapRight: rect1.right - rect2.left,
  overlapTop: rect2.bottom - rect1.top,
  overlapBottom: rect1.bottom - rect2.top,
});

/**
 * @param {Object} [settings={}]
 * @param {number} [settings.overlapLeft]
 * @param {number} [settings.overlapRight]
 * @param {number} [settings.overlapTop]
 * @param {number} [settings.overlapBottom]
 * @returns {{ dirX: Dirs, dirY: Dirs }}
 */
export const getElsCollOverlapPos = ({
  overlapLeft = -1,
  overlapRight = -1,
  overlapTop = -1,
  overlapBottom = -1,
} = {}) => ({
  dirX: overlapLeft < overlapRight ? 'right' : 'left',
  dirY: overlapTop < overlapBottom ? 'bottom' : 'top',
});

// Center

/**
 * Calculates the center point (X and Y) of a given Rect.
 *
 * @param {DOMRect} rect - The bounding rectangle of the element.
 * @returns {{ x: number, y: number }} An object with the `x` and `y` coordinates of the center.
 */
export const getRectCenter = (rect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

// Tools

/**
 * Calculates the offset between the center of rect2 and the center of rect1.
 *
 * The values will be 0 when rect1 is perfectly centered over rect2.
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the reference element.
 * @param {DOMRect} rect2 - The bounding rectangle of the element being compared.
 * @returns {{
 *   x: number,
 *   y: number
 * }} An object with the X and Y offset in pixels from rect1's center to rect2's center.
 */
export function getRelativeCenterOffset(rect1, rect2) {
  const center1X = rect1.left + rect1.width / 2;
  const center1Y = rect1.top + rect1.height / 2;

  const center2X = rect2.left + rect2.width / 2;
  const center2Y = rect2.top + rect2.height / 2;

  return {
    x: center2X - center1X,
    y: center2Y - center1Y,
  };
}

/**
 * Detects the direction of the dominant collision between two elements
 * and calculates how deep the overlap is in both x and y axes.
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {{
 *   inDir: Dirs | null;
 *   dirX: Dirs | null;
 *   dirY: Dirs | null;
 *   depthX: number;
 *   depthY: number;
 * }} An object containing the collision direction and how deep the overlap is.
 */
export function getElsCollDirDepth(rect1, rect2) {
  if (!areElsPerfColliding(rect1, rect2))
    return {
      inDir: null,
      dirX: null,
      dirY: null,
      depthX: 0,
      depthY: 0,
    };

  const { overlapLeft, overlapRight, overlapTop, overlapBottom } = getElsCollOverlap(rect1, rect2);
  const { dirX, dirY } = getElsCollOverlapPos({
    overlapLeft,
    overlapRight,
    overlapTop,
    overlapBottom,
  });
  const depthX = Math.min(overlapLeft, overlapRight);
  const depthY = Math.min(overlapTop, overlapBottom);

  /** @type {Dirs} */
  let inDir;

  if (depthX < depthY) inDir = dirX;
  else inDir = dirY;
  return { inDir, dirX, dirY, depthX, depthY };
}

/** @typedef {'top'|'bottom'|'left'|'right'} Dirs */

/**
 * @typedef {{
 *   in: Dirs | 'center' | null;
 *   x: Dirs | null;
 *   y: Dirs | null;
 * }} CollDirs
 */

/**
 * @typedef {{
 *   x: Dirs | null;
 *   y: Dirs | null;
 * }} NegCollDirs
 */

/**
 * @typedef {{
 *   top: number;
 *   bottom: number;
 *   left: number;
 *   right: number;
 * }} CollData
 */

/**
 * @typedef {{
 *   x: number;
 *   y: number;
 * }} CollCenter
 */

/**
 * Detects the collision direction and depth between two DOMRects.
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {{ depth: CollData; dirs: CollDirs; isNeg: NegCollDirs; }} Collision info or null if no collision is detected.
 */
export function getElsCollDetails(rect1, rect2) {
  const isColliding = areElsPerfColliding(rect1, rect2);

  /** @type {CollDirs} */
  const dirs = { in: null, x: null, y: null };

  /** @type {NegCollDirs} */
  const isNeg = { y: null, x: null };

  /** @type {Record<Dirs, number>} */
  const depth = { top: 0, bottom: 0, left: 0, right: 0 };

  // Depth
  // Yes, it's actually reversed the values orders
  const { overlapLeft, overlapRight, overlapTop, overlapBottom } = getElsCollOverlap(rect2, rect1);
  depth.top = overlapTop;
  depth.bottom = overlapBottom;
  depth.left = overlapLeft;
  depth.right = overlapRight;

  // Dirs
  /**
   * Detect the direction with the smallest positive overlap (entry point)
   * @type {[Dirs, number][]}
   */
  // @ts-ignore
  const entries = Object.entries(depth)
    .filter(([, val]) => val > 0)
    .sort((a, b) => a[1] - b[1]);

  // Yes, it's actually reversed the values orders here too
  const { dirX, dirY } = getElsCollOverlapPos({
    overlapLeft: overlapRight,
    overlapRight: overlapLeft,
    overlapTop: overlapBottom,
    overlapBottom: overlapTop,
  });
  dirs.y = dirY;
  dirs.x = dirX;

  // isNeg
  if (depth.bottom < 0) isNeg.y = 'bottom';
  else if (depth.top < 0) isNeg.y = 'top';
  if (depth.left < 0) isNeg.x = 'left';
  else if (depth.right < 0) isNeg.x = 'right';

  // Inside Dir
  dirs.in = isColliding
    ? depth.top === depth.bottom && depth.bottom === depth.left && depth.left === depth.right
      ? 'center'
      : entries.length
        ? entries[0][0]
        : 'top'
    : null; // fallback in case of exact match

  // Complete
  return { dirs, depth, isNeg };
}
