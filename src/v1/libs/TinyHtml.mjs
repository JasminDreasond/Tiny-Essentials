/**
 * Represents any raw HTML element that can be handled by the library.
 *
 * @typedef {HTMLElement|Element} TinyElementPackRaw
 */

/**
 * Represents a raw DOM element or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {TinyElementPackRaw|TinyHtml} TinyElementPack
 */

/**
 * A parameter type used for filtering or matching elements.
 * It can be:
 * - A string (CSS selector),
 * - A raw DOM element,
 * - An array of raw DOM elements,
 * - A filtering function that receives an index and element,
 *   and returns true if it matches.
 *
 * @typedef {string|TinyElementPackRaw|TinyElementPackRaw[]|((index: number, el: TinyElementPackRaw) => boolean)} WinnowRequest
 */


/**
 * Elements accepted as constructor values for TinyHtml.
 * These include common DOM elements and root containers.
 *
 * @typedef {HTMLElement|Window|Element|Document} ConstructorElValues
 */

/**
 * The handler function used in event listeners.
 *
 * @typedef {(e: Event) => any} EventRegistryHandle
 */

/**
 * Options passed to `addEventListener` or `removeEventListener`.
 * Can be a boolean or an object of type `AddEventListenerOptions`.
 *
 * @typedef {boolean|AddEventListenerOptions} EventRegistryOptions
 */

/**
 * Structure describing a registered event callback and its options.
 *
 * @typedef {Object} EventRegistryItem
 * @property {EventRegistryHandle} handler - The function to be executed when the event is triggered.
 * @property {EventRegistryOptions} [options] - Optional configuration passed to the listener.
 */

/**
 * Maps event names (e.g., `"click"`, `"keydown"`) to a list of registered handlers and options.
 *
 * @typedef {Record<string, EventRegistryItem[]>} EventRegistryList
 */

/**
 * WeakMap storing all event listeners per element.
 * Each element has a registry mapping event names to their handler lists.
 *
 * @type {WeakMap<ConstructorElValues, EventRegistryList>}
 */
const __eventRegistry = new WeakMap();

/**
 * @typedef {Object} HtmlElBoxSides
 * @property {number} x - Total horizontal size (left + right)
 * @property {number} y - Total vertical size (top + bottom)
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 */

/**
 * @typedef {string|number|boolean} SetValValueBase - Primitive types accepted as input values.
 */

/**
 * @typedef {SetValValueBase|SetValValueBase[]} SetValValue - A single value or an array of values to be assigned to the input element.
 */

