/**
 * Represents a raw DOM element or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {Element|TinyHtml} TinyElement
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
 * @typedef {string|Element|Element[]|((index: number, el: Element) => boolean)} WinnowRequest
 */

/**
 * Elements accepted as constructor values for TinyHtml.
 * These include common DOM elements and root containers.
 *
 * @typedef {Window|Element|Document} ConstructorElValues
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
   * Queries the document for the first element matching the CSS selector and wraps it in a TinyHtml instance.
   *
   * @param {string} selector - A valid CSS selector string.
   * @returns {TinyHtml} A TinyHtml instance wrapping the matched element.
   * @throws {Error} If no element matches the selector.
   */
  static query(selector) {
    const newEl = document.querySelector(selector);
    if (!newEl) throw new Error(`[TinyHtml] query(): No element found for selector "${selector}".`);
    return new TinyHtml(newEl);
  }

  /**
   * Queries the document for all elements matching the CSS selector and wraps them in TinyHtml instances.
   *
   * @param {string} selector - A valid CSS selector string.
   * @returns {TinyHtml[]} An array of TinyHtml instances wrapping the matched elements.
   */
  static queryAll(selector) {
    const newEls = document.querySelectorAll(selector);
    return TinyHtml.toTinyElm([...newEls]);
  }

  /**
   * Retrieves an element by its ID and wraps it in a TinyHtml instance.
   *
   * @param {string} selector - The ID of the element to retrieve.
   * @returns {TinyHtml} A TinyHtml instance wrapping the found element.
   * @throws {Error} If no element is found with the specified ID.
   */
  static getById(selector) {
    const newEl = document.getElementById(selector);
    if (!newEl) throw new Error(`[TinyHtml] getById(): No element found with ID "${selector}".`);
    return new TinyHtml(newEl);
  }

  /**
   * Retrieves all elements with the specified class name and wraps them in TinyHtml instances.
   *
   * @param {string} selector - The class name to search for.
   * @returns {TinyHtml[]} An array of TinyHtml instances wrapping the found elements.
   */
  static getByClassName(selector) {
    const newEls = document.getElementsByClassName(selector);
    return TinyHtml.toTinyElm([...newEls]);
  }

  /**
   * Retrieves all elements with the specified name attribute and wraps them in TinyHtml instances.
   *
   * @param {string} selector - The name attribute to search for.
   * @returns {TinyHtml[]} An array of TinyHtml instances wrapping the found elements.
   */
  static getByName(selector) {
    const newEls = document.getElementsByName(selector);
    return TinyHtml.toTinyElm([...newEls]);
  }

  /**
   * Retrieves all elements with the specified local tag name within the given namespace URI,
   * and wraps them in TinyHtml instances.
   *
   * @param {string} localName - The local name (tag) of the elements to search for.
   * @param {string|null} [namespaceURI='http://www.w3.org/1999/xhtml'] - The namespace URI to search within.
   * @returns {TinyHtml[]} An array of TinyHtml instances wrapping the found elements.
   */
  static getByTagNameNS(localName, namespaceURI = 'http://www.w3.org/1999/xhtml') {
    const newEls = document.getElementsByTagNameNS(namespaceURI, localName);
    return TinyHtml.toTinyElm([...newEls]);
  }

  //////////////////////////////////////////////////////////////////

  /**
   * Validates whether the given object is an Element or optionally a Window.
   * Used internally for argument safety checks.
   *
   * @param {*} el - The object to test.
   * @param {string} where - The context/method name using this validation.
   * @param {boolean} [needsWindow=false] - If true, allows Window objects as valid.
   * @param {boolean} [canDocument=false] - If true, allows Document objects as valid.
   * @throws {TypeError} If `where` is not a string or `needsWindow` is not a boolean.
   * @readonly
   */
  static _isValidElem(el, where, needsWindow = false, canDocument = false) {
    if (typeof where !== 'string')
      throw new TypeError('[TinyHtml] "where" in _isValidElem() must be a string.');
    if (typeof needsWindow !== 'boolean')
      throw new TypeError('[TinyHtml] "needsWindow" in _isValidElem() must be a boolean.');
    if (
      !(el instanceof Element) &&
      (!needsWindow || !(el instanceof Window)) &&
      ((!canDocument && el instanceof Document) || (canDocument && !(el instanceof Document)))
    )
      throw new Error(`[TinyHtml] Invalid Element in ${where}().`);
  }

  /**
   * Validates whether the given object is an Element or optionally a Window.
   * Used internally for argument safety checks.
   *
   * @param {string} where - The context/method name using this validation.
   * @param {boolean} [needsWindow=false] - If true, allows Window objects as valid.
   * @param {boolean} [canDocument=false] - If true, allows Document objects as valid.
   * @throws {TypeError} If `where` is not a string or `needsWindow` is not a boolean.
   * @readonly
   */
  _isValidElem(where, needsWindow, canDocument) {
    return TinyHtml._isValidElem(this.#el, where, needsWindow, canDocument);
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
      throw new TypeError('[TinyHtml] "where" in _isDocument() must be a string.');
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
   * Validates whether the given object is an Element.
   * Used internally for argument safety checks.
   *
   * @param {*} el - The object to test.
   * @param {string} where - The context/method name using this validation.
   * @throws {TypeError} If `where` is not a string.
   * @readonly
   */
  static _isElement(el, where) {
    if (typeof where !== 'string')
      throw new TypeError('[TinyHtml] "where" in _isElement() must be a string.');
    if (!(el instanceof Element)) throw new Error(`[TinyHtml] Invalid Element in ${where}().`);
  }

  /**
   * Validates whether the given object is an Element.
   * Used internally for argument safety checks.
   *
   * @param {string} where - The context/method name using this validation.
   * @throws {TypeError} If `where` is not a string.
   * @readonly
   */
  _isElement(where) {
    return TinyHtml._isElement(this.#el, where);
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
      throw new TypeError('[TinyHtml] "where" in _isHtmlElement() must be a string.');
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
      throw new TypeError('[TinyHtml] "where" in _isValElement() must be a string.');
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
   * Returns the current target held by this instance.
   *
   * @returns {Element|Window} - The instance's target element.
   */
  getTarget() {
    if (this.#el instanceof Document)
      throw new Error(`[TinyHtml] "getTarget" must be a Element or Window.`);
    return this.#el;
  }

  /**
   * Returns the current element held by this instance.
   *
   * @param {string} where - The method name or context calling this.
   * @returns {Element} - The instance's element.
   */
  getElement(where) {
    if (!(this.#el instanceof Element))
      throw new Error(`[TinyHtml] Invalid Element in ${where}().`);
    return this.#el;
  }

  //////////////////////////////////////////////////////

  /**
   * @param {TinyElement|TinyElement[]} elems
   * @param {string} where
   * @param {any} TheTinyElement
   * @param {string} elemName
   * @returns {Element[]}
   * @readonly
   */
  static _preElemsTemplate(elems, where, TheTinyElement, elemName) {
    /** @param {TinyElement[]} item */
    const checkElement = (item) =>
      item.map((elem) => {
        const result = elem instanceof TinyHtml ? elem.getElement(where) : elem;
        if (!(result instanceof TheTinyElement))
          throw new Error(`[TinyHtml] Invalid ${elemName} in ${where}().`);
        return result;
      });
    if (!Array.isArray(elems)) return checkElement([elems]);
    return checkElement(elems);
  }

  /**
   * @param {TinyElement|TinyElement[]} elems
   * @param {string} where
   * @param {any} TheTinyElement
   * @param {string} elemName
   * @returns {Element | null}
   * @readonly
   */
  static _preElemTemplate(elems, where, TheTinyElement, elemName) {
    /** @param {TinyElement[]} item */
    const checkElement = (item) =>
      item.map((elem) => {
        const result = elem instanceof TinyHtml ? elem.getElement(where) : elem;
        if (!(result instanceof TheTinyElement))
          throw new Error(`[TinyHtml] Invalid ${elemName} in ${where}().`);
        return result;
      })[0] || null;
    if (!Array.isArray(elems)) return checkElement([elems]);
    return checkElement(elems);
  }

  /**
   * Ensures the input is returned as an array.
   * Useful to normalize operations across multiple or single elements.
   *
   * @param {TinyElement|TinyElement[]} elems - A single element or array of elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {Element[]} - Always returns an array of elements.
   * @readonly
   */
  static _preElems(elems, where) {
    return TinyHtml._preElemsTemplate(elems, where, Element, 'Element');
  }

  /**
   * Ensures the input is returned as an single element.
   * Useful to normalize operations across multiple or single elements.
   *
   * @param {TinyElement|TinyElement[]} elems - A single element or array of elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {Element | null} - Always returns an array of elements.
   * @readonly
   */
  static _preElem(elems, where) {
    return TinyHtml._preElemTemplate(elems, where, Element, 'Element');
  }

  /**
   * Normalizes and converts one or more DOM elements (or TinyHtml instances)
   * into an array of `TinyHtml` instances.
   *
   * - If a plain DOM element is passed, it is wrapped into a `TinyHtml` instance.
   * - If a `TinyHtml` instance is already passed, it is preserved.
   * - If an array is passed, all elements inside are converted accordingly.
   *
   * This ensures consistent access to methods of the `TinyHtml` class regardless
   * of the input form.
   *
   * @param {TinyElement|TinyElement[]} elems - A single element or an array of elements (DOM or TinyHtml).
   * @returns {TinyHtml[]} An array of TinyHtml instances corresponding to the input elements.
   */
  static toTinyElm(elems) {
    /** @param {TinyElement[]} item */
    const checkElement = (item) =>
      item.map((elem) => (!(elem instanceof TinyHtml) ? new TinyHtml(elem) : elem));
    if (!Array.isArray(elems)) return checkElement([elems]);
    return checkElement(elems);
  }

  /**
   * Extracts native `Element` instances from one or more elements,
   * which can be either raw DOM elements or wrapped in `TinyHtml`.
   *
   * - If a `TinyHtml` instance is passed, its internal DOM element is extracted.
   * - If a raw DOM element is passed, it is returned as-is.
   * - If an array is passed, each element is processed accordingly.
   *
   * This function guarantees that the return value is always an array of
   * raw `Element` objects, regardless of whether the input was
   * a mix of `TinyHtml` or native DOM elements.
   *
   * @param {TinyElement|TinyElement[]} elems - A single element or an array of elements (DOM or TinyHtml`).
   * @returns {Element[]} An array of Element instances extracted from the input.
   */
  static fromTinyElm(elems) {
    /** @param {TinyElement[]} item */
    const checkElement = (item) =>
      item.map(
        (elem) =>
          /** @type {Element} */ (elem instanceof TinyHtml ? elem.getElement('fromTinyElm') : elem),
      );
    if (!Array.isArray(elems)) return checkElement([elems]);
    return checkElement(elems);
  }

  /**
   * Filters an array of elements based on a selector, function, element, or array of elements.
   *
   * @param {TinyElement|TinyElement[]} elems
   * @param {WinnowRequest} qualifier
   * @param {string} where - The context/method name using this validation.
   * @param {boolean} not Whether to invert the result (used for .not())
   * @returns {Element[]}
   */
  static winnow(elems, qualifier, where, not = false) {
    if (typeof qualifier === 'function') {
      return TinyHtml._preElems(elems, where).filter(
        (el, i) => !!qualifier.call(el, i, el) !== not,
      );
    }

    if (qualifier instanceof Element) {
      return TinyHtml._preElems(elems, where).filter((el) => (el === qualifier) !== not);
    }

    if (
      Array.isArray(qualifier) ||
      (typeof qualifier !== 'string' &&
        // @ts-ignore
        qualifier.length != null)
    ) {
      return TinyHtml._preElems(elems, where).filter((el) => qualifier.includes(el) !== not);
    }

    // Assume it's a selector string
    let selector = qualifier;
    if (not) selector = `:not(${selector})`;
    return TinyHtml._preElems(elems, where).filter(
      (el) => el.nodeType === 1 && el.matches(selector),
    );
  }

  /**
   * Filters a set of elements by a CSS selector.
   *
   * @param {TinyElement|TinyElement[]} elems
   * @param {string} selector
   * @param {boolean} not
   * @returns {Element[]}
   */
  static filter(elems, selector, not = false) {
    if (not) selector = `:not(${selector})`;
    return TinyHtml._preElems(elems, 'filter').filter(
      (el) => el.nodeType === 1 && el.matches(selector),
    );
  }

  /**
   * Returns only the elements matching the given selector or function.
   *
   * @param {TinyElement|TinyElement[]} elems
   * @param {WinnowRequest} selector
   * @returns {Element[]}
   */
  static filterOnly(elems, selector) {
    return TinyHtml.winnow(elems, selector, 'filterOnly', false);
  }

  /**
   * Returns only the elements **not** matching the given selector or function.
   *
   * @param {TinyElement|TinyElement[]} elems
   * @param {WinnowRequest} selector
   * @returns {Element[]}
   */
  static not(elems, selector) {
    return TinyHtml.winnow(elems, selector, 'not', true);
  }

  /**
   * Returns only the elements **not** matching the given selector or function.
   *
   * @param {WinnowRequest} selector
   * @returns {Element[]}
   */
  not(selector) {
    return TinyHtml.not(this.getElement('not'), selector);
  }

  /**
   * Finds elements matching a selector within a context.
   *
   * @param {TinyElement|TinyElement[]} context
   * @param {string} selector
   * @returns {Element[]}
   */
  static find(context, selector) {
    const result = [];
    for (const el of TinyHtml._preElems(context, 'find')) {
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
    return TinyHtml.find(this.getElement('find'), selector);
  }

  /**
   * Checks if at least one element matches the selector.
   *
   * @param {TinyElement|TinyElement[]} elems
   * @param {WinnowRequest} selector
   * @returns {boolean}
   */
  static is(elems, selector) {
    return TinyHtml.winnow(elems, selector, 'is', false).length > 0;
  }

  /**
   * Checks if the element matches the selector.
   *
   * @param {WinnowRequest} selector
   * @returns {boolean}
   */
  is(selector) {
    return TinyHtml.is(this.getElement('is'), selector);
  }

  /**
   * Returns elements from the current list that contain the given target(s).
   * @param {TinyElement|TinyElement[]} roots - A single element or an array of elements (DOM or TinyHtml).
   * @param {string|TinyElement|TinyElement[]} target - Selector or DOM element(s).
   * @returns {Element[]} Elements that contain the target.
   */
  static has(roots, target) {
    const targets =
      typeof target === 'string'
        ? [...document.querySelectorAll(target)]
        : TinyHtml._preElems(target, 'has');

    return TinyHtml._preElems(roots, 'has').filter((root) =>
      targets.some((t) => root && root.contains(t)),
    );
  }

  /**
   * Return if the element has the target(s).
   * @param {string|TinyElement|TinyElement[]} target - Selector or DOM element(s).
   * @returns {boolean} Elements that contain the target.
   */
  has(target) {
    return TinyHtml.has(this.getElement('has'), target).length > 0;
  }

  /**
   * Finds the closest ancestor (including self) that matches the selector.
   *
   * @param {TinyElement|TinyElement[]} els - A single element or an array of elements (DOM or TinyHtml).
   * @param {string|Element} selector - A selector string or DOM element to match.
   * @param {Element|null} [context] - An optional context to stop searching.
   * @returns {Element[]}
   */
  static closest(els, selector, context) {
    const matched = [];

    for (const el of TinyHtml._preElems(els, 'closest')) {
      /** @type {Element | null} */
      let current = el;
      const cont = TinyHtml;
      while (current && current !== context) {
        if (
          current.nodeType === 1 &&
          (typeof selector === 'string' ? current.matches(selector) : current === selector)
        ) {
          matched.push(current);
          break;
        }
        current = current.parentElement;
      }
    }

    return [...new Set(matched)];
  }

  /**
   * Finds the closest ancestor (including self) that matches the selector.
   *
   * @param {string|Element} selector - A selector string or DOM element to match.
   * @param {Element|null} [context] - An optional context to stop searching.
   * @returns {Element[]}
   */
  closest(selector, context) {
    return TinyHtml.closest(this.getElement('closest'), selector, context);
  }

  /**
   * Compares two DOM elements to determine if they refer to the same node in the document.
   *
   * This performs a strict equality check (`===`) between the two elements.
   *
   * @param {Element} elem - The first DOM element to compare.
   * @param {Element} otherElem - The second DOM element to compare.
   * @returns {boolean} `true` if both elements are the same DOM node; otherwise, `false`.
   */
  static isSameDom(elem, otherElem) {
    return elem === otherElem;
  }

  /**
   * Compares two DOM elements to determine if they refer to the same node in the document.
   *
   * This performs a strict equality check (`===`) between the two elements.
   *
   * @param {Element} elem - The DOM element to compare.
   * @returns {boolean} `true` if both elements are the same DOM node; otherwise, `false`.
   */
  isSameDom(elem) {
    return TinyHtml.isSameDom(this.getElement('isSameDom'), elem);
  }

  //////////////////////////////////////////////////////

  /**
   * Get the sibling element in a given direction.
   *
   * @param {TinyElement} el
   * @param {"previousSibling"|"nextSibling"} direction
   * @returns {Element|null}
   */
  static getSibling(el, direction) {
    /** @type {Node|null} */
    let newCurrent = TinyHtml._preElem(el, 'getSibling');
    while (newCurrent && (newCurrent = newCurrent[direction]) && newCurrent.nodeType !== 1) {}
    if (!(newCurrent instanceof Element)) return null;
    return newCurrent;
  }

  /**
   * Traverse DOM in a direction collecting elements.
   *
   * @param {TinyElement} el
   * @param {"parentNode"|"nextSibling"|"previousSibling"} direction
   * @param {TinyElement|string} [until]
   * @returns {Element[]}
   */
  static domDir(el, direction, until) {
    /** @type {Element | null} */
    let elem = TinyHtml._preElem(el, 'domDir');
    const matched = [];
    while (elem && (elem = elem[direction] instanceof Element ? elem[direction] : null)) {
      if (elem.nodeType !== 1) continue;
      if (until && (typeof until === 'string' ? elem.matches(until) : elem === until)) break;
      matched.push(elem);
    }
    return matched;
  }

  /**
   * Get all sibling elements excluding the given one.
   *
   * @param {Node|ChildNode|null} start
   * @param {TinyElement} [exclude]
   * @returns {Node[]}
   */
  static getSiblings(start, exclude) {
    let st = start;
    const siblings = [];
    for (; st; st = st.nextSibling) {
      if (st.nodeType === 1 && start !== exclude) {
        siblings.push(st);
      }
    }
    return siblings;
  }

  /**
   * @param {TinyElement} el
   */
  static parent(el) {
    /** @type {Element | null} */
    let elem = TinyHtml._preElem(el, 'parent');
    const parent = elem ? elem.parentNode : null;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * @param {TinyElement} el
   */
  static parents(el) {
    return TinyHtml.domDir(el, 'parentNode');
  }

  /**
   * @param {TinyElement} el
   * @param {TinyElement|string} [until]
   */
  static parentsUntil(el, until) {
    return TinyHtml.domDir(el, 'parentNode', until);
  }

  /**
   * @param {TinyElement} el
   */
  static next(el) {
    return TinyHtml.getSibling(el, 'nextSibling');
  }

  /**
   * @param {TinyElement} el
   */
  static prev(el) {
    return TinyHtml.getSibling(el, 'previousSibling');
  }

  /**
   * @param {TinyElement} el
   */
  static nextAll(el) {
    return TinyHtml.domDir(el, 'nextSibling');
  }

  /**
   * @param {TinyElement} el
   */
  static prevAll(el) {
    return TinyHtml.domDir(el, 'previousSibling');
  }

  /**
   * @param {TinyElement} el
   * @param {TinyElement|string} [until]
   */
  static nextUntil(el, until) {
    return TinyHtml.domDir(el, 'nextSibling', until);
  }

  /**
   * @param {TinyElement} el
   * @param {TinyElement|string} [until]
   */
  static prevUntil(el, until) {
    return TinyHtml.domDir(el, 'previousSibling', until);
  }

  /**
   * @param {TinyElement} el
   */
  static siblings(el) {
    const elem = TinyHtml._preElem(el, 'siblings');
    return TinyHtml.getSiblings(
      elem && elem.parentNode ? elem.parentNode.firstChild : null,
      elem instanceof Element ? elem : undefined,
    );
  }

  /**
   * @param {TinyElement} el
   */
  static children(el) {
    const elem = TinyHtml._preElem(el, 'children');
    return TinyHtml.getSiblings(elem ? elem.firstChild : null);
  }

  /**
   * @param {TinyElement} el
   * @returns {ChildNode[]|Document}
   */
  static contents(el) {
    const elem = TinyHtml._preElem(el, 'contents');
    if (
      elem instanceof HTMLIFrameElement &&
      elem.contentDocument != null &&
      Object.getPrototypeOf(elem.contentDocument)
    ) {
      return elem.contentDocument;
    }

    if (elem instanceof HTMLTemplateElement) {
      return Array.from((elem.content || elem).childNodes);
    }

    if (elem) return Array.from(elem.childNodes);
    return [];
  }

  //////////////////////////////////////////////////////

  /**
   * The target HTML element for instance-level operations.
   * @type {ConstructorElValues}
   */
  #el;

  /**
   * Creates an instance of TinyHtml for a specific Element.
   * Useful when you want to operate repeatedly on the same element using instance methods.
   * @param {ConstructorElValues} el - The element to wrap and manipulate.
   */
  constructor(el) {
    if (!(el instanceof Element) && !(el instanceof Window) && !(el instanceof Document))
      throw new Error(`[TinyHtml] Invalid Target in constructor.`);
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
   * @param {Element} el - The element to inspect.
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
    return TinyHtml.cssFloat(this.getElement('cssFloat'), prop);
  }

  /**
   * Returns computed float values of multiple CSS properties.
   * @param {Element} el - The element to inspect.
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
    return TinyHtml.cssFloats(this.getElement('cssFloats'), prop);
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
   * @param {Element|Window} el - The element or window.
   * @param {"width"|"height"} type - Dimension type.
   * @param {"content"|"padding"|"border"|"margin"} [extra='content'] - Box model context.
   * @returns {number} - Computed dimension.
   * @throws {TypeError} If `type` or `extra` is not a string.
   */
  static getDimension(el, type, extra = 'content') {
    TinyHtml._isValidElem(el, 'getDimension', true);
    if (typeof type !== 'string') throw new TypeError('The type must be a string.');
    if (typeof extra !== 'string') throw new TypeError('The extra must be a string.');

    const name = type === 'width' ? 'Width' : 'Height';

    if (TinyHtml.isWindow(el)) {
      // @ts-ignore
      return extra === 'margin' ? el['inner' + name] : el.document.documentElement['client' + name];
    }
    /** @type {Element} */
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
    return TinyHtml.getDimension(this.getElement('getDimension'), type, extra);
  }

  /**
   * Sets the height of the element.
   * @param {HTMLElement} el - Target element.
   * @param {string|number} value - Height value.
   * @throws {TypeError} If `value` is neither a string nor number.
   */
  static setHeight(el, value) {
    TinyHtml._isHtmlElement(el, 'setHeight');
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
    TinyHtml._isHtmlElement(el, 'setWidth');
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
   * @param {Element|Window} el - Target element.
   * @returns {number}
   */
  static height(el) {
    TinyHtml._isValidElem(el, 'height', true);
    return TinyHtml.getDimension(el, 'height', 'content');
  }

  /**
   * Returns content box height.
   * @returns {number}
   */
  height() {
    return TinyHtml.height(this.getTarget());
  }

  /**
   * Returns content box width.
   * @param {Element|Window} el - Target element.
   * @returns {number}
   */
  static width(el) {
    TinyHtml._isValidElem(el, 'width', true);
    return TinyHtml.getDimension(el, 'width', 'content');
  }

  /**
   * Returns content box width.
   * @returns {number}
   */
  width() {
    return TinyHtml.width(this.getTarget());
  }

  /**
   * Returns padding box height.
   * @param {Element|Window} el - Target element.
   * @returns {number}
   */
  static innerHeight(el) {
    TinyHtml._isValidElem(el, 'innerHeight', true);
    return TinyHtml.getDimension(el, 'height', 'padding');
  }

  /**
   * Returns padding box height.
   * @returns {number}
   */
  innerHeight() {
    return TinyHtml.innerHeight(this.getTarget());
  }

  /**
   * Returns padding box width.
   * @param {Element|Window} el - Target element.
   * @returns {number}
   */
  static innerWidth(el) {
    TinyHtml._isValidElem(el, 'innerWidth', true);
    return TinyHtml.getDimension(el, 'width', 'padding');
  }

  /**
   * Returns padding box width.
   * @returns {number}
   */
  innerWidth() {
    return TinyHtml.innerWidth(this.getTarget());
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {Element|Window} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerHeight(el, includeMargin = false) {
    TinyHtml._isValidElem(el, 'outerHeight', true);
    return TinyHtml.getDimension(el, 'height', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerHeight(includeMargin) {
    return TinyHtml.outerHeight(this.getTarget(), includeMargin);
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {Element|Window} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerWidth(el, includeMargin = false) {
    TinyHtml._isValidElem(el, 'outerWidth', true);
    return TinyHtml.getDimension(el, 'width', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerWidth(includeMargin) {
    return TinyHtml.outerWidth(this.getTarget(), includeMargin);
  }

  //////////////////////////////////////////////////

  /**
   * Gets the offset of the element relative to the document.
   * @param {Element} el - Target element.
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
    return TinyHtml.offset(this.getElement('offset'));
  }

  /**
   * Gets the position of the element relative to its offset parent.
   * @param {HTMLElement} el - Target element.
   * @returns {{top: number, left: number}}
   */
  static position(el) {
    TinyHtml._isHtmlElement(el, 'position');

    let offsetParent;
    let offset;
    let parentOffset = { top: 0, left: 0 };

    const computedStyle = window.getComputedStyle(el);

    if (computedStyle.position === 'fixed') {
      offset = el.getBoundingClientRect();
    } else {
      offset = TinyHtml.offset(el);

      offsetParent = el.offsetParent || document.documentElement;
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
        offsetParent !== el &&
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
      top: offset.top - parentOffset.top - TinyHtml.cssFloat(el, 'marginTop'),
      left: offset.left - parentOffset.left - TinyHtml.cssFloat(el, 'marginLeft'),
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
   * @param {HTMLElement} el - Target element.
   * @returns {HTMLElement} - Offset parent element.
   */
  static offsetParent(el) {
    TinyHtml._isHtmlElement(el, 'offsetParent');
    let offsetParent = el.offsetParent;

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
   * @param {Element|Window} el - Element or window.
   * @returns {number}
   */
  static scrollTop(el) {
    TinyHtml._isValidElem(el, 'scrollTop', true);
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
    return TinyHtml.scrollTop(this.getTarget());
  }

  /**
   * Gets the horizontal scroll position.
   * @param {Element|Window} el - Element or window.
   * @returns {number}
   */
  static scrollLeft(el) {
    TinyHtml._isValidElem(el, 'scrollLeft', true);
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
    return TinyHtml.scrollLeft(this.getTarget());
  }

  /**
   * Sets the vertical scroll position.
   * @param {Element|Window} el - Element or window.
   * @param {number} value - Scroll top value.
   */
  static setScrollTop(el, value) {
    TinyHtml._isValidElem(el, 'setScrollTop', true);
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
    return TinyHtml.setScrollTop(this.getTarget(), value);
  }

  /**
   * Sets the horizontal scroll position.
   * @param {Element|Window} el - Element or window.
   * @param {number} value - Scroll left value.
   */
  static setScrollLeft(el, value) {
    TinyHtml._isValidElem(el, 'setScrollLeft', true);
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
    return TinyHtml.setScrollLeft(this.getTarget(), value);
  }

  /**
   * Returns the total border width and individual sides from `border{Side}Width` CSS properties.
   *
   * @param {Element} el - The target DOM element.
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
    return TinyHtml.borderWidth(this.getElement('borderWidth'));
  }

  /**
   * Returns the total border size and individual sides from `border{Side}` CSS properties.
   *
   * @param {Element} el - The target DOM element.
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
    return TinyHtml.border(this.getElement('border'));
  }

  /**
   * Returns the total margin and individual sides from `margin{Side}` CSS properties.
   *
   * @param {Element} el - The target DOM element.
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
    return TinyHtml.margin(this.getElement('margin'));
  }

  /**
   * Returns the total padding and individual sides from `padding{Side}` CSS properties.
   *
   * @param {Element} el - The target DOM element.
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
    return TinyHtml.padding(this.getElement('padding'));
  }

  /////////////////////////////////////////////

  /**
   * Adds one or more CSS class names to the element.
   * @type {(el: Element, ...tokens: string[]) => void} - One or more class names to add.
   */
  static addClass(el, ...args) {
    TinyHtml._isElement(el, 'addClass');
    el.classList.add(...args);
  }

  /**
   * Adds one or more CSS class names to the element.
   * @type {(...tokens: string[]) => void} - One or more class names to add.
   */
  addClass(...args) {
    return TinyHtml.addClass(this.getElement('addClass'), ...args);
  }

  /**
   * Removes one or more CSS class names from the element.
   * @type {(el: Element, ...tokens: string[]) => void} - One or more class names to remove.
   */
  static removeClass(el, ...args) {
    TinyHtml._isElement(el, 'removeClass');
    el.classList.remove(...args);
  }

  /**
   * Removes one or more CSS class names from the element.
   * @type {(...tokens: string[]) => void} - One or more class names to remove.
   */
  removeClass(...args) {
    return TinyHtml.removeClass(this.getElement('removeClass'), ...args);
  }

  /**
   * Replaces an existing class name with a new one.
   * @param {Element} el - Target element.
   * @param {string} token - The class name to be replaced.
   * @param {string} newToken - The new class name to apply.
   * @returns {boolean} Whether the replacement was successful.
   * @throws {TypeError} If either argument is not a string.
   */
  static replaceClass(el, token, newToken) {
    TinyHtml._isElement(el, 'replaceClass');
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
    return TinyHtml.replaceClass(this.getElement('replaceClass'), token, newToken);
  }

  /**
   * Returns the class name at the specified index.
   * @param {Element} el - Target element.
   * @param {number} index - The index of the class name.
   * @returns {string|null} The class name at the index or null if not found.
   * @throws {TypeError} If the index is not a number.
   */
  static classItem(el, index) {
    TinyHtml._isElement(el, 'classItem');
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
    return TinyHtml.classItem(this.getElement('classItem'), index);
  }

  /**
   * Toggles a class name on the element with an optional force boolean.
   * @param {Element} el - Target element.
   * @param {string} token - The class name to toggle.
   * @param {boolean} force - If true, adds the class; if false, removes it.
   * @returns {boolean} Whether the class is present after the toggle.
   * @throws {TypeError} If token is not a string or force is not a boolean.
   */
  static toggleClass(el, token, force) {
    TinyHtml._isElement(el, 'toggleClass');
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
    return TinyHtml.toggleClass(this.getElement('toggleClass'), token, force);
  }

  /**
   * Checks if the element contains the given class name.
   * @param {Element} el - Target element.
   * @param {string} token - The class name to check.
   * @returns {boolean} True if the class is present, false otherwise.
   * @throws {TypeError} If token is not a string.
   */
  static hasClass(el, token) {
    TinyHtml._isElement(el, 'hasClass');
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
    return TinyHtml.hasClass(this.getElement('hasClass'), token);
  }

  /**
   * Returns the number of classes applied to the element.
   * @param {Element} el - Target element.
   * @returns {number} The number of classes.
   */
  static classLength(el) {
    TinyHtml._isElement(el, 'classLength');
    return el.classList.length;
  }

  /**
   * Returns the number of classes applied to the element.
   * @returns {number} The number of classes.
   */
  classLength() {
    return TinyHtml.classLength(this.getElement('classLength'));
  }

  /**
   * Returns all class names as an array of strings.
   * @param {Element} el - Target element.
   * @returns {string[]} An array of class names.
   */
  static classList(el) {
    TinyHtml._isElement(el, 'classList');
    return el.classList.values().toArray();
  }

  /**
   * Returns all class names as an array of strings.
   * @returns {string[]} An array of class names.
   */
  classList() {
    return TinyHtml.classList(this.getElement('classList'));
  }

  /////////////////////////////////////////

  /**
   * Returns the tag name of the element.
   * @param {Element} el - Target element.
   * @returns {string} The tag name in uppercase.
   */
  static tagName(el) {
    TinyHtml._isElement(el, 'tagName');
    return el.tagName;
  }

  /**
   * Returns the tag name of the element.
   * @returns {string} The tag name in uppercase.
   */
  tagName() {
    return TinyHtml.tagName(this.getElement('tagName'));
  }

  /**
   * Returns the ID of the element.
   * @param {Element} el - Target element.
   * @returns {string} The element's ID.
   */
  static id(el) {
    TinyHtml._isElement(el, 'id');
    return el.id;
  }

  /**
   * Returns the ID of the element.
   * @returns {string} The element's ID.
   */
  id() {
    return TinyHtml.id(this.getElement('id'));
  }

  /**
   * Returns the text content of the element.
   * @param {Element} el - Target element.
   * @returns {string|null} The text content or null if none.
   */
  static text(el) {
    TinyHtml._isElement(el, 'text');
    return el.textContent;
  }

  /**
   * Returns the text content of the element.
   * @returns {string|null} The text content or null if none.
   */
  text() {
    return TinyHtml.text(this.getElement('text'));
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
          /** @type {HTMLSelectElement|null} */
          // @ts-ignore
          const parentNode = option.parentNode;
          if (
            (option.selected || i === index) &&
            !option.disabled &&
            (!parentNode || !parentNode.disabled || parentNode.tagName !== 'OPTGROUP')
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
   * @param {ConstructorElValues} el - The target to listen on.
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options] - Optional event listener options.
   */
  static on(el, event, handler, options) {
    TinyHtml._isValidElem(el, 'on', true, true);
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
   * @param {ConstructorElValues} el - The target to listen on.
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options={}] - Optional event listener options.
   */
  static once(el, event, handler, options = {}) {
    TinyHtml._isValidElem(el, 'once', true, true);
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
   * @param {ConstructorElValues} el - The target element.
   * @param {string} event - The event type.
   * @param {EventRegistryHandle} handler - The function originally bound to the event.
   * @param {boolean|EventListenerOptions} [options] - Optional listener options.
   */
  static off(el, event, handler, options) {
    TinyHtml._isValidElem(el, 'off', true, true);
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
   * @param {ConstructorElValues} el - The target element.
   * @param {string} event - The event type to remove (e.g. 'click').
   */
  static offAll(el, event) {
    TinyHtml._isValidElem(el, 'offAll', true, true);
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
   * @param {ConstructorElValues} el - The target element.
   * @param {((handler: EventListenerOrEventListenerObject, event: string) => boolean)|null} [filterFn=null] -
   *        Optional filter function to selectively remove specific handlers.
   */
  static offAllTypes(el, filterFn = null) {
    TinyHtml._isValidElem(el, 'offAllTypes', true, true);
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
   * @param {EventTarget} el - Target element where the event should be triggered.
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
   * @param {Element} el
   * @param {string} name
   * @returns {string|null}
   */
  static attr(el, name) {
    TinyHtml._isElement(el, 'attr');
    return el.getAttribute(name);
  }

  /**
   * Get an attribute on an element.
   * @param {string} name
   * @returns {string|null}
   */
  attr(name) {
    return TinyHtml.attr(this.getElement('attr'), name);
  }

  /**
   * Set an attribute on an element.
   * @param {Element} el
   * @param {string} name
   * @param {string|null} [value=null]
   */
  static setAttr(el, name, value = null) {
    TinyHtml._isElement(el, 'setAttr');
    if (value === null) el.removeAttribute(name);
    else el.setAttribute(name, value);
  }

  /**
   * Set an attribute on an element.
   * @param {string} name
   * @param {string|null} [value=null]
   */
  setAttr(name, value) {
    return TinyHtml.setAttr(this.getElement('setAttr'), name, value);
  }

  /**
   * Remove attribute(s) from an element.
   * @param {Element} el
   * @param {string} name Space-separated list of attributes.
   */
  static removeAttr(el, name) {
    TinyHtml._isElement(el, 'removeAttr');
    el.removeAttribute(name);
  }

  /**
   * Remove attribute(s) from an element.
   * @param {string} name Space-separated list of attributes.
   */
  removeAttr(name) {
    return TinyHtml.removeAttr(this.getElement('removeAttr'), name);
  }

  /**
   * Check if an attribute exists on an element.
   * @param {Element} el
   * @param {string} name
   * @returns {boolean}
   */
  static hasAttr(el, name) {
    TinyHtml._isElement(el, 'hasAttr');
    return el.hasAttribute(name);
  }

  /**
   * Check if an attribute exists on an element.
   * @param {string} name
   * @returns {boolean}
   */
  hasAttr(name) {
    return TinyHtml.hasAttr(this.getElement('hasAttr'), name);
  }

  /**
   * Check if a property exists.
   * @param {Element} el
   * @param {string} name
   * @returns {boolean}
   */
  static hasProp(el, name) {
    TinyHtml._isElement(el, 'hasProp');
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
    return TinyHtml.hasProp(this.getElement('hasProp'), name);
  }

  /**
   * Set a property on an element.
   * @param {Element} el
   * @param {string} name
   */
  static addProp(el, name) {
    TinyHtml._isElement(el, 'addProp');
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
    return TinyHtml.addProp(this.getElement('addProp'), name);
  }

  /**
   * Remove a property from an element.
   * @param {Element} el
   * @param {string} name
   */
  static removeProp(el, name) {
    TinyHtml._isElement(el, 'removeProp');
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
    return TinyHtml.removeProp(this.getElement('removeProp'), name);
  }

  /**
   * Toggle a boolean property.
   * @param {Element} el
   * @param {string} name
   * @param {boolean} [force]
   */
  static toggleProp(el, name, force) {
    TinyHtml._isElement(el, 'toggleProp');
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
    return TinyHtml.toggleProp(this.getElement('toggleProp'), name, force);
  }

  /////////////////////////////////////////////////////

  /**
   * Removes an element from the DOM.
   * @param {Element} el - The DOM element or selector to remove.
   */
  static remove(el) {
    TinyHtml._isElement(el, 'remove');
    el.remove();
  }

  /**
   * Removes the element from the DOM.
   */
  remove() {
    return TinyHtml.remove(this.getElement('remove'));
  }

  /**
   * Returns the index of the first element within its parent or relative to a selector/element.
   *
   * @param {TinyElement} el - The element target
   * @param {string|TinyElement|null} [el2] - Optional target to compare index against.
   * @returns {number}
   */
  static index(el, el2 = null) {
    const elem = TinyHtml._preElem(el, 'index');
    if (!elem) return -1;

    if (!el2) {
      return Array.prototype.indexOf.call(elem.parentNode?.children || [], elem);
    }

    if (el2) {
      const matchEls =
        typeof el2 === 'string' ? document.querySelectorAll(el2) : TinyHtml._preElems(el2, 'index');
      return Array.prototype.indexOf.call(matchEls, elem);
    }

    return -1;
  }

  /**
   * Returns the index of the first element within its parent or relative to a selector/element.
   *
   * @param {string|TinyElement|null} [elem] - Optional target to compare index against.
   * @returns {number}
   */
  index(elem) {
    return TinyHtml.index(this.getElement('index'), elem);
  }
}

export default TinyHtml;
