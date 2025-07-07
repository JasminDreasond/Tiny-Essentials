/**
 * TinyHtml is a utility class that provides static and instance-level methods
 * for precise dimension and position computations on HTML elements.
 * It mimics some jQuery functionalities while using native browser APIs.
 *
 * Inspired by the jQuery project's open source implementations of element dimension
 * and offset utilities. This class serves as a lightweight alternative using modern DOM APIs.
 *
 * @class
 */
class TinyHtml {
  /**
   * The target HTML element for instance-level operations.
   * @type {HTMLElement}
   */
  #el;

  /**
   * Creates an instance of TinyHtml for a specific HTMLElement.
   * Useful when you want to operate repeatedly on the same element using instance methods.
   * @param {HTMLElement} el - The element to wrap and manipulate.
   */
  constructor(el) {
    this.#el = el;
  }

  /**
   * Checks whether the given object is a window.
   * @param {*} obj - The object to test.
   * @returns {obj is Window} - True if it's a Window.
   */
  static isWindow(obj) {
    return obj != null && obj === obj.window;
  }

  /**
   * Returns the computed CSS float value of a property.
   * @param {HTMLElement} el - The element to inspect.
   * @param {string} prop - The CSS property.
   * @returns {number} - The parsed float value.
   */
  static cssFloat(el, prop) {
    // @ts-ignore
    const val = window.getComputedStyle(el)[prop];
    return parseFloat(val) || 0;
  }

