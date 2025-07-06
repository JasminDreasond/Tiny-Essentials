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

/**
 * Detects the direction of the dominant collision between two elements
 * and calculates how deep the overlap is in both x and y axes.
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {{
 *   direction: Dirs | null,
 *   depthX: number,
 *   depthY: number
 * }} An object containing the collision direction and how deep the overlap is.
 */
export function getElsCollDirAndDepth(rect1, rect2) {
  if (!areElsPerfColliding(rect1, rect2)) return { direction: null, depthX: 0, depthY: 0 };

  const overlapLeft = rect2.right - rect1.left;
  const overlapRight = rect1.right - rect2.left;
  const overlapTop = rect2.bottom - rect1.top;
  const overlapBottom = rect1.bottom - rect2.top;

  const depthX = Math.min(overlapLeft, overlapRight);
  const depthY = Math.min(overlapTop, overlapBottom);

  /** @type {Dirs | null} */
  let direction = null;
  if (depthX < depthY) direction = overlapLeft < overlapRight ? 'right' : 'left';
  else direction = overlapTop < overlapBottom ? 'bottom' : 'top';
  return { direction, depthX, depthY };
}

/** @typedef {'top'|'bottom'|'left'|'right'} Dirs */

/**
 * Detects the collision direction and depth between two DOMRects.
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {{
 *   direction: Dirs|null;
 *   top: number;
 *   bottom: number;
 *   left: number;
 *   right: number;
 * }} Collision info or null if no collision is detected.
 */
export function getElsCollDetails(rect1, rect2) {
  const isColliding = areElsPerfColliding(rect1, rect2);
  /** @type {Record<Dirs, number>} */
  const depth = { top: 0, bottom: 0, left: 0, right: 0 };
  if (!isColliding) return { direction: null, ...depth };

  depth.top = Math.max(0, rect1.bottom - rect2.top);
  depth.bottom = Math.max(0, rect2.bottom - rect1.top);
  depth.left = Math.max(0, rect1.right - rect2.left);
  depth.right = Math.max(0, rect2.right - rect1.left);

  /**
   * Detect the direction with the smallest positive overlap (entry point)
   * @type {[Dirs, number][]}
   */
  // @ts-ignore
  const entries = Object.entries(depth)
    .filter(([, val]) => val > 0)
    .sort((a, b) => a[1] - b[1]);

  /** @type {Dirs} */
  const direction = entries.length ? entries[0][0] : 'top'; // fallback in case of exact match
  return { direction, ...depth };
}
