/**
 * Checks if rect1 is completely above rect2 (no vertical collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is above rect2 without overlapping.
 */
export const getHtmlElsCollDataTop = (rect1, rect2) => rect1.bottom < rect2.top;

/**
 * Checks if rect1 is completely below rect2 (no vertical collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is below rect2 without overlapping.
 */
export const getHtmlElsCollDataBottom = (rect1, rect2) => rect1.top > rect2.bottom;

/**
 * Checks if rect1 is completely to the left of rect2 (no horizontal collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is left of rect2 without overlapping.
 */
export const getHtmlElsCollDataLeft = (rect1, rect2) => rect1.right < rect2.left;

/**
 * Checks if rect1 is completely to the right of rect2 (no horizontal collision).
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if rect1 is right of rect2 without overlapping.
 */
export const getHtmlElsCollDataRight = (rect1, rect2) => rect1.left > rect2.right;

/**
 * Checks if two elements (via their bounding rectangles) are overlapping or touching.
 *
 * @param {DOMRect} rect1 - The bounding rectangle of the first element.
 * @param {DOMRect} rect2 - The bounding rectangle of the second element.
 * @returns {boolean} True if the elements are colliding or intersecting; false if fully separated.
 */
export const getHtmlElsCollData = (rect1, rect2) =>
  !(
    getHtmlElsCollDataLeft(rect1, rect2) ||
    getHtmlElsCollDataRight(rect1, rect2) ||
    getHtmlElsCollDataTop(rect1, rect2) ||
    getHtmlElsCollDataBottom(rect1, rect2)
  );