  /**
   * Returns the computed CSS float value of a property.
   * @param {string} prop - The CSS property.
   * @returns {number} - The parsed float value.
   */
  cssFloat(prop) {
    return TinyHtml.cssFloat(this.#el, prop);
  }

  /**
   * Returns computed float values of multiple CSS properties.
   * @param {HTMLElement} el - The element to inspect.
   * @param {string[]} prop - An array of CSS properties.
   * @returns {Record<string, number>} - Map of property to float value.
   */
  static cssFloats(el, prop) {
    const css = window.getComputedStyle(el);
    /** @type {Record<string, number>} */
    const result = {};
    for (const name of prop) {
      // @ts-ignore
      result[name] = parseFloat(css[name]) || 0;
    }
    return result;
  }

  /**
   * Returns computed float values of multiple CSS properties.
   * @param {string[]} prop - An array of CSS properties.
   * @returns {Record<string, number>} - Map of property to float value.
   */
  cssFloats(prop) {
    return TinyHtml.cssFloats(this.#el, prop);
  }

  /**
   * Sets the vertical scroll position of the window.
   * @param {number} [value] - Sets the scroll position.
   */
  static setWinScrollTop(value) {
    window.scrollTo({ top: value });
  }

  /**
   * Sets the horizontal scroll position of the window.
   * @param {number} [value] - Sets the scroll position.
   */
  static setWinScrollLeft(value) {
    window.scrollTo({ left: value });
  }

  /**
   * Gets the vertical scroll position of the window.
   * @returns {number} - The current scroll top value.
   */
  static winScrollTop() {
    return window.scrollY || document.documentElement.scrollTop;
  }

  /**
   * Gets the horizontal scroll position of the window.
   * @returns {number} - The current scroll left value.
   */
  static winScrollLeft() {
    return window.scrollX || document.documentElement.scrollLeft;
  }

  /**
   * Returns the current height of the viewport.
   * @returns {number} - Viewport height in pixels.
   */
  static winInnerHeight() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  /**
   * Returns the current width of the viewport.
   * @returns {number} - Viewport width in pixels.
   */
  static winInnerWidth() {
    return window.innerWidth || document.documentElement.clientWidth;
  }

  /**
   * Gets the width or height of an element based on the box model.
   * @param {HTMLElement|Window} el - The element or window.
   * @param {"width"|"height"} type - Dimension type.
   * @param {"content"|"padding"|"border"|"margin"} extra - Box model context.
   * @returns {number} - Computed dimension.
   */
  static getDimension(el, type, extra = 'content') {
    const name = type === 'width' ? 'Width' : 'Height';

    if (TinyHtml.isWindow(el)) {
      // @ts-ignore
      return extra === 'margin' ? el['inner' + name] : el.document.documentElement['client' + name];
    }
    if (!(el instanceof HTMLElement)) throw new Error('Invalid HTMLElement in getDimension.');
    /** @type {HTMLElement} */
    const elHtml = el;

    if (elHtml.nodeType === 9) {
      // @ts-ignore
      const doc = elHtml.documentElement;
      return Math.max(
        // @ts-ignore
        elHtml.body['scroll' + name],
        doc['scroll' + name],
        // @ts-ignore
        elHtml.body['offset' + name],
        doc['offset' + name],
        doc['client' + name],
      );
    }

    let size = elHtml.getBoundingClientRect()[type];

    /**
     * Auxiliary function to add measures on one side and the other
     * @param {string} prefix
     */
    function sumSides(prefix) {
      if (type === 'width') {
        return (
          TinyHtml.cssFloat(elHtml, prefix + 'Left') + TinyHtml.cssFloat(elHtml, prefix + 'Right')
        );
      } else {
        return (
          TinyHtml.cssFloat(elHtml, prefix + 'Top') + TinyHtml.cssFloat(elHtml, prefix + 'Bottom')
        );
      }
    }

    switch (extra) {
      case 'content':
        // remove padding + border
        size -= sumSides('padding');
        size -= sumSides('border');
        break;

      case 'padding':
        // remove border only (padding included in the bounding rect)
        size -= sumSides('border');
        break;

      case 'border':
        // bounding rect already includes border + padding, so do not move the size
        break;

      case 'margin':
        // adds margin (margin is out of bounding rect)
        size += sumSides('margin');
        break;
    }

    return size;
  }

  /**
   * Gets the width or height of an element based on the box model.
   * @param {"width"|"height"} type - Dimension type.
   * @param {"content"|"padding"|"border"|"margin"} extra - Box model context.
   * @returns {number} - Computed dimension.
   */
  getDimension(type, extra) {
    return TinyHtml.getDimension(this.#el, type, extra);
  }

  /**
   * Sets the height of the element.
   * @param {HTMLElement} el - Target element.
   * @param {string|number} value - Height value.
   */
  static setHeight(el, value) {
    el.style.height = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * Sets the height of the element.
   * @param {string|number} value - Height value.
   */
  setHeight(value) {
    return TinyHtml.setHeight(this.#el, value);
  }

  /**
   * Sets the width of the element.
   * @param {HTMLElement} el - Target element.
   * @param {string|number} value - Width value.
   */
  static setWidth(el, value) {
    el.style.width = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * Sets the width of the element.
   * @param {string|number} value - Width value.
   */
  setWidth(value) {
    return TinyHtml.setWidth(this.#el, value);
  }

  /**
   * Returns content box height.
   * @param {HTMLElement} el - Target element.
   * @returns {number}
   */
  static height(el) {
    return TinyHtml.getDimension(el, 'height', 'content');
  }

  /**
   * Returns content box height.
   * @returns {number}
   */
  height() {
    return TinyHtml.height(this.#el);
  }

  /**
   * Returns content box width.
   * @param {HTMLElement} el - Target element.
   * @returns {number}
   */
  static width(el) {
    return TinyHtml.getDimension(el, 'width', 'content');
  }

  /**
   * Returns content box width.
   * @returns {number}
   */
  width() {
    return TinyHtml.width(this.#el);
  }

  /**
   * Returns padding box height.
   * @param {HTMLElement} el - Target element.
   * @returns {number}
   */
  static innerHeight(el) {
    return TinyHtml.getDimension(el, 'height', 'padding');
  }

  /**
   * Returns padding box height.
   * @returns {number}
   */
  innerHeight() {
    return TinyHtml.innerHeight(this.#el);
  }

  /**
   * Returns padding box width.
   * @param {HTMLElement} el - Target element.
   * @returns {number}
   */
  static innerWidth(el) {
    return TinyHtml.getDimension(el, 'width', 'padding');
  }

  /**
   * Returns padding box width.
   * @returns {number}
   */
  innerWidth() {
    return TinyHtml.innerWidth(this.#el);
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {HTMLElement} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerHeight(el, includeMargin = false) {
    return TinyHtml.getDimension(el, 'height', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerHeight(includeMargin) {
    return TinyHtml.outerHeight(this.#el, includeMargin);
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {HTMLElement} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerWidth(el, includeMargin = false) {
    return TinyHtml.getDimension(el, 'width', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerWidth(includeMargin) {
    return TinyHtml.outerWidth(this.#el, includeMargin);
  }

  //////////////////////////////////////////////////

  /**
   * Gets the offset of the element relative to the document.
   * @param {HTMLElement} el - Target element.
   * @returns {{top: number, left: number}}
   */
  static offset(el) {
    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
    };
  }

  /**
   * Gets the offset of the element relative to the document.
   * @returns {{top: number, left: number}}
   */
  offset() {
    return TinyHtml.offset(this.#el);
  }

  /**
   * Gets the position of the element relative to its offset parent.
   * @param {HTMLElement} elem - Target element.
   * @returns {{top: number, left: number}}
   */
  static position(elem) {
    if (!(elem instanceof HTMLElement)) throw new Error('Invalid HTMLElement to get position.');

    let offsetParent;
    let offset;
    let parentOffset = { top: 0, left: 0 };

    const computedStyle = window.getComputedStyle(elem);

    if (computedStyle.position === 'fixed') {
      offset = elem.getBoundingClientRect();
    } else {
      offset = TinyHtml.offset(elem);

      offsetParent = elem.offsetParent || document.documentElement;
      const { position } = window.getComputedStyle(offsetParent);

      while (
        offsetParent instanceof HTMLElement &&
        (offsetParent === document.body || offsetParent === document.documentElement) &&
        position === 'static'
      ) {
        offsetParent = offsetParent.parentNode;
      }

      if (
        offsetParent instanceof HTMLElement &&
        offsetParent !== elem &&
        offsetParent.nodeType === 1
      ) {
        const { borderTopWidth, borderLeftWidth } = TinyHtml.cssFloats(offsetParent, [
          'borderTopWidth',
          'borderLeftWidth',
        ]);
        parentOffset = TinyHtml.offset(offsetParent);
        parentOffset.top += borderTopWidth;
        parentOffset.left += borderLeftWidth;
      }
    }

    return {
      top: offset.top - parentOffset.top - TinyHtml.cssFloat(elem, 'marginTop'),
      left: offset.left - parentOffset.left - TinyHtml.cssFloat(elem, 'marginLeft'),
    };
  }

  /**
   * Gets the position of the element relative to its offset parent.
   * @returns {{top: number, left: number}}
   */
  position() {
    return TinyHtml.position(this.#el);
  }

  /**
   * Gets the closest positioned ancestor element.
   * @param {HTMLElement} elem - Target element.
   * @returns {HTMLElement} - Offset parent element.
   */
  static offsetParent(elem) {
    if (!(elem instanceof HTMLElement)) throw new Error('Invalid HTMLElement to get OffsetParent.');
    let offsetParent = elem.offsetParent;

    while (
      offsetParent instanceof HTMLElement &&
      window.getComputedStyle(offsetParent).position === 'static'
    ) {
      offsetParent = offsetParent.offsetParent;
    }

    // Fallback to document.documentElement
    return offsetParent instanceof HTMLElement ? offsetParent : document.documentElement;
  }

  /**
   * Gets the closest positioned ancestor element.
   * @returns {HTMLElement} - Offset parent element.
   */
  offsetParent() {
    return TinyHtml.offsetParent(this.#el);
  }

  /**
   * Gets the vertical scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @returns {number}
   */
  static scrollTop(el) {
    if (TinyHtml.isWindow(el)) return el.pageYOffset;
    // @ts-ignore
    if (el.nodeType === 9) return el.defaultView.pageYOffset;
    return el.scrollTop;
  }

  /**
   * Gets the vertical scroll position.
   * @returns {number}
   */
  scrollTop() {
    return TinyHtml.scrollTop(this.#el);
  }

  /**
   * Gets the horizontal scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @returns {number}
   */
  static scrollLeft(el) {
    if (TinyHtml.isWindow(el)) return el.pageXOffset;
    // @ts-ignore
    if (el.nodeType === 9) return el.defaultView.pageXOffset;
    return el.scrollLeft;
  }

  /**
   * Gets the horizontal scroll position.
   * @returns {number}
   */
  scrollLeft() {
    return TinyHtml.scrollLeft(this.#el);
  }

  /**
   * Sets the vertical scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @param {number} value - Scroll top value.
   */
  static setScrollTop(el, value) {
    if (TinyHtml.isWindow(el)) {
      el.scrollTo(el.pageXOffset, value);
    } else if (el.nodeType === 9) {
      // @ts-ignore
      el.defaultView.scrollTo(el.defaultView.pageXOffset, value);
    } else {
      el.scrollTop = value;
    }
  }

  /**
   * Sets the vertical scroll position.
   * @param {number} value - Scroll top value.
   */
  setScrollTop(value) {
    return TinyHtml.setScrollTop(this.#el, value);
  }

  /**
   * Sets the horizontal scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @param {number} value - Scroll left value.
   */
  static setScrollLeft(el, value) {
    if (TinyHtml.isWindow(el)) {
      el.scrollTo(value, el.pageYOffset);
    } else if (el.nodeType === 9) {
      // @ts-ignore
      el.defaultView.scrollTo(value, el.defaultView.pageYOffset);
    } else {
      el.scrollLeft = value;
    }
  }

  /**
   * Sets the horizontal scroll position.
   * @param {number} value - Scroll left value.
   */
  setScrollLeft(value) {
    return TinyHtml.setScrollLeft(this.#el, value);
  }
}

export default TinyHtml;
