import TinyHtml from '../libs/TinyHtml.mjs';

/**
 * Checks if two DOM elements are colliding on the screen.
 *
 * @param {Element} elem1 - First DOM element.
 * @param {Element} elem2 - Second DOM element.
 * @returns {boolean} - Returns true if the elements are colliding.
 * @deprecated - Use TinyHtml.isCollWith instead.
 */
export function areHtmlElsColliding(elem1, elem2) {
  return TinyHtml.isCollWith(elem1, elem2);
}

/**
 * Checks if two DOM elements are colliding on the screen.
 *
 * @param {Element} elem1 - First DOM element.
 * @param {Element} elem2 - Second DOM element.
 * @returns {boolean} - Returns true if the elements are colliding.
 * @deprecated - Use TinyHtml.isCollPerfWith instead.
 */
export function areHtmlElsPerfColliding(elem1, elem2) {
  return TinyHtml.isCollPerfWith(elem1, elem2);
}

///////////////////////////////////////////////////////////////////////////

/**
 * @typedef {import('../libs/TinyHtml.mjs').HtmlElBoxSides} HtmlElBoxSides
 */

/**
 * Returns the total border width and individual sides from `border{Side}Width` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border widths, and each side individually.
 * @deprecated - Use TinyHtml.borderWidth instead.
 */
export const getHtmlElBordersWidth = (el) => {
  return TinyHtml.borderWidth(el);
};

/**
 * Returns the total border size and individual sides from `border{Side}` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border sizes, and each side individually.
 * @deprecated - Use TinyHtml.border instead.
 */
export const getHtmlElBorders = (el) => {
  return TinyHtml.border(el);
};

/**
 * Returns the total margin and individual sides from `margin{Side}` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) margins, and each side individually.
 * @deprecated - Use TinyHtml.margin instead.
 */
export const getHtmlElMargin = (el) => {
  return TinyHtml.margin(el);
};

/**
 * Returns the total padding and individual sides from `padding{Side}` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) paddings, and each side individually.
 * @deprecated - Use TinyHtml.padding instead.
 */
export const getHtmlElPadding = (el) => {
  return TinyHtml.padding(el);
};