/**
 * A list of HTML form elements that can have a `.value` property used by TinyHtml.
 * Includes common input types used in forms.
 *
 * @typedef {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|HTMLOptionElement} HtmlValInputsList
 */

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
   * Validates whether the given object is an HTMLElement or optionally a Window.
   * Used internally for argument safety checks.
   *
   * @param {*} el - The object to test.
   * @param {string} where - The context/method name using this validation.
   * @param {boolean} [needsWindow=false] - If true, allows Window objects as valid.
   * @param {boolean} [canDocument=false] - If true, allows Document objects as valid.
   * @throws {TypeError} If `where` is not a string or `needsWindow` is not a boolean.
   * @readonly
   */
  static _isElement(el, where, needsWindow = false, canDocument = false) {
    if (typeof where !== 'string')
      throw new TypeError('[TinyHtml] "where" in _isElement() must be a string.');
    if (typeof needsWindow !== 'boolean')
      throw new TypeError('[TinyHtml] "needsWindow" in _isElement() must be a boolean.');
    if (
      !(el instanceof HTMLElement) &&
      (!needsWindow || !(el instanceof Window)) &&
      ((!canDocument && el instanceof Document) || (canDocument && !(el instanceof Document)))
    )
      throw new Error(`[TinyHtml] Invalid Element in ${where}().`);
  }

  /**
   * Validates whether the given object is an HTMLElement or optionally a Window.
   * Used internally for argument safety checks.
   *
   * @param {string} where - The context/method name using this validation.
   * @param {boolean} [needsWindow=false] - If true, allows Window objects as valid.
   * @param {boolean} [canDocument=false] - If true, allows Document objects as valid.
   * @throws {TypeError} If `where` is not a string or `needsWindow` is not a boolean.
   * @readonly
   */
  _isElement(where, needsWindow, canDocument) {
    return TinyHtml._isElement(this.#el, where, needsWindow, canDocument);
  }

  /**
   * Validates whether the given object is an Document.
   * Used internally for argument safety checks.
   *
   * @param {*} el - The object to test.
   * @param {string} where - The context/method name using this validation.
   * @throws {TypeError} If `where` is not a string.
   * @readonly
   */
  static _isDocument(el, where) {
    if (typeof where !== 'string')
      throw new TypeError('[TinyHtml] "where" in _isElement() must be a string.');
    if (!(el instanceof Document)) throw new Error(`[TinyHtml] Invalid Document in ${where}().`);
  }

  /**
   * Validates whether the given object is an Document.
   * Used internally for argument safety checks.
   *
   * @param {string} where - The context/method name using this validation.
   * @throws {TypeError} If `where` is not a string.
   * @readonly
   */
  _isDocument(where) {
    return TinyHtml._isDocument(this.#el, where);
  }

  /**
   * Internal utility to validate if a given element is a valid HTMLElement.
   * Throws an error if the element is not an instance of HTMLElement.
   *
   * @param {*} el - The element to validate.
   * @param {string} where - The method or context name where validation is being called.
   * @throws {TypeError} If `where` is not a string.
   * @throws {Error} If the element is not an HTMLElement.
   * @readonly
   */
  static _isHtmlElement(el, where) {
    if (typeof where !== 'string')
      throw new TypeError('[TinyHtml] "where" in getHtmlElement() must be a string.');
    if (!(el instanceof HTMLElement)) throw new Error(`[TinyHtml] Invalid Element in ${where}().`);
  }

  /**
   * Internal utility to validate if a given element is a valid HTMLElement.
   * Throws an error if the element is not an instance of HTMLElement.
   *
   * @param {string} where - The method or context name where validation is being called.
   * @throws {TypeError} If `where` is not a string.
   * @throws {Error} If the element is not an HTMLElement.
   * @readonly
   */
  _isHtmlElement(where) {
    return TinyHtml._isHtmlElement(this.#el, where);
  }

  /**
   * Internal helper to validate and return the HTMLElement.
   * Throws an error if the element is invalid.
   *
   * @param {string} where - The method name or context calling this.
   * @returns {HTMLElement} - The HTMLElement.
   * @throws {TypeError} If `where` is not a string.
   */
  getHtmlElement(where) {
    this._isHtmlElement(where);
    return /** @type {HTMLElement} */ (this.#el);
  }

  /**
   * Internal utility to validate if a given element is a valid value input element.
   * Throws an error if the element is not an instance of a supported input type.
   *
   * @param {*} el - The element to validate.
   * @param {string} where - The method or context name where validation is being called.
   * @throws {TypeError} If `where` is not a string.
   * @throws {Error} If the element is not a valid value input element.
   * @readonly
   */
  static _isValElement(el, where) {
    if (typeof where !== 'string')
      throw new TypeError('[TinyHtml] "where" in getValElement() must be a string.');
    if (
      !(el instanceof HTMLInputElement) &&
      !(el instanceof HTMLSelectElement) &&
      !(el instanceof HTMLTextAreaElement) &&
      !(el instanceof HTMLOptionElement)
    )
      throw new Error(`[TinyHtml] Invalid Value Element in ${where}().`);
  }

  /**
   * Internal utility to validate if a given element is a valid value input element.
   * Throws an error if the element is not an instance of a supported input type.
   *
   * @param {string} where - The method or context name where validation is being called.
   * @throws {TypeError} If `where` is not a string.
   * @throws {Error} If the element is not a valid value input element.
   * @readonly
   */
  _isValElement(where) {
    return TinyHtml._isValElement(this.#el, where);
  }

  /**
   * Internal helper to validate and return the HTML Value Element.
   * Throws an error if the element is invalid.
   *
   * @param {string} where - The method name or context calling this.
   * @returns {HtmlValInputsList} - The HTML Value Element.
   * @throws {TypeError} If `where` is not a string.
   */
  getValElement(where) {
    this._isValElement(where);
    return /** @type {HtmlValInputsList} */ (this.#el);
  }

  /**
   * Returns the current element held by this instance.
   *
   * @returns {HTMLElement|Window} - The instance's target element.
   */
  getElement() {
    if (this.#el instanceof Document)
      throw new Error(`[TinyHtml] "getElement" must be a HTMLElement or Window.`);
    return this.#el;
  }

  //////////////////////////////////////////////////////

  /**
   * Ensures the input is returned as an array.
   * Useful to normalize operations across multiple or single elements.
   *
   * @param {TinyElementPack|TinyElementPack[]} elems - A single element or array of elements.
   * @returns {TinyElementPackRaw[]} - Always returns an array of elements.
   * @readonly
   */
  static _preElems(elems) {
    /** @param {TinyElementPack[]} item */
    const checkElement = (item) =>
      item.map((elem) => (elem instanceof TinyHtml ? elem.getHtmlElement(')preElems') : elem));
    if (!Array.isArray(elems)) return checkElement([elems]);
    return checkElement(elems);
  }

  /**
   * Filters an array of elements based on a selector, function, element, or array of elements.
   *
   * @param {TinyElementPackRaw[]} elems
   * @param {WinnowRequest} qualifier
   * @param {boolean} not Whether to invert the result (used for .not())
   * @returns {Element[]}
   */
  static winnow(elems, qualifier, not = false) {
    if (typeof qualifier === 'function') {
      return elems.filter((el, i) => !!qualifier.call(el, i, el) !== not);
    }

    if (qualifier instanceof Element) {
      return elems.filter((el) => (el === qualifier) !== not);
    }

    if (
      Array.isArray(qualifier) ||
      (typeof qualifier !== 'string' &&
        // @ts-ignore
        qualifier.length != null)
    ) {
      return elems.filter((el) => qualifier.includes(el) !== not);
    }

    // Assume it's a selector string
    return TinyHtml.filter(elems, qualifier, not);
  }

  /**
   * Filters a set of elements by a CSS selector.
   *
   * @param {TinyElementPack|TinyElementPack[]} elems
   * @param {string} selector
   * @param {boolean} not
   * @returns {Element[]}
   */
  static filter(elems, selector, not = false) {
    if (not) selector = `:not(${selector})`;
    return TinyHtml._preElems(elems).filter((el) => el.nodeType === 1 && el.matches(selector));
  }

  /**
   * Filters a set of elements in your element by a CSS selector.
   *
   * @param {string} selector
   * @param {boolean} not
   * @returns {Element[]}
   */
  filter(selector, not = false) {
    return TinyHtml.filter(this.getHtmlElement('filter'), selector, not);
  }

  /**
   * Returns only the elements matching the given selector or function.
   *
   * @param {TinyElementPack|TinyElementPack[]} elems
   * @param {WinnowRequest} selector
   * @returns {Element[]}
   */
  static filterOnly(elems, selector) {
    return TinyHtml.winnow(TinyHtml._preElems(elems), selector, false);
  }

  /**
   * Returns only the elements in your elemenet matching the given selector or function.
   *
   * @param {WinnowRequest} selector
   * @returns {Element[]}
   */
  filterOnly(selector) {
    return TinyHtml.filterOnly(this.getHtmlElement('filterOnly'), selector);
  }

  /**
   * Returns only the elements **not** matching the given selector or function.
   *
   * @param {TinyElementPack|TinyElementPack[]} elems
   * @param {WinnowRequest} selector
   * @returns {Element[]}
   */
  static not(elems, selector) {
    return TinyHtml.winnow(TinyHtml._preElems(elems), selector, true);
  }

  /**
   * Returns only the elements **not** matching the given selector or function.
   *
   * @param {WinnowRequest} selector
   * @returns {Element[]}
   */
  not(selector) {
    return TinyHtml.not(this.getHtmlElement('not'), selector);
  }

  /**
   * Finds elements matching a selector within a context.
   *
   * @param {TinyElementPack|TinyElementPack[]} context
   * @param {string} selector
   * @returns {Element[]}
   */
  static find(context, selector) {
    const result = [];
    for (const el of TinyHtml._preElems(context)) {
      result.push(...el.querySelectorAll(selector));
    }
    return [...new Set(result)];
  }

  /**
   * Finds elements in your element matching a selector within a context.
   *
   * @param {string} selector
   * @returns {Element[]}
   */
  find(selector) {
    return TinyHtml.find(this.getHtmlElement('find'), selector);
  }

  /**
   * Checks if at least one element matches the selector.
   *
   * @param {TinyElementPack|TinyElementPack[]} elems
   * @param {WinnowRequest} selector
   * @returns {boolean}
   */
  static is(elems, selector) {
    return TinyHtml.winnow(TinyHtml._preElems(elems), selector, false).length > 0;
  }

  /**
   * Checks if the element matches the selector.
   *
   * @param {WinnowRequest} selector
   * @returns {boolean}
   */
  is(selector) {
    return TinyHtml.is(this.getHtmlElement('is'), selector);
  }

  //////////////////////////////////////////////////////

  /**
   * The target HTML element for instance-level operations.
   * @type {HTMLElement|Window|Document}
   */
  #el;

  /**
   * Creates an instance of TinyHtml for a specific HTMLElement.
   * Useful when you want to operate repeatedly on the same element using instance methods.
   * @param {ConstructorElValues} el - The element to wrap and manipulate.
   */
  constructor(el) {
    TinyHtml._isElement(el, 'constructor');
    if (!(el instanceof HTMLElement) && !(el instanceof Window) && !(el instanceof Document))
      throw new Error(`[TinyHtml] Invalid Element in constructor.`);
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
    TinyHtml._isElement(el, 'cssFloat');
    if (typeof prop !== 'string') throw new TypeError('The prop must be a string.');
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
    return TinyHtml.cssFloat(this.getHtmlElement('cssFloat'), prop);
  }

  /**
   * Returns computed float values of multiple CSS properties.
   * @param {HTMLElement} el - The element to inspect.
   * @param {string[]} prop - An array of CSS properties.
   * @returns {Record<string, number>} - Map of property to float value.
   */
  static cssFloats(el, prop) {
    TinyHtml._isElement(el, 'cssFloats');
    if (!Array.isArray(prop)) throw new TypeError('The prop must be an array of strings.');
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
    return TinyHtml.cssFloats(this.getHtmlElement('cssFloats'), prop);
  }

  /**
   * Sets the vertical scroll position of the window.
   * @param {number} value - Sets the scroll position.
   */
  static setWinScrollTop(value) {
    if (typeof value !== 'number') throw new TypeError('The value must be a number.');
    window.scrollTo({ top: value });
  }

  /**
   * Sets the horizontal scroll position of the window.
   * @param {number} value - Sets the scroll position.
   */
  static setWinScrollLeft(value) {
    if (typeof value !== 'number') throw new TypeError('The value must be a number.');
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
   * @param {"content"|"padding"|"border"|"margin"} [extra='content'] - Box model context.
   * @returns {number} - Computed dimension.
   * @throws {TypeError} If `type` or `extra` is not a string.
   */
  static getDimension(el, type, extra = 'content') {
    if (typeof type !== 'string') throw new TypeError('The type must be a string.');
    if (typeof extra !== 'string') throw new TypeError('The extra must be a string.');

    const name = type === 'width' ? 'Width' : 'Height';

    if (TinyHtml.isWindow(el)) {
      // @ts-ignore
      return extra === 'margin' ? el['inner' + name] : el.document.documentElement['client' + name];
    }
    TinyHtml._isElement(el, 'getDimension');
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
    return TinyHtml.getDimension(this.getElement(), type, extra);
  }

  /**
   * Sets the height of the element.
   * @param {HTMLElement} el - Target element.
   * @param {string|number} value - Height value.
   * @throws {TypeError} If `value` is neither a string nor number.
   */
  static setHeight(el, value) {
    TinyHtml._isElement(el, 'setHeight');
    if (typeof value !== 'number' && typeof value !== 'string')
      throw new TypeError('The value must be a string or number.');
    el.style.height = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * Sets the height of the element.
   * @param {string|number} value - Height value.
   */
  setHeight(value) {
    return TinyHtml.setHeight(this.getHtmlElement('setHeight'), value);
  }

  /**
   * Sets the width of the element.
   * @param {HTMLElement} el - Target element.
   * @param {string|number} value - Width value.
   * @throws {TypeError} If `value` is neither a string nor number.
   */
  static setWidth(el, value) {
    TinyHtml._isElement(el, 'setWidth');
    if (typeof value !== 'number' && typeof value !== 'string')
      throw new TypeError('The value must be a string or number.');
    el.style.width = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * Sets the width of the element.
   * @param {string|number} value - Width value.
   */
  setWidth(value) {
    return TinyHtml.setWidth(this.getHtmlElement('setWidth'), value);
  }

  /**
   * Returns content box height.
   * @param {HTMLElement|Window} el - Target element.
   * @returns {number}
   */
  static height(el) {
    TinyHtml._isElement(el, 'height');
    return TinyHtml.getDimension(el, 'height', 'content');
  }

  /**
   * Returns content box height.
   * @returns {number}
   */
  height() {
    return TinyHtml.height(this.getElement());
  }

  /**
   * Returns content box width.
   * @param {HTMLElement|Window} el - Target element.
   * @returns {number}
   */
  static width(el) {
    TinyHtml._isElement(el, 'width');
    return TinyHtml.getDimension(el, 'width', 'content');
  }

  /**
   * Returns content box width.
   * @returns {number}
   */
  width() {
    return TinyHtml.width(this.getElement());
  }

  /**
   * Returns padding box height.
   * @param {HTMLElement|Window} el - Target element.
   * @returns {number}
   */
  static innerHeight(el) {
    TinyHtml._isElement(el, 'innerHeight');
    return TinyHtml.getDimension(el, 'height', 'padding');
  }

  /**
   * Returns padding box height.
   * @returns {number}
   */
  innerHeight() {
    return TinyHtml.innerHeight(this.getElement());
  }

  /**
   * Returns padding box width.
   * @param {HTMLElement|Window} el - Target element.
   * @returns {number}
   */
  static innerWidth(el) {
    TinyHtml._isElement(el, 'innerWidth');
    return TinyHtml.getDimension(el, 'width', 'padding');
  }

  /**
   * Returns padding box width.
   * @returns {number}
   */
  innerWidth() {
    return TinyHtml.innerWidth(this.getElement());
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {HTMLElement|Window} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerHeight(el, includeMargin = false) {
    TinyHtml._isElement(el, 'outerHeight');
    return TinyHtml.getDimension(el, 'height', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerHeight(includeMargin) {
    return TinyHtml.outerHeight(this.getElement(), includeMargin);
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {HTMLElement|Window} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerWidth(el, includeMargin = false) {
    TinyHtml._isElement(el, 'outerWidth');
    return TinyHtml.getDimension(el, 'width', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerWidth(includeMargin) {
    return TinyHtml.outerWidth(this.getElement(), includeMargin);
  }

  //////////////////////////////////////////////////

  /**
   * Gets the offset of the element relative to the document.
   * @param {HTMLElement} el - Target element.
   * @returns {{top: number, left: number}}
   */
  static offset(el) {
    TinyHtml._isElement(el, 'offset');
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
    return TinyHtml.offset(this.getHtmlElement('offset'));
  }

  /**
   * Gets the position of the element relative to its offset parent.
   * @param {HTMLElement} elem - Target element.
   * @returns {{top: number, left: number}}
   */
  static position(elem) {
    TinyHtml._isElement(elem, 'position');

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
    return TinyHtml.position(this.getHtmlElement('position'));
  }

  /**
   * Gets the closest positioned ancestor element.
   * @param {HTMLElement} elem - Target element.
   * @returns {HTMLElement} - Offset parent element.
   */
  static offsetParent(elem) {
    TinyHtml._isElement(elem, 'offsetParent');
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
    return TinyHtml.offsetParent(this.getHtmlElement('offsetParent'));
  }

  /**
   * Gets the vertical scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @returns {number}
   */
  static scrollTop(el) {
    TinyHtml._isElement(el, 'scrollTop', true);
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
    return TinyHtml.scrollTop(this.getElement());
  }

  /**
   * Gets the horizontal scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @returns {number}
   */
  static scrollLeft(el) {
    TinyHtml._isElement(el, 'scrollLeft', true);
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
    return TinyHtml.scrollLeft(this.getElement());
  }

  /**
   * Sets the vertical scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @param {number} value - Scroll top value.
   */
  static setScrollTop(el, value) {
    TinyHtml._isElement(el, 'setScrollTop', true);
    if (typeof value !== 'number') throw new TypeError('');
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
    return TinyHtml.setScrollTop(this.getElement(), value);
  }

  /**
   * Sets the horizontal scroll position.
   * @param {HTMLElement|Window} el - Element or window.
   * @param {number} value - Scroll left value.
   */
  static setScrollLeft(el, value) {
    TinyHtml._isElement(el, 'setScrollLeft', true);
    if (typeof value !== 'number') throw new TypeError('');
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
    return TinyHtml.setScrollLeft(this.getElement(), value);
  }

  /**
   * Returns the total border width and individual sides from `border{Side}Width` CSS properties.
   *
   * @param {HTMLElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border widths, and each side individually.
   */
  static borderWidth(el) {
    TinyHtml._isElement(el, 'borderWidth');
    const {
      borderLeftWidth: left,
      borderRightWidth: right,
      borderTopWidth: top,
      borderBottomWidth: bottom,
    } = TinyHtml.cssFloats(el, [
      'borderLeftWidth',
      'borderRightWidth',
      'borderTopWidth',
      'borderBottomWidth',
    ]);
    const x = left + right;
    const y = top + bottom;

    return { x, y, left, right, top, bottom };
  }

  /**
   * Returns the total border width and individual sides from `border{Side}Width` CSS properties.
   *
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border widths, and each side individually.
   */
  borderWidth() {
    return TinyHtml.borderWidth(this.getHtmlElement('borderWidth'));
  }

  /**
   * Returns the total border size and individual sides from `border{Side}` CSS properties.
   *
   * @param {HTMLElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border sizes, and each side individually.
   */
  static border(el) {
    TinyHtml._isElement(el, 'border');
    const {
      borderLeft: left,
      borderRight: right,
      borderTop: top,
      borderBottom: bottom,
    } = TinyHtml.cssFloats(el, ['borderLeft', 'borderRight', 'borderTop', 'borderBottom']);
    const x = left + right;
    const y = top + bottom;

    return { x, y, left, right, top, bottom };
  }

  /**
   * Returns the total border size and individual sides from `border{Side}` CSS properties.
   *
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border sizes, and each side individually.
   */
  border() {
    return TinyHtml.border(this.getHtmlElement('border'));
  }

  /**
   * Returns the total margin and individual sides from `margin{Side}` CSS properties.
   *
   * @param {HTMLElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) margins, and each side individually.
   */
  static margin(el) {
    TinyHtml._isElement(el, 'margin');
    const {
      marginLeft: left,
      marginRight: right,
      marginTop: top,
      marginBottom: bottom,
    } = TinyHtml.cssFloats(el, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom']);
    const x = left + right;
    const y = top + bottom;

    return { x, y, left, right, top, bottom };
  }

  /**
   * Returns the total margin and individual sides from `margin{Side}` CSS properties.
   *
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) margins, and each side individually.
   */
  margin() {
    return TinyHtml.margin(this.getHtmlElement('margin'));
  }

  /**
   * Returns the total padding and individual sides from `padding{Side}` CSS properties.
   *
   * @param {HTMLElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) paddings, and each side individually.
   */
  static padding(el) {
    TinyHtml._isElement(el, 'padding');
    const {
      paddingLeft: left,
      paddingRight: right,
      paddingTop: top,
      paddingBottom: bottom,
    } = TinyHtml.cssFloats(el, ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']);
    const x = left + right;
    const y = top + bottom;

    return { x, y, left, right, top, bottom };
  }

  /**
   * Returns the total padding and individual sides from `padding{Side}` CSS properties.
   *
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) paddings, and each side individually.
   */
  padding() {
    return TinyHtml.padding(this.getHtmlElement('padding'));
  }

  /////////////////////////////////////////////

  /**
   * Adds one or more CSS class names to the element.
   * @type {(el: HTMLElement, ...tokens: string[]) => void} - One or more class names to add.
   */
  static addClass(el, ...args) {
    TinyHtml._isHtmlElement(el, 'addClass');
    el.classList.add(...args);
  }

  /**
   * Adds one or more CSS class names to the element.
   * @type {(...tokens: string[]) => void} - One or more class names to add.
   */
  addClass(...args) {
    return TinyHtml.addClass(this.getHtmlElement('addClass'), ...args);
  }

  /**
   * Removes one or more CSS class names from the element.
   * @param {HTMLElement} el - Target element.
   * @type {(el: HTMLElement, ...tokens: string[]) => void} - One or more class names to remove.
   */
  static removeClass(el, ...args) {
    TinyHtml._isHtmlElement(el, 'removeClass');
    el.classList.remove(...args);
  }

  /**
   * Removes one or more CSS class names from the element.
   * @type {(...tokens: string[]) => void} - One or more class names to remove.
   */
  removeClass(...args) {
    return TinyHtml.removeClass(this.getHtmlElement('removeClass'), ...args);
  }

  /**
   * Replaces an existing class name with a new one.
   * @param {HTMLElement} el - Target element.
   * @param {string} token - The class name to be replaced.
   * @param {string} newToken - The new class name to apply.
   * @returns {boolean} Whether the replacement was successful.
   * @throws {TypeError} If either argument is not a string.
   */
  static replaceClass(el, token, newToken) {
    TinyHtml._isHtmlElement(el, 'replaceClass');
    if (typeof token !== 'string') throw new TypeError('The "token" parameter must be a string.');
    if (typeof newToken !== 'string')
      throw new TypeError('The "newToken" parameter must be a string.');
    return el.classList.replace(token, newToken);
  }

  /**
   * Replaces an existing class name with a new one.
   * @param {string} token - The class name to be replaced.
   * @param {string} newToken - The new class name to apply.
   * @returns {boolean} Whether the replacement was successful.
   * @throws {TypeError} If either argument is not a string.
   */
  replaceClass(token, newToken) {
    return TinyHtml.replaceClass(this.getHtmlElement('replaceClass'), token, newToken);
  }

  /**
   * Returns the class name at the specified index.
   * @param {HTMLElement} el - Target element.
   * @param {number} index - The index of the class name.
   * @returns {string|null} The class name at the index or null if not found.
   * @throws {TypeError} If the index is not a number.
   */
  static classItem(el, index) {
    TinyHtml._isHtmlElement(el, 'classItem');
    if (typeof index !== 'number') throw new TypeError('The "index" parameter must be a number.');
    return el.classList.item(index);
  }

  /**
   * Returns the class name at the specified index.
   * @param {number} index - The index of the class name.
   * @returns {string|null} The class name at the index or null if not found.
   * @throws {TypeError} If the index is not a number.
   */
  classItem(index) {
    return TinyHtml.classItem(this.getHtmlElement('classItem'), index);
  }

  /**
   * Toggles a class name on the element with an optional force boolean.
   * @param {HTMLElement} el - Target element.
   * @param {string} token - The class name to toggle.
   * @param {boolean} force - If true, adds the class; if false, removes it.
   * @returns {boolean} Whether the class is present after the toggle.
   * @throws {TypeError} If token is not a string or force is not a boolean.
   */
  static toggleClass(el, token, force) {
    TinyHtml._isHtmlElement(el, 'toggleClass');
    if (typeof token !== 'string') throw new TypeError('The "token" parameter must be a string.');
    if (typeof force !== 'boolean') throw new TypeError('The "force" parameter must be a boolean.');
    return el.classList.toggle(token, force);
  }

  /**
   * Toggles a class name on the element with an optional force boolean.
   * @param {string} token - The class name to toggle.
   * @param {boolean} force - If true, adds the class; if false, removes it.
   * @returns {boolean} Whether the class is present after the toggle.
   * @throws {TypeError} If token is not a string or force is not a boolean.
   */
  toggleClass(token, force) {
    return TinyHtml.toggleClass(this.getHtmlElement('toggleClass'), token, force);
  }

  /**
   * Checks if the element contains the given class name.
   * @param {HTMLElement} el - Target element.
   * @param {string} token - The class name to check.
   * @returns {boolean} True if the class is present, false otherwise.
   * @throws {TypeError} If token is not a string.
   */
  static hasClass(el, token) {
    TinyHtml._isHtmlElement(el, 'hasClass');
    if (typeof token !== 'string') throw new TypeError('The "token" parameter must be a string.');
    return el.classList.contains(token);
  }

  /**
   * Checks if the element contains the given class name.
   * @param {string} token - The class name to check.
   * @returns {boolean} True if the class is present, false otherwise.
   * @throws {TypeError} If token is not a string.
   */
  hasClass(token) {
    return TinyHtml.hasClass(this.getHtmlElement('hasClass'), token);
  }

  /**
   * Returns the number of classes applied to the element.
   * @param {HTMLElement} el - Target element.
   * @returns {number} The number of classes.
   */
  static classLength(el) {
    TinyHtml._isHtmlElement(el, 'classLength');
    return el.classList.length;
  }

  /**
   * Returns the number of classes applied to the element.
   * @returns {number} The number of classes.
   */
  classLength() {
    return TinyHtml.classLength(this.getHtmlElement('classLength'));
  }

  /**
   * Returns all class names as an array of strings.
   * @param {HTMLElement} el - Target element.
   * @returns {string[]} An array of class names.
   */
  static classList(el) {
    TinyHtml._isHtmlElement(el, 'classList');
    return el.classList.values().toArray();
  }

  /**
   * Returns all class names as an array of strings.
   * @returns {string[]} An array of class names.
   */
  classList() {
    return TinyHtml.classList(this.getHtmlElement('classList'));
  }

  /////////////////////////////////////////

  /**
   * Returns the tag name of the element.
   * @param {HTMLElement} el - Target element.
   * @returns {string} The tag name in uppercase.
   */
  static tagName(el) {
    TinyHtml._isHtmlElement(el, 'tagName');
    return el.tagName;
  }

  /**
   * Returns the tag name of the element.
   * @returns {string} The tag name in uppercase.
   */
  tagName() {
    return TinyHtml.tagName(this.getHtmlElement('tagName'));
  }

  /**
   * Returns the ID of the element.
   * @param {HTMLElement} el - Target element.
   * @returns {string} The element's ID.
   */
  static id(el) {
    TinyHtml._isHtmlElement(el, 'id');
    return el.id;
  }

  /**
   * Returns the ID of the element.
   * @returns {string} The element's ID.
   */
  id() {
    return TinyHtml.id(this.getHtmlElement('id'));
  }

  /**
   * Returns the text content of the element.
   * @param {HTMLElement} el - Target element.
   * @returns {string|null} The text content or null if none.
   */
  static text(el) {
    TinyHtml._isHtmlElement(el, 'text');
    return el.textContent;
  }

  /**
   * Returns the text content of the element.
   * @returns {string|null} The text content or null if none.
   */
  text() {
    return TinyHtml.text(this.getHtmlElement('text'));
  }

  /** @readonly */
  static _valHooks = {
    option: {
      /**
       * @param {HTMLOptionElement} elem
       * @returns {string|null}
       */
      get: (elem) => {
        const val = elem.getAttribute('value');
        return val != null ? val : elem.textContent;
      },
    },

    select: {
      /**
       * @param {HTMLSelectElement} elem
       * @returns {(string | null)[] | string | null}
       */
      get: (elem) => {
        const options = elem.options;
        const index = elem.selectedIndex;
        const isSingle = elem.type === 'select-one';
        const max = isSingle ? index + 1 : options.length;

        /** @type {(string | null)[] | null} */
        const values = [];
        let i = index < 0 ? max : isSingle ? index : 0;

        for (; i < max; i++) {
          const option = options[i];
          if (
            (option.selected || i === index) &&
            !option.disabled &&
            (!option.parentNode ||
              // @ts-ignore
              !option.parentNode.disabled ||
              // @ts-ignore
              option.parentNode.tagName !== 'OPTGROUP')
          ) {
            const val = TinyHtml._valHooks.option.get(option);
            if (isSingle) return val;
            values.push(val);
          }
        }

        return values;
      },

      /**
       * @param {HTMLSelectElement} elem
       * @param {string[]|string} value
       */
      set: (elem, value) => {
        const options = elem.options;
        const values = Array.isArray(value) ? value.map(String) : [String(value)];
        let optionSet = false;

        for (let i = 0; i < options.length; i++) {
          const option = options[i];
          const optionVal = TinyHtml._valHooks.option.get(option);
          if (typeof optionVal === 'string' && (option.selected = values.includes(optionVal))) {
            optionSet = true;
          }
        }

        if (!optionSet) {
          elem.selectedIndex = -1;
        }

        return values;
      },
    },

    radio: {
      /**
       * @param {HTMLInputElement} elem
       * @returns {string}
       */
      get(elem) {
        return elem.checked ? 'on' : 'off';
      },
      /**
       * @param {HTMLInputElement} elem
       * @param {string[]} value
       */
      set(elem, value) {
        if (typeof value === 'boolean') {
          const label = elem.closest('label');
          if (value && label) {
            const otherRadios = label.querySelectorAll('input[type="radio"]');
            otherRadios.forEach((otherRadio) => {
              if (otherRadio instanceof HTMLInputElement && otherRadio !== elem)
                otherRadio.checked = false;
            });
          }
          elem.checked = value;
          return value;
        }
      },
    },

    checkbox: {
      /**
       * @param {HTMLInputElement} elem
       * @returns {string}
       */
      get(elem) {
        return elem.checked ? 'on' : 'off';
      },
      /**
       * @param {HTMLInputElement} elem
       * @param {boolean} value
       */
      set(elem, value) {
        if (typeof value === 'boolean') {
          elem.checked = value;
          return value;
        }
      },
    },
  };

  /**
   * Sets the value of the current HTML value element (input, select, textarea, etc.).
   * Accepts strings, numbers, booleans or arrays of these values, or a callback function that computes them.
   *
   * @param {HtmlValInputsList} el - Target element.
   * @param {SetValValue|((el: HtmlValInputsList, val: SetValValue) => SetValValue)} value - The value to assign or a function that returns it.
   * @throws {Error} If the computed value is not a valid string or boolean.
   */
  static setVal(el, value) {
    TinyHtml._isValElement(el, 'setVal');

    /**
     * @param {SetValValueBase[]} array
     * @param {(v: SetValValueBase, i: number) => SetValValueBase} callback
     */
    const mapArray = (array, callback) => {
      const result = [];
      for (let i = 0; i < array.length; i++) {
        result.push(callback(array[i], i));
      }
      return result;
    };

    if (el.nodeType !== 1) return;
    /** @type {SetValValue} */
    let valToSet = typeof value === 'function' ? value(el, TinyHtml.val(el)) : value;

    if (valToSet == null) {
      valToSet = '';
    } else if (typeof valToSet === 'number') {
      valToSet = String(valToSet);
    } else if (Array.isArray(valToSet)) {
      valToSet = mapArray(valToSet, (v) => (v == null ? '' : String(v)));
    }

    // @ts-ignore
    const hook = TinyHtml._valHooks[el.type] || TinyHtml._valHooks[el.nodeName.toLowerCase()];
    if (!hook || typeof hook.set !== 'function' || hook.set(el, valToSet, 'value') === undefined) {
      if (typeof valToSet !== 'string' && typeof valToSet !== 'boolean')
        throw new Error(`Invalid setValue "${typeof valToSet}" value.`);
      if (typeof valToSet === 'string') el.value = valToSet;
    }
  }

  /**
   * Sets the value of the current HTML value element (input, select, textarea, etc.).
   * Accepts strings, numbers, booleans or arrays of these values, or a callback function that computes them.
   *
   * @param {SetValValue|((el: HtmlValInputsList, val: SetValValue) => SetValValue)} value - The value to assign or a function that returns it.
   * @throws {Error} If the computed value is not a valid string or boolean.
   */
  setVal(value) {
    return TinyHtml.setVal(this.getValElement('setVal'), value);
  }

  /**
   * Retrieves the raw value from the HTML input element.
   * If a custom value hook exists, it will be used first.
   *
   * @param {HtmlValInputsList} el - Target element.
   * @param {string} where
   * @returns {SetValValue} The raw value retrieved from the element or hook.
   */
  static _val(el, where) {
    TinyHtml._isValElement(el, where);
    // @ts-ignore
    const hook = TinyHtml._valHooks[el.type] || TinyHtml._valHooks[el.nodeName.toLowerCase()];
    if (hook && typeof hook.get === 'function') {
      const ret = hook.get(el, 'value');
      if (ret !== undefined) return typeof ret === 'string' ? ret.replace(/\r/g, '') : ret;
    }

    return el.value;
  }

  /**
   * Retrieves the raw value from the HTML input element.
   * If a custom value hook exists, it will be used first.
   *
   * @param {string} where
   * @returns {SetValValue} The raw value retrieved from the element or hook.
   */
  _val(where) {
    return TinyHtml._val(this.getValElement(where), where);
  }

  /**
   * Gets the value of the current HTML value element.
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {SetValValue} The normalized value, with carriage returns removed.
   */
  static val(el) {
    return TinyHtml._val(el, 'val');
  }

  /**
   * Gets the value of the current HTML value element.
   *
   * @returns {SetValValue} The normalized value, with carriage returns removed.
   */
  val() {
    return TinyHtml.val(this.getValElement('val'));
  }

  /**
   * Gets the text of the current HTML value element (for text).
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {string} The text value.
   * @throws {Error} If the element is not a string value.
   */
  static valTxt(el) {
    const ret = TinyHtml._val(el, 'valTxt');
    if (typeof ret !== 'string' && ret !== null) throw new Error('Value is not a valid string.');
    return ret == null ? '' : typeof ret === 'string' ? ret.replace(/\r/g, '') : ret;
  }

  /**
   * Gets the text of the current HTML value element (for text).
   *
   * @returns {string} The text value.
   * @throws {Error} If the element is not a string value.
   */
  valTxt() {
    return TinyHtml.valTxt(this.getValElement('valTxt'));
  }

  /**
   * Internal helper to get a value from an input expected to return an array.
   *
   * @param {HtmlValInputsList} el - Target element.
   * @param {string} where - The method name or context using this validation (for error reporting).
   * @returns {SetValValueBase[]} - The validated value as an array.
   * @throws {Error} If the returned value is not an array.
   */
  static _valArr(el, where) {
    const ret = TinyHtml._val(el, where);
    if (!Array.isArray(ret)) throw new Error(`Value expected an array but got ${typeof ret}.`);
    return ret;
  }

  /**
   * Internal helper to get a value from an input expected to return an array.
   *
   * @param {string} where - The method name or context using this validation (for error reporting).
   * @returns {SetValValueBase[]} - The validated value as an array.
   * @throws {Error} If the returned value is not an array.
   */
  _valArr(where) {
    return TinyHtml._valArr(this.getValElement(where), where);
  }

  /**
   * Gets the raw value as a generic array of the current HTML value element (for select).
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {SetValValueBase[]} - The value cast as a generic array.
   * @throws {Error} If the value is not a valid array.
   */
  static valArr(el) {
    return TinyHtml._valArr(el, 'valArr');
  }

  /**
   * Gets the raw value as a generic array of the current HTML value element (for select).
   *
   * @returns {SetValValueBase[]} - The value cast as a generic array.
   * @throws {Error} If the value is not a valid array.
   */
  valArr() {
    return TinyHtml.valArr(this.getValElement('valArr'));
  }

  /**
   * Gets the value as an array of strings in the current HTML value element (for select).
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {string[]} - The array of values cast as strings.
   * @throws {Error} If any value in the array is not a string.
   */
  static valArrSt(el) {
    const arr = TinyHtml._valArr(el, 'valArrSt');
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== 'string')
        throw new Error(`The valArrSt() expected string at index ${i}, got ${typeof arr[i]}.`);
    }
    return /** @type {string[]} */ (arr);
  }

  /**
   * Gets the value as an array of strings in the current HTML value element (for select).
   *
   * @returns {string[]} - The array of values cast as strings.
   * @throws {Error} If any value in the array is not a string.
   */
  valArrSt() {
    return TinyHtml.valArrSt(this.getValElement('valArrSt'));
  }

  /**
   * Gets the value as an array of numbers in the current HTML value element (for ???).
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {number[]} - The array of values cast as numbers.
   * @throws {Error} If any value in the array is not a valid number.
   */
  static valArrNb(el) {
    const arr = TinyHtml._valArr(el, 'valArrNb');
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      let val = arr[i];
      if (typeof val !== 'string' && typeof val !== 'number')
        throw new Error(`The valArrNb() expected number at index ${i}, got ${arr[i]}.`);
      if (typeof val === 'string') val = parseFloat(val);
      if (Number.isNaN(val))
        throw new Error(`The valArrNb() expected number at index ${i}, got ${arr[i]}.`);
      result.push(val);
    }
    return result;
  }

  /**
   * Gets the value as an array of numbers in the current HTML value element (for ???).
   *
   * @returns {number[]} - The array of values cast as numbers.
   * @throws {Error} If any value in the array is not a valid number.
   */
  valArrNb() {
    return TinyHtml.valArrNb(this.getValElement('valArrNb'));
  }

  /**
   * Gets the value as an array of booleans in the current HTML value element (for ???).
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {boolean[]} - The array of values cast as booleans.
   * @throws {Error} If any value in the array is not a boolean or castable to one.
   */
  static valArrBool(el) {
    const arr = TinyHtml._valArr(el, 'valArrBool');
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== 'boolean')
        throw new Error(`The valArrBool() expected boolean at index ${i}, got ${typeof arr[i]}.`);
    }
    return /** @type {boolean[]} */ (arr);
  }

  /**
   * Gets the value as an array of booleans in the current HTML value element (for ???).
   *
   * @returns {boolean[]} - The array of values cast as booleans.
   * @throws {Error} If any value in the array is not a boolean or castable to one.
   */
  valArrBool() {
    return TinyHtml.valArrBool(this.getValElement('valArrBool'));
  }

  /**
   * Gets the current value parsed as a number (for number/text).
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {number} The numeric value.
   * @throws {Error} If the element is not a number-compatible input or value is NaN.
   */
  static valNb(el) {
    TinyHtml._isValElement(el, 'valNb');
    if (!(el instanceof HTMLInputElement)) throw new Error('Element must be an input element.');
    const result = parseFloat(TinyHtml.valTxt(el).trim() || '0');
    if (Number.isNaN(result)) throw new Error('Value is not a valid number.');
    return result;
  }

  /**
   * Gets the current value parsed as a number (for number/text).
   *
   * @returns {number} The numeric value.
   * @throws {Error} If the element is not a number-compatible input or value is NaN.
   */
  valNb() {
    return TinyHtml.valNb(this.getValElement('valNb'));
  }

  /**
   * Checks if the input element is boolean (for checkboxes/radios).
   *
   * @param {HtmlValInputsList} el - Target element.
   * @returns {boolean} True if the input is considered checked (value === "on"), false otherwise.
   * @throws {Error} If the element is not a checkbox/radio input.
   */
  static valBool(el) {
    TinyHtml._isValElement(el, 'valBool');
    if (!(el instanceof HTMLInputElement)) throw new Error('Element must be an input element.');
    return TinyHtml.val(el) === 'on' ? true : false;
  }

  /**
   * Checks if the input element is boolean (for checkboxes/radios).
   *
   * @returns {boolean} True if the input is considered checked (value === "on"), false otherwise.
   * @throws {Error} If the element is not a checkbox/radio input.
   */
  valBool() {
    return TinyHtml.valBool(this.getValElement('valBool'));
  }

  ////////////////////////////////////////////

  /**
   * Registers an event listener on the specified element.
   *
   * @param {HTMLElement|Window|Document} el - The target to listen on.
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options] - Optional event listener options.
   */
  static on(el, event, handler, options) {
    TinyHtml._isElement(el, 'on', true, true);
    el.addEventListener(event, handler, options);

    if (!__eventRegistry.has(el)) __eventRegistry.set(el, {});
    const events = __eventRegistry.get(el);
    if (!events) return;
    if (!Array.isArray(events[event])) events[event] = [];
    events[event].push({ handler, options });
  }

  /**
   * Registers an event listener on the specified element.
   *
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options] - Optional event listener options.
   */
  on(event, handler, options) {
    return TinyHtml.on(this.#el, event, handler, options);
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {HTMLElement|Window|Document} el - The target to listen on.
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options={}] - Optional event listener options.
   */
  static once(el, event, handler, options = {}) {
    TinyHtml._isElement(el, 'once', true, true);
    /** @type {EventRegistryHandle} e */
    const wrapped = (e) => {
      TinyHtml.off(el, event, wrapped);
      handler(e);
    };

    TinyHtml.on(
      el,
      event,
      wrapped,
      typeof options === 'boolean' ? options : { ...options, once: true },
    );
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options={}] - Optional event listener options.
   */
  once(event, handler, options = {}) {
    return TinyHtml.once(this.#el, event, handler, options);
  }

  /**
   * Removes a specific event listener from an element.
   *
   * @param {HTMLElement|Window|Document} el - The target element.
   * @param {string} event - The event type.
   * @param {EventRegistryHandle} handler - The function originally bound to the event.
   * @param {boolean|EventListenerOptions} [options] - Optional listener options.
   */
  static off(el, event, handler, options) {
    TinyHtml._isElement(el, 'off', true, true);
    el.removeEventListener(event, handler, options);

    const events = __eventRegistry.get(el);
    if (events && events[event]) {
      events[event] = events[event].filter((entry) => entry.handler !== handler);
      if (events[event].length === 0) delete events[event];
    }
  }

  /**
   * Removes a specific event listener from an element.
   *
   * @param {string} event - The event type.
   * @param {EventRegistryHandle} handler - The function originally bound to the event.
   * @param {boolean|EventListenerOptions} [options] - Optional listener options.
   */
  off(event, handler, options) {
    return TinyHtml.off(this.#el, event, handler, options);
  }

  /**
   * Removes all event listeners of a specific type from the element.
   *
   * @param {HTMLElement|Window|Document} el - The target element.
   * @param {string} event - The event type to remove (e.g. 'click').
   */
  static offAll(el, event) {
    TinyHtml._isElement(el, 'offAll', true, true);
    const events = __eventRegistry.get(el);
    if (events && events[event]) {
      for (const entry of events[event]) {
        el.removeEventListener(event, entry.handler, entry.options);
      }
      delete events[event];
    }
  }

  /**
   * Removes all event listeners of a specific type from the element.
   *
   * @param {string} event - The event type to remove (e.g. 'click').
   */
  offAll(event) {
    return TinyHtml.offAll(this.#el, event);
  }

  /**
   * Removes all event listeners of all types from the element.
   *
   * @param {HTMLElement|Window|Document} el - The target element.
   * @param {((handler: EventListenerOrEventListenerObject, event: string) => boolean)|null} [filterFn=null] -
   *        Optional filter function to selectively remove specific handlers.
   */
  static offAllTypes(el, filterFn = null) {
    TinyHtml._isElement(el, 'offAllTypes', true, true);
    const events = __eventRegistry.get(el);
    if (!events) return;

    for (const event in events) {
      for (const entry of events[event]) {
        if (typeof filterFn !== 'function' || filterFn(entry.handler, event)) {
          el.removeEventListener(event, entry.handler, entry.options);
        }
      }
    }

    __eventRegistry.delete(el);
  }

  /**
   * Removes all event listeners of all types from the element.
   *
   * @param {((handler: EventListenerOrEventListenerObject, event: string) => boolean)|null} [filterFn=null] -
   *        Optional filter function to selectively remove specific handlers.
   */
  offAllTypes(filterFn = null) {
    return TinyHtml.offAllTypes(this.#el, filterFn);
  }

  /**
   * Triggers all handlers associated with a specific event on the given element.
   *
   * @param {ConstructorElValues} el - Target element where the event should be triggered.
   * @param {string} event - Name of the event to trigger.
   * @param {Event|CustomEvent|Object} [payload] - Optional event object or data to pass.
   */
  static trigger(el, event, payload = {}) {
    if (!(el instanceof EventTarget))
      throw new TypeError('[TinyHtml.trigger] Target is not an EventTarget.');

    const evt =
      payload instanceof Event
        ? payload
        : new CustomEvent(event, {
            bubbles: true,
            cancelable: true,
            detail: payload,
          });

    el.dispatchEvent(evt);
  }

  /**
   * Triggers all handlers associated with a specific event on the given element.
   *
   * @param {string} event - Name of the event to trigger.
   * @param {Event|CustomEvent|Object} [payload] - Optional event object or data to pass.
   */
  trigger(event, payload = {}) {
    return TinyHtml.trigger(this.#el, event, payload);
  }

  ///////////////////////////////////////////////////////////////

  /**
   * Property name normalization similar to jQuery's propFix.
   */
  static _propFix = {
    for: 'htmlFor',
    class: 'className',
  };

  /**
   * Get an attribute on an element.
   * @param {HTMLElement} el
   * @param {string} name
   * @returns {string|null}
   */
  static attr(el, name) {
    TinyHtml._isHtmlElement(el, 'attr');
    return el.getAttribute(name);
  }

  /**
   * Get an attribute on an element.
   * @param {string} name
   * @returns {string|null}
   */
  attr(name) {
    return TinyHtml.attr(this.getHtmlElement('attr'), name);
  }

  /**
   * Set an attribute on an element.
   * @param {HTMLElement} el
   * @param {string} name
   * @param {string|null} [value=null]
   */
  static setAttr(el, name, value = null) {
    TinyHtml._isHtmlElement(el, 'setAttr');
    if (value === null) el.removeAttribute(name);
    else el.setAttribute(name, value);
  }

  /**
   * Set an attribute on an element.
   * @param {string} name
   * @param {string|null} [value=null]
   */
  setAttr(name, value) {
    return TinyHtml.setAttr(this.getHtmlElement('setAttr'), name, value);
  }

  /**
   * Remove attribute(s) from an element.
   * @param {HTMLElement} el
   * @param {string} name Space-separated list of attributes.
   */
  static removeAttr(el, name) {
    TinyHtml._isHtmlElement(el, 'removeAttr');
    el.removeAttribute(name);
  }

  /**
   * Remove attribute(s) from an element.
   * @param {string} name Space-separated list of attributes.
   */
  removeAttr(name) {
    return TinyHtml.removeAttr(this.getHtmlElement('removeAttr'), name);
  }

  /**
   * Check if an attribute exists on an element.
   * @param {HTMLElement} el
   * @param {string} name
   * @returns {boolean}
   */
  static hasAttr(el, name) {
    TinyHtml._isHtmlElement(el, 'hasAttr');
    return el.hasAttribute(name);
  }

  /**
   * Check if an attribute exists on an element.
   * @param {string} name
   * @returns {boolean}
   */
  hasAttr(name) {
    return TinyHtml.hasAttr(this.getHtmlElement('hasAttr'), name);
  }

  /**
   * Check if a property exists.
   * @param {HTMLElement} el
   * @param {string} name
   * @returns {boolean}
   */
  static hasProp(el, name) {
    TinyHtml._isHtmlElement(el, 'hasProp');
    // @ts-ignore
    const propName = TinyHtml._propFix[name] || name;
    // @ts-ignore
    return !!el[propName];
  }

  /**
   * Check if a property exists.
   * @param {string} name
   * @returns {boolean}
   */
  hasProp(name) {
    return TinyHtml.hasProp(this.getHtmlElement('hasProp'), name);
  }

  /**
   * Set a property on an element.
   * @param {HTMLElement} el
   * @param {string} name
   */
  static addProp(el, name) {
    TinyHtml._isHtmlElement(el, 'addProp');
    // @ts-ignore
    name = TinyHtml._propFix[name] || name;
    // @ts-ignore
    el[name] = true;
  }

  /**
   * Set a property on an element.
   * @param {string} name
   */
  addProp(name) {
    return TinyHtml.addProp(this.getHtmlElement('addProp'), name);
  }

  /**
   * Remove a property from an element.
   * @param {HTMLElement} el
   * @param {string} name
   */
  static removeProp(el, name) {
    TinyHtml._isHtmlElement(el, 'removeProp');
    // @ts-ignore
    name = TinyHtml._propFix[name] || name;
    // @ts-ignore
    el[name] = false;
  }

  /**
   * Remove a property from an element.
   * @param {string} name
   */
  removeProp(name) {
    return TinyHtml.removeProp(this.getHtmlElement('removeProp'), name);
  }

  /**
   * Toggle a boolean property.
   * @param {HTMLElement} el
   * @param {string} name
   * @param {boolean} [force]
   */
  static toggleProp(el, name, force) {
    TinyHtml._isHtmlElement(el, 'toggleProp');
    // @ts-ignore
    const propName = TinyHtml._propFix[name] || name;
    // @ts-ignore
    const shouldEnable = force === undefined ? !el[propName] : force;
    // @ts-ignore
    if (shouldEnable) TinyHtml.addProp(el, name);
    else TinyHtml.removeProp(el, name);
  }

  /**
   * Toggle a boolean property.
   * @param {string} name
   * @param {boolean} [force]
   */
  toggleProp(name, force) {
    return TinyHtml.toggleProp(this.getHtmlElement('toggleProp'), name, force);
  }
}

export default TinyHtml;
