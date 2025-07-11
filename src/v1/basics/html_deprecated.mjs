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

/////////////////////////////////////////////////////////////

// The new version will receive great modifications, the deprecated code has been preserved for non-glitch designs that are using the original code.

/**
 * Checks if the given element is at least partially visible in the viewport.
 *
 * @param {HTMLElement} element - The DOM element to check.
 * @returns {boolean} True if the element is partially in the viewport, false otherwise.
 * @deprecated - Use TinyHtml.isInViewport instead.
 */
export function isInViewport(element) {
  const elementTop = element.offsetTop;
  const elementBottom = elementTop + element.offsetHeight;

  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  return elementBottom > viewportTop && elementTop < viewportBottom;
}

/**
 * Checks if the given element is fully visible in the viewport (top and bottom).
 *
 * @param {HTMLElement} element - The DOM element to check.
 * @returns {boolean} True if the element is fully visible in the viewport, false otherwise.
 * @deprecated - Use TinyHtml.isScrolledIntoView instead.
 */
export function isScrolledIntoView(element) {
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  const elemTop = element.offsetTop;
  const elemBottom = elemTop + element.offsetHeight;

  return elemBottom <= viewportBottom && elemTop >= viewportTop;
}
