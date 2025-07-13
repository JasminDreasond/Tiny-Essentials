import * as TinyCollision from '../basics/collision.mjs';

const {
  areElsColliding,
  areElsPerfColliding,
  areElsCollTop,
  areElsCollBottom,
  areElsCollLeft,
  areElsCollRight,
} = TinyCollision;

/**
 * Represents a raw Node element or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {Node|TinyHtml|null} TinyNode
 */

/**
 * Represents a raw DOM element or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {Element|TinyHtml} TinyElement
 */

/**
 * Represents a raw DOM html element or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {HTMLElement|TinyHtml} TinyHtmlElement
 */

/**
 * Represents a raw DOM event target element or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {EventTarget|TinyHtml} TinyEventTarget
 */

/**
 * Represents a raw DOM input element or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {InputElement|TinyHtml} TinyInputElement
 */

/**
 * Represents a raw DOM element/window or an instance of TinyHtml.
 * This type is used to abstract interactions with both plain elements
 * and wrapped elements via the TinyHtml class.
 *
 * @typedef {ElementAndWindow|TinyHtml} TinyElementAndWindow
 */

/**
 * Represents a value that can be either a DOM Element or the global Window object.
 * Useful for functions that operate generically on scrollable or measurable targets.
 *
 * @typedef {Element|Window} ElementAndWindow
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
 * @type {WeakMap<ConstructorElValues|EventTarget, EventRegistryList>}
 */
const __eventRegistry = new WeakMap();

/**
 * A key-value store associated with a specific DOM element.
 * Keys are strings, and values can be of any type.
 *
 * @typedef {Record<string, *>} ElementDataStore
 */

/**
 * WeakMap to hold private data for elements
 *
 * @type {WeakMap<ConstructorElValues, ElementDataStore>}
 */
const __elementDataMap = new WeakMap();

/**
 * Stores directional collision locks separately.
 * Each direction has its own WeakMap to allow independent locking.
 *
 * @type {{
 *   top: WeakMap<Element, true>,
 *   bottom: WeakMap<Element, true>,
 *   left: WeakMap<Element, true>,
 *   right: WeakMap<Element, true>
 * }}
 */
const __elemCollision = {
  top: new WeakMap(),
  bottom: new WeakMap(),
  left: new WeakMap(),
  right: new WeakMap(),
};

/**
 * Possible directions from which a collision was detected and locked.
 *
 * @typedef {'top'|'bottom'|'left'|'right'} CollisionDirLock
 */

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
 * @typedef {string | number | Date | boolean | null} SetValueBase - Primitive types accepted as input values.
 */

/**
 * @typedef {'string' | 'date' | 'number'} GetValueTypes
 * Types of value extractors supported by TinyHtml._valTypes.
 */

/**
 * @typedef {SetValueBase|SetValueBase[]} SetValueList - A single value or an array of values to be assigned to the input element.
 */

/**
 * A list of HTML form elements that can have a `.value` property used by TinyHtml.
 * Includes common input types used in forms.
 *
 * @typedef {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement|HTMLOptionElement} InputElement
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
  /** @typedef {import('../basics/collision.mjs').ObjRect} ObjRect */

  static Utils = { ...TinyCollision };

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
   * Returns the current target held by this instance.
   *
   * @returns {ConstructorElValues} - The instance's target element.
   */
  get() {
    return this.#el;
  }

  /**
   * Returns the current Element held by this instance.
   *
   * @param {string} where - The method name or context calling this.
   * @returns {ConstructorElValues} - The instance's element.
   * @readonly
   */
  _getElement(where) {
    if (
      !(this.#el instanceof Element) &&
      !(this.#el instanceof Window) &&
      !(this.#el instanceof Document)
    )
      throw new Error(`[TinyHtml] Invalid Element in ${where}().`);
    return this.#el;
  }

  //////////////////////////////////////////////////////

  /**
   * @param {TinyElement|EventTarget|null|(TinyElement|EventTarget|null)[]} elems
   * @param {string} where
   * @param {any[]} TheTinyElements
   * @param {string[]} elemName
   * @returns {any[]}
   * @readonly
   */
  static _preElemsTemplate(elems, where, TheTinyElements, elemName) {
    /** @param {(TinyElement|EventTarget|null)[]} item */
    const checkElement = (item) =>
      item.map((elem) => {
        const result = elem instanceof TinyHtml ? elem._getElement(where) : elem;
        let allowed = false;
        for (const TheTinyElement of TheTinyElements) {
          if (result instanceof TheTinyElement) {
            allowed = true;
            break;
          }
        }
        if (!allowed)
          throw new Error(
            `[TinyHtml] Invalid element of the list "${elemName.join(',')}" in ${where}().`,
          );
        return result;
      });
    if (!Array.isArray(elems)) return checkElement([elems]);
    return checkElement(elems);
  }

  /**
   * @param {TinyElement|EventTarget|null|(TinyElement|EventTarget|null)[]} elems
   * @param {string} where
   * @param {any[]} TheTinyElements
   * @param {string[]} elemName
   * @param {boolean} [canNull=false]
   * @returns {any}
   * @readonly
   */
  static _preElemTemplate(elems, where, TheTinyElements, elemName, canNull = false) {
    /** @param {(TinyElement|EventTarget|null)[]} item */
    const checkElement = (item) => {
      const elem = item[0];
      let result = elem instanceof TinyHtml ? elem._getElement(where) : elem;
      let allowed = false;
      for (const TheTinyElement of TheTinyElements) {
        if (result instanceof TheTinyElement) {
          allowed = true;
          break;
        }
      }

      if (canNull && (result === null || typeof result === 'undefined')) {
        result = null;
        allowed = true;
      }

      if (!allowed)
        throw new Error(
          `[TinyHtml] Invalid element of the list "${elemName.join(',')}" in ${where}().`,
        );
      return result;
    };
    if (!Array.isArray(elems)) return checkElement([elems]);
    if (elems.length > 1)
      throw new Error(
        `[TinyHtml] Invalid element amount in ${where}() (Received ${elems.length}/1).`,
      );
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
    return TinyHtml._preElemsTemplate(elems, where, [Element], ['Element']);
  }

  /**
   * Ensures the input is returned as an single element.
   * Useful to normalize operations across multiple or single elements.
   *
   * @param {TinyElement|TinyElement[]} elems - A single element or array of elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {Element} - Always returns an single element.
   * @readonly
   */
  static _preElem(elems, where) {
    return TinyHtml._preElemTemplate(elems, where, [Element], ['Element']);
  }

  /**
   * Ensures the input is returned as an array.
   * Useful to normalize operations across multiple or single nodes.
   *
   * @param {TinyNode|TinyNode[]} elems - A single node or array of nodes.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {Node[]} - Always returns an array of nodes.
   * @readonly
   */
  static _preNodeElems(elems, where) {
    return TinyHtml._preElemsTemplate(elems, where, [Node], ['Node']);
  }

  /**
   * Ensures the input is returned as an single node.
   * Useful to normalize operations across multiple or single nodes.
   *
   * @param {TinyNode|TinyNode[]} elems - A single node or array of nodes.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {Node} - Always returns an single node.
   * @readonly
   */
  static _preNodeElem(elems, where) {
    return TinyHtml._preElemTemplate(elems, where, [Node], ['Node']);
  }

  /**
   * Ensures the input is returned as an single node.
   * Useful to normalize operations across multiple or single nodes.
   *
   * @param {TinyNode|TinyNode[]} elems - A single node or array of nodes.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {Node|null} - Always returns an single node or null.
   * @readonly
   */
  static _preNodeElemWithNull(elems, where) {
    return TinyHtml._preElemTemplate(elems, where, [Node], ['Node'], true);
  }

  /**
   * Ensures the input is returned as an array.
   * Useful to normalize operations across multiple or single html elements.
   *
   * @param {TinyElement|TinyElement[]} elems - A single html element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {HTMLElement[]} - Always returns an array of html elements.
   * @readonly
   */
  static _preHtmlElems(elems, where) {
    return TinyHtml._preElemsTemplate(elems, where, [HTMLElement], ['HTMLElement']);
  }

  /**
   * Ensures the input is returned as an single html element.
   * Useful to normalize operations across multiple or single html elements.
   *
   * @param {TinyElement|TinyElement[]} elems - A single html element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {HTMLElement} - Always returns an single html element.
   * @readonly
   */
  static _preHtmlElem(elems, where) {
    return TinyHtml._preElemTemplate(elems, where, [HTMLElement], ['HTMLElement']);
  }

  /**
   * Ensures the input is returned as an array.
   * Useful to normalize operations across multiple or single event target elements.
   *
   * @param {TinyInputElement|TinyInputElement[]} elems - A single event target element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {InputElement[]} - Always returns an array of event target elements.
   * @readonly
   */
  static _preInputElems(elems, where) {
    return TinyHtml._preElemsTemplate(
      elems,
      where,
      [HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement, HTMLOptionElement],
      ['HTMLInputElement', 'HTMLSelectElement', 'HTMLTextAreaElement', 'HTMLOptionElement'],
    );
  }

  /**
   * Ensures the input is returned as an single event target element.
   * Useful to normalize operations across multiple or single event target elements.
   *
   * @param {TinyInputElement|TinyInputElement[]} elems - A single event target element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {InputElement} - Always returns an single event target element.
   * @readonly
   */
  static _preInputElem(elems, where) {
    return TinyHtml._preElemTemplate(
      elems,
      where,
      [HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement, HTMLOptionElement],
      ['HTMLInputElement', 'HTMLSelectElement', 'HTMLTextAreaElement', 'HTMLOptionElement'],
    );
  }

  /**
   * Ensures the input is returned as an array.
   * Useful to normalize operations across multiple or single event target elements.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} elems - A single event target element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {EventTarget[]} - Always returns an array of event target elements.
   * @readonly
   */
  static _preEventTargetElems(elems, where) {
    return TinyHtml._preElemsTemplate(elems, where, [EventTarget], ['EventTarget']);
  }

  /**
   * Ensures the input is returned as an single event target element.
   * Useful to normalize operations across multiple or single event target elements.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} elems - A single event target element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {EventTarget} - Always returns an single event target element.
   * @readonly
   */
  static _preEventTargetElem(elems, where) {
    return TinyHtml._preElemTemplate(elems, where, [EventTarget], ['EventTarget']);
  }

  /**
   * Ensures the input is returned as an array.
   * Useful to normalize operations across multiple or single element/window elements.
   *
   * @param {TinyElementAndWindow|TinyElementAndWindow[]} elems - A single element/window element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {ElementAndWindow[]} - Always returns an array of element/window elements.
   * @readonly
   */
  static _preElemsAndWindow(elems, where) {
    return TinyHtml._preElemsTemplate(elems, where, [Element, Window], ['Element', 'Window']);
  }

  /**
   * Ensures the input is returned as an single element/window element.
   * Useful to normalize operations across multiple or single element/window elements.
   *
   * @param {TinyElementAndWindow|TinyElementAndWindow[]} elems - A single element/window element or array of html elements.
   * @param {string} where - The method or context name where validation is being called.
   * @returns {ElementAndWindow} - Always returns an single element/window element.
   * @readonly
   */
  static _preElemAndWindow(elems, where) {
    return TinyHtml._preElemTemplate(elems, where, [Element, Window], ['Element', 'Window']);
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
          /** @type {Element} */ (
            elem instanceof TinyHtml ? elem._getElement('fromTinyElm') : elem
          ),
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
    if (typeof not !== 'boolean') throw new TypeError('The "not" must be a boolean.');
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
    return TinyHtml.not(this, selector);
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
    return TinyHtml.find(this, selector);
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
    return TinyHtml.is(this, selector);
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
    return TinyHtml.has(this, target).length > 0;
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
    return TinyHtml.closest(this, selector, context);
  }

  /**
   * Compares two DOM elements to determine if they refer to the same node in the document.
   *
   * This performs a strict equality check (`===`) between the two elements.
   *
   * @param {TinyNode} elem - The first DOM element to compare.
   * @param {TinyNode} otherElem - The second DOM element to compare.
   * @returns {boolean} `true` if both elements are the same DOM node; otherwise, `false`.
   */
  static isSameDom(elem, otherElem) {
    return (
      TinyHtml._preNodeElem(elem, 'isSameDom') === TinyHtml._preNodeElem(otherElem, 'isSameDom')
    );
  }

  /**
   * Compares two DOM elements to determine if they refer to the same node in the document.
   *
   * This performs a strict equality check (`===`) between the two elements.
   *
   * @param {TinyNode} elem - The DOM element to compare.
   * @returns {boolean} `true` if both elements are the same DOM node; otherwise, `false`.
   */
  isSameDom(elem) {
    return TinyHtml.isSameDom(this, elem);
  }

  //////////////////////////////////////////////////////////////////

  /** @type {ElementDataStore} */
  _data = {};

  /**
   * Internal data selectors for accessing public or private data stores.
   *
   * @type {Record<string, (where: string, elem: TinyElement) => ElementDataStore>}
   * @readonly
   */
  static _dataSelector = {
    public: (where, el) => {
      const elem = TinyHtml._preElem(el, where);
      let data = __elementDataMap.get(elem);
      if (!data) {
        data = {};
        __elementDataMap.set(elem, data);
      }
      return data;
    },
    private: (where, el) => {
      if (!(el instanceof TinyHtml))
        throw new Error(`Element must be a TinyHtml instance to execute ${where}().`);
      return el._data;
    },
  };

  /**
   * Retrieves data associated with a DOM element.
   *
   * If a `key` is provided, the corresponding value is returned.
   * If no `key` is given, a shallow copy of all stored data is returned.
   *
   * @param {TinyElement} el - The DOM element.
   * @param {string|null} [key] - The specific key to retrieve from the data store.
   * @param {boolean} [isPrivate=false] - Whether to access the private data store.
   * @returns {ElementDataStore|undefined|any} - The stored value, all data, or undefined if the key doesn't exist.
   */
  static data(el, key, isPrivate = false) {
    // Get or initialize the data object
    const data = TinyHtml._dataSelector[!isPrivate ? 'public' : 'private']('data', el);

    // Getter for all
    if (key === undefined || key === null) return { ...data };

    // Getter for specific key
    if (typeof key !== 'string') throw new TypeError('The key must be a string.');
    return data.hasOwnProperty(key) ? data[key] : undefined;
  }

  /**
   * Retrieves data associated with a DOM element.
   *
   * If a `key` is provided, the corresponding value is returned.
   * If no `key` is given, a shallow copy of all stored data is returned.
   *
   * @param {string} [key] - The specific key to retrieve from the data store.
   * @param {boolean} [isPrivate=false] - Whether to access the private data store.
   * @returns {ElementDataStore|undefined|any} - The stored value, all data, or undefined if the key doesn't exist.
   */
  data(key, isPrivate) {
    return TinyHtml.data(this, key, isPrivate);
  }

  /**
   * Stores a value associated with a specific key for a DOM element.
   *
   * @param {TinyElement} el - The DOM element.
   * @param {string} key - The key under which the data will be stored.
   * @param {any} value - The value to store.
   * @param {boolean} [isPrivate=false] - Whether to store the data in the private store.
   * @returns {void}
   */
  static setData(el, key, value, isPrivate = false) {
    const data = TinyHtml._dataSelector[!isPrivate ? 'public' : 'private']('setData', el);
    if (typeof key !== 'string') throw new TypeError('The key must be a string.');
    data[key] = value;
  }

  /**
   * Stores a value associated with a specific key for a DOM element.
   *
   * @param {string} key - The key under which the data will be stored.
   * @param {any} value - The value to store.
   * @param {boolean} [isPrivate=false] - Whether to store the data in the private store.
   * @returns {void}
   */
  setData(key, value, isPrivate = false) {
    return TinyHtml.setData(this, key, value, isPrivate);
  }

  //////////////////////////////////////////////////////

  /**
   * Get the sibling element in a given direction.
   *
   * @param {TinyNode} el
   * @param {"previousSibling"|"nextSibling"} direction
   * @param {string} where
   * @returns {ChildNode|null}
   * @readonly
   */
  static _getSibling(el, direction, where) {
    /** @type {Node|null} */
    let newCurrent = TinyHtml._preNodeElemWithNull(el, where);
    while (newCurrent && (newCurrent = newCurrent[direction]) && newCurrent.nodeType !== 1) {}
    if (!(newCurrent instanceof Node)) return null;
    return /** @type {ChildNode} */ (newCurrent);
  }

  /**
   * Get all sibling elements excluding the given one.
   *
   * @param {Node|null} start
   * @param {Node|null} [exclude]
   * @returns {ChildNode[]}
   * @readonly
   */
  static _getSiblings(start, exclude) {
    /** @type {Node|null} */
    let st = start;
    const siblings = [];
    for (; st; st = st.nextSibling) {
      if (st.nodeType === 1 && st !== exclude) {
        siblings.push(st);
      }
    }
    return /** @type {ChildNode[]} */ (siblings);
  }

  /**
   * Traverse DOM in a direction collecting elements.
   *
   * @param {TinyNode} el
   * @param {"parentNode"|"nextSibling"|"previousSibling"} direction
   * @param {TinyNode|string} [until]
   * @param {string} [where='domDir']
   * @returns {ChildNode[]}
   */
  static domDir(el, direction, until, where = 'domDir') {
    if (typeof direction !== 'string') throw new TypeError('The "direction" must be a string.');
    let elem = TinyHtml._preNodeElemWithNull(el, where);
    const matched = [];
    // @ts-ignore
    while (elem && (elem = elem[direction])) {
      if (elem.nodeType !== 1) continue;
      if (
        until &&
        (typeof until === 'string'
          ? // @ts-ignore
            elem.matches(until)
          : elem === until)
      )
        break;
      matched.push(elem);
    }
    return /** @type {ChildNode[]} */ (matched);
  }

  /**
   * Returns the direct parent node of the given element, excluding document fragments.
   *
   * @param {TinyNode} el - The DOM node to find the parent of.
   * @returns {ParentNode|null} The parent node or null if not found.
   */
  static parent(el) {
    let elem = TinyHtml._preNodeElemWithNull(el, 'parent');
    const parent = elem ? elem.parentNode : null;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * Returns the direct parent node of the given element, excluding document fragments.
   *
   * @returns {ParentNode|null} The parent node or null if not found.
   */
  parent() {
    return TinyHtml.parent(this);
  }

  /**
   * Returns all ancestor nodes of the given element, optionally stopping before a specific ancestor.
   *
   * @param {TinyNode} el - The DOM node to start from.
   * @param {TinyNode|string} [until] - A node or selector to stop before.
   * @returns {ChildNode[]} An array of ancestor nodes.
   */
  static parents(el, until) {
    return TinyHtml.domDir(el, 'parentNode', until, 'parents');
  }

  /**
   * Returns all ancestor nodes of the given element, optionally stopping before a specific ancestor.
   *
   * @param {TinyNode|string} [until] - A node or selector to stop before.
   * @returns {ChildNode[]} An array of ancestor nodes.
   */
  parents(until) {
    return TinyHtml.parents(this, until);
  }

  /**
   * Returns the next sibling of the given element.
   *
   * @param {TinyNode} el - The DOM node to start from.
   * @returns {ChildNode|null} The next sibling or null if none found.
   */
  static next(el) {
    return TinyHtml._getSibling(el, 'nextSibling', 'next');
  }

  /**
   * Returns the next sibling of the given element.
   *
   * @returns {ChildNode|null} The next sibling or null if none found.
   */
  next() {
    return TinyHtml.next(this);
  }

  /**
   * Returns the previous sibling of the given element.
   *
   * @param {TinyNode} el - The DOM node to start from.
   * @returns {ChildNode|null} The previous sibling or null if none found.
   */
  static prev(el) {
    return TinyHtml._getSibling(el, 'previousSibling', 'prev');
  }

  /**
   * Returns the previous sibling of the given element.
   *
   * @returns {ChildNode|null} The previous sibling or null if none found.
   */
  prev() {
    return TinyHtml.prev(this);
  }

  /**
   * Returns all next sibling nodes after the given element.
   *
   * @param {TinyNode} el - The DOM node to start from.
   * @returns {ChildNode[]} An array of next sibling nodes.
   */
  static nextAll(el) {
    return TinyHtml.domDir(el, 'nextSibling', undefined, 'nextAll');
  }

  /**
   * Returns all next sibling nodes after the given element.
   *
   * @returns {ChildNode[]} An array of next sibling nodes.
   */
  nextAll() {
    return TinyHtml.nextAll(this);
  }

  /**
   * Returns all previous sibling nodes before the given element.
   *
   * @param {TinyNode} el - The DOM node to start from.
   * @returns {ChildNode[]} An array of previous sibling nodes.
   */
  static prevAll(el) {
    return TinyHtml.domDir(el, 'previousSibling', undefined, 'prevAll');
  }

  /**
   * Returns all previous sibling nodes before the given element.
   *
   * @returns {ChildNode[]} An array of previous sibling nodes.
   */
  prevAll() {
    return TinyHtml.prevAll(this);
  }

  /**
   * Returns all next sibling nodes up to (but not including) the node matched by a selector or element.
   *
   * @param {TinyNode} el - The DOM node to start from.
   * @param {TinyNode|string} [until] - A node or selector to stop before.
   * @returns {ChildNode[]} An array of next sibling nodes.
   */
  static nextUntil(el, until) {
    return TinyHtml.domDir(el, 'nextSibling', until, 'nextUtil');
  }

  /**
   * Returns all next sibling nodes up to (but not including) the node matched by a selector or element.
   *
   * @param {TinyNode|string} [until] - A node or selector to stop before.
   * @returns {ChildNode[]} An array of next sibling nodes.
   */
  nextUntil(until) {
    return TinyHtml.nextUntil(this, until);
  }

  /**
   * Returns all previous sibling nodes up to (but not including) the node matched by a selector or element.
   *
   * @param {TinyNode} el - The DOM node to start from.
   * @param {TinyNode|string} [until] - A node or selector to stop before.
   * @returns {ChildNode[]} An array of previous sibling nodes.
   */
  static prevUntil(el, until) {
    return TinyHtml.domDir(el, 'previousSibling', until, 'prevUtil');
  }

  /**
   * Returns all previous sibling nodes up to (but not including) the node matched by a selector or element.
   *
   * @param {TinyNode|string} [until] - A node or selector to stop before.
   * @returns {ChildNode[]} An array of previous sibling nodes.
   */
  prevUntil(until) {
    return TinyHtml.prevUntil(this, until);
  }

  /**
   * Returns all sibling nodes of the given element, excluding itself.
   *
   * @param {TinyNode} el - The DOM node to find siblings of.
   * @returns {ChildNode[]} An array of sibling nodes.
   */
  static siblings(el) {
    const elem = TinyHtml._preNodeElemWithNull(el, 'siblings');
    return TinyHtml._getSiblings(elem && elem.parentNode ? elem.parentNode.firstChild : null, elem);
  }

  /**
   * Returns all sibling nodes of the given element, excluding itself.
   *
   * @returns {ChildNode[]} An array of sibling nodes.
   */
  siblings() {
    return TinyHtml.siblings(this);
  }

  /**
   * Returns all child nodes of the given element.
   *
   * @param {TinyNode} el - The DOM node to get children from.
   * @returns {ChildNode[]} An array of child nodes.
   */
  static children(el) {
    const elem = TinyHtml._preNodeElemWithNull(el, 'children');
    return TinyHtml._getSiblings(elem ? elem.firstChild : null);
  }

  /**
   * Returns all child nodes of the given element.
   *
   * @returns {ChildNode[]} An array of child nodes.
   */
  children() {
    return TinyHtml.children(this);
  }

  /**
   * Returns the contents of the given node. For `<template>` it returns its content; for `<iframe>`, the document.
   *
   * @param {TinyNode} el - The DOM node to get contents from.
   * @returns {(ChildNode|DocumentFragment)[]|Document[]} An array of child nodes or the content document of an iframe.
   */
  static contents(el) {
    const elem = TinyHtml._preNodeElemWithNull(el, 'contents');
    if (
      elem instanceof HTMLIFrameElement &&
      elem.contentDocument != null &&
      Object.getPrototypeOf(elem.contentDocument)
    ) {
      return [elem.contentDocument];
    }

    if (elem instanceof HTMLTemplateElement) {
      return Array.from((elem.content || elem).childNodes);
    }

    if (elem) return Array.from(elem.childNodes);
    return [];
  }

  /**
   * Returns the contents of the given node. For `<template>` it returns its content; for `<iframe>`, the document.
   *
   * @returns {(ChildNode|DocumentFragment)[]|Document[]} An array of child nodes or the content document of an iframe.
   */
  contents() {
    return TinyHtml.contents(this);
  }

  /**
   * Clone each element.
   * @param {TinyNode|TinyNode[]} el
   * @param {boolean} [deep=true]
   * @returns {Node[]}
   */
  static clone(el, deep = true) {
    if (typeof deep !== 'boolean') throw new TypeError('The "deep" must be a boolean.');
    return TinyHtml._preNodeElems(el, 'clone').map((el) => el.cloneNode(deep));
  }

  /**
   * Clone the element.
   * @param {boolean} [deep=true]
   * @returns {Node}
   */
  clone(deep) {
    return TinyHtml.clone(this, deep)[0];
  }

  /**
   * Normalize and validate nodes before DOM insertion.
   * Converts TinyNode-like structures or strings into DOM-compatible nodes.
   * @type {(where: string, ...nodes: (TinyNode | TinyNode[] | string)[]) => (Node | string)[]}
   * @readonly
   */
  static _appendChecker(where, ...nodes) {
    const results = [];
    const nds = [...nodes];
    for (const index in nds) {
      if (typeof nds[index] !== 'string') {
        results.push(TinyHtml._preNodeElem(nds[index], where));
      } else results.push(nds[index]);
    }
    return results;
  }

  /**
   * Appends child elements or strings to the end of the target element(s).
   *
   * @param {TinyElement | TinyElement[]} el - The target element(s) to receive children.
   * @param {...(TinyNode | TinyNode[] | string)} children - The child elements or text to append.
   */
  static append(el, ...children) {
    const elem = TinyHtml._preElem(el, 'append');
    elem.append(...TinyHtml._appendChecker('append', ...children));
  }

  /**
   * Appends child elements or strings to the end of the target element(s).
   *
   * @param {...(TinyNode | TinyNode[] | string)} children - The child elements or text to append.
   */
  append(...children) {
    return TinyHtml.append(this, ...children);
  }

  /**
   * Prepends child elements or strings to the beginning of the target element(s).
   *
   * @param {TinyElement | TinyElement[]} el - The target element(s) to receive children.
   * @param {...(TinyNode | TinyNode[] | string)} children - The child elements or text to prepend.
   */
  static prepend(el, ...children) {
    const elem = TinyHtml._preElem(el, 'prepend');
    elem.prepend(...TinyHtml._appendChecker('prepend', ...children));
  }

  /**
   * Prepends child elements or strings to the beginning of the target element(s).
   *
   * @param {...(TinyNode | TinyNode[] | string)} children - The child elements or text to prepend.
   */
  prepend(...children) {
    return TinyHtml.prepend(this, ...children);
  }

  /**
   * Inserts elements or strings immediately before the target element(s) in the DOM.
   *
   * @param {TinyElement | TinyElement[]} el - The target element(s) before which new content is inserted.
   * @param {...(TinyNode | TinyNode[] | string)} children - Elements or text to insert before the target.
   */
  static before(el, ...children) {
    const elem = TinyHtml._preElem(el, 'before');
    elem.before(...TinyHtml._appendChecker('before', ...children));
  }

  /**
   * Inserts elements or strings immediately before the target element(s) in the DOM.
   *
   * @param {...(TinyNode | TinyNode[] | string)} children - Elements or text to insert before the target.
   */
  before(...children) {
    return TinyHtml.before(this, ...children);
  }

  /**
   * Inserts elements or strings immediately after the target element(s) in the DOM.
   *
   * @param {TinyElement | TinyElement[]} el - The target element(s) after which new content is inserted.
   * @param {...(TinyNode | TinyNode[] | string)} children - Elements or text to insert after the target.
   */
  static after(el, ...children) {
    const elem = TinyHtml._preElem(el, 'after');
    elem.after(...TinyHtml._appendChecker('after', ...children));
  }

  /**
   * Inserts elements or strings immediately after the target element(s) in the DOM.
   *
   * @param {...(TinyNode | TinyNode[] | string)} children - Elements or text to insert after the target.
   */
  after(...children) {
    return TinyHtml.after(this, ...children);
  }

  /**
   * Replaces the target element(s) in the DOM with new elements or text.
   *
   * @param {TinyElement | TinyElement[]} el - The element(s) to be replaced.
   * @param {...(TinyNode | TinyNode[] | string)} newNodes - New elements or text to replace the target.
   */
  static replaceWith(el, ...newNodes) {
    const elem = TinyHtml._preElem(el, 'replaceWith');
    elem.replaceWith(...TinyHtml._appendChecker('replaceWith', ...newNodes));
  }

  /**
   * Replaces the target element(s) in the DOM with new elements or text.
   *
   * @param {...(TinyNode | TinyNode[] | string)} newNodes - New elements or text to replace the target.
   */
  replaceWith(...newNodes) {
    return TinyHtml.replaceWith(this, ...newNodes);
  }

  /**
   * Appends the given element(s) to each target element in sequence.
   *
   * @param {TinyNode | TinyNode[]} el - The element(s) to append.
   * @param {TinyNode | TinyNode[]} targets - Target element(s) where content will be appended.
   */
  static appendTo(el, targets) {
    const elems = TinyHtml._preNodeElems(el, 'appendTo');
    const tars = TinyHtml._preNodeElems(targets, 'appendTo');
    tars.forEach((target, i) => {
      elems.forEach((elem) =>
        target.appendChild(i === tars.length - 1 ? elem : elem.cloneNode(true)),
      );
    });
  }

  /**
   * Appends the given element(s) to each target element in sequence.
   *
   * @param {TinyNode | TinyNode[]} targets - Target element(s) where content will be appended.
   */
  appendTo(targets) {
    return TinyHtml.appendTo(this, targets);
  }

  /**
   * Prepends the given element(s) to each target element in sequence.
   *
   * @param {TinyElement | TinyElement[]} el - The element(s) to prepend.
   * @param {TinyElement | TinyElement[]} targets - Target element(s) where content will be prepended.
   */
  static prependTo(el, targets) {
    const elems = TinyHtml._preElems(el, 'prependTo');
    const tars = TinyHtml._preElems(targets, 'prependTo');
    tars.forEach((target, i) => {
      elems
        .slice()
        .reverse()
        .forEach((elem) => target.prepend(i === tars.length - 1 ? elem : elem.cloneNode(true)));
    });
  }

  /**
   * Prepends the given element(s) to each target element in sequence.
   *
   * @param {TinyElement | TinyElement[]} targets - Target element(s) where content will be prepended.
   */
  prependTo(targets) {
    return TinyHtml.prependTo(this, targets);
  }

  /**
   * Inserts the element before a child of a given target, or before the target itself.
   *
   * @param {TinyNode | TinyNode[]} el - The element(s) to insert.
   * @param {TinyNode | TinyNode[]} target - The reference element where insertion happens.
   * @param {TinyNode | TinyNode[] | null} [child=null] - Optional child to insert before, defaults to target.
   */
  static insertBefore(el, target, child = null) {
    const elem = TinyHtml._preNodeElem(el, 'insertBefore');
    const targ = TinyHtml._preNodeElem(target, 'insertBefore');
    const childNode = TinyHtml._preNodeElemWithNull(child, 'insertBefore');
    if (!targ.parentNode) throw new Error('');
    targ.parentNode.insertBefore(elem, childNode || targ);
  }

  /**
   * Inserts the element before a child of a given target, or before the target itself.
   *
   * @param {TinyNode | TinyNode[]} target - The reference element where insertion happens.
   * @param {TinyNode | TinyNode[] | null} [child=null] - Optional child to insert before, defaults to target.
   */
  insertBefore(target, child) {
    return TinyHtml.insertBefore(this, target, child);
  }

  /**
   * Inserts the element after a child of a given target, or after the target itself.
   *
   * @param {TinyNode | TinyNode[]} el - The element(s) to insert.
   * @param {TinyNode | TinyNode[]} target - The reference element where insertion happens.
   * @param {TinyNode | TinyNode[] | null} [child=null] - Optional child to insert after, defaults to target.
   */
  static insertAfter(el, target, child = null) {
    const elem = TinyHtml._preNodeElem(el, 'insertAfter');
    const targ = TinyHtml._preNodeElem(target, 'insertBefore');
    const childNode = TinyHtml._preNodeElemWithNull(child, 'insertBefore');
    if (!targ.parentNode) throw new Error('');
    targ.parentNode.insertBefore(elem, childNode || targ.nextSibling);
  }

  /**
   * Inserts the element after a child of a given target, or after the target itself.
   *
   * @param {TinyNode | TinyNode[]} target - The reference element where insertion happens.
   * @param {TinyNode | TinyNode[] | null} [child=null] - Optional child to insert after, defaults to target.
   */
  insertAfter(target, child) {
    return TinyHtml.insertAfter(this, target, child);
  }

  /**
   * Replaces all target elements with the provided element(s).
   * If multiple targets exist, the inserted elements are cloned accordingly.
   *
   * @param {TinyNode | TinyNode[]} el - The new element(s) to insert.
   * @param {TinyNode | TinyNode[]} targets - The elements to be replaced.
   */
  static replaceAll(el, targets) {
    const elems = TinyHtml._preNodeElems(el, 'replaceAll');
    const tars = TinyHtml._preNodeElems(targets, 'replaceAll');
    tars.forEach((target, i) => {
      const parent = target.parentNode;
      elems.forEach((elem) => {
        if (parent)
          parent.replaceChild(i === tars.length - 1 ? elem : elem.cloneNode(true), target);
      });
    });
  }

  /**
   * Replaces all target elements with the provided element(s).
   * If multiple targets exist, the inserted elements are cloned accordingly.
   *
   * @param {TinyNode | TinyNode[]} targets - The elements to be replaced.
   */
  replaceAll(targets) {
    return TinyHtml.replaceAll(this, targets);
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
    if (el instanceof TinyHtml)
      throw new Error(
        `[TinyHtml] You are trying to put a TinyHtml inside another TinyHtml in constructor.`,
      );
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

  /////////////////////////////////////////////////////

  /**
   * Returns the full computed CSS styles for the given element.
   *
   * @param {TinyElement} el - The element to retrieve styles from.
   * @returns {CSSStyleDeclaration} The computed style object for the element.
   */
  static css(el) {
    const elem = TinyHtml._preElem(el, 'css');
    return window.getComputedStyle(elem);
  }

  /**
   * Returns the full computed CSS styles for the given element.
   *
   * @returns {CSSStyleDeclaration} The computed style object for the element.
   */
  css() {
    return TinyHtml.css(this);
  }

  /**
   * Returns the value of a specific computed CSS property from the given element as a string.
   *
   * @param {TinyElement} el - The element to retrieve the style property from.
   * @param {string} prop - The name of the CSS property (camelCase or kebab-case).
   * @returns {string|null} The value of the CSS property as a string, or null if not found or invalid.
   */
  static cssString(el, prop) {
    const elem = TinyHtml._preElem(el, 'cssString');
    if (typeof prop !== 'string') throw new TypeError('The prop must be a string.');
    // @ts-ignore
    const val = window.getComputedStyle(elem)[prop];
    return typeof val === 'string' ? val : typeof val === 'number' ? val.toString() : null;
  }

  /**
   * Returns the value of a specific computed CSS property from the given element as a string.
   *
   * @param {string} prop - The name of the CSS property (camelCase or kebab-case).
   * @returns {string|null} The value of the CSS property as a string, or null if not found or invalid.
   */
  cssString(prop) {
    return TinyHtml.cssString(this, prop);
  }

  /**
   * Returns a subset of computed CSS styles based on the given list of properties.
   *
   * @param {TinyElement} el - The element to retrieve styles from.
   * @param {string[]} prop - An array of CSS property names to retrieve.
   * @returns {Partial<CSSStyleDeclaration>} An object containing the requested styles.
   */
  static cssList(el, prop) {
    const elem = TinyHtml._preElem(el, 'cssList');
    if (!Array.isArray(prop)) throw new TypeError('The prop must be an array of strings.');

    const css = window.getComputedStyle(elem);
    /** @type {Partial<CSSStyleDeclaration>} */
    const result = {};

    for (const p of prop) {
      if (typeof p !== 'undefined') {
        // @ts-ignore
        result[p] = css.getPropertyValue(p);
      }
    }

    return result;
  }

  /**
   * Returns a subset of computed CSS styles based on the given list of properties.
   *
   * @param {string[]} prop - An array of CSS property names to retrieve.
   * @returns {Partial<CSSStyleDeclaration>} An object containing the requested styles.
   */
  cssList(prop) {
    return TinyHtml.cssList(this, prop);
  }

  /**
   * Returns the computed CSS float value of a property.
   * @param {TinyElement} el - The element to inspect.
   * @param {string} prop - The CSS property.
   * @returns {number} - The parsed float value.
   */
  static cssFloat(el, prop) {
    const elem = TinyHtml._preElem(el, 'cssFloat');
    if (typeof prop !== 'string') throw new TypeError('The prop must be a string.');
    // @ts-ignore
    const val = window.getComputedStyle(elem)[prop];
    return parseFloat(val) || 0;
  }

  /**
   * Returns the computed CSS float value of a property.
   * @param {string} prop - The CSS property.
   * @returns {number} - The parsed float value.
   */
  cssFloat(prop) {
    return TinyHtml.cssFloat(this, prop);
  }

  /**
   * Returns computed float values of multiple CSS properties.
   * @param {TinyElement} el - The element to inspect.
   * @param {string[]} prop - An array of CSS properties.
   * @returns {Record<string, number>} - Map of property to float value.
   */
  static cssFloats(el, prop) {
    const elem = TinyHtml._preElem(el, 'cssFloats');
    if (!Array.isArray(prop)) throw new TypeError('The prop must be an array of strings.');
    const css = window.getComputedStyle(elem);
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
    return TinyHtml.cssFloats(this, prop);
  }

  //////////////////////////////////////////////////////////////////////

  /**
   * Stores camelCase to kebab-case CSS property aliases.
   *
   * Used to normalize property names when interacting with `element.style` or `getComputedStyle`.
   *
   * ⚠️ This object should not be modified directly. Use `TinyHtml.cssPropAliases` instead to ensure reverse mappings stay in sync.
   *
   * Example of how to add a new alias:
   *
   * ```js
   * TinyHtml.cssPropAliases.tinyPudding = 'tiny-pudding';
   * ```
   *
   * This will automatically update `TinyHtml.cssPropRevAliases['tiny-pudding']` with `'tinyPudding'`.
   *
   * @type {Record<string | symbol, string>}
   */
  static #cssPropAliases = {
    backgroundColor: 'background-color',
    borderTopLeftRadius: 'border-top-left-radius',
    borderTopRightRadius: 'border-top-right-radius',
    borderBottomLeftRadius: 'border-bottom-left-radius',
    borderBottomRightRadius: 'border-bottom-right-radius',
    borderColor: 'border-color',
    borderWidth: 'border-width',
    borderStyle: 'border-style',
    flexDirection: 'flex-direction',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    justifyContent: 'justify-content',
    lineHeight: 'line-height',
    marginTop: 'margin-top',
    marginBottom: 'margin-bottom',
    marginLeft: 'margin-left',
    marginRight: 'margin-right',
    maxHeight: 'max-height',
    maxWidth: 'max-width',
    minHeight: 'min-height',
    minWidth: 'min-width',
    overflowX: 'overflow-x',
    overflowY: 'overflow-y',
    paddingTop: 'padding-top',
    paddingBottom: 'padding-bottom',
    paddingLeft: 'padding-left',
    paddingRight: 'padding-right',
    textAlign: 'text-align',
    textDecoration: 'text-decoration',
    zIndex: 'z-index',
  };

  /** @type {Record<string | symbol, string>} */
  static cssPropAliases = new Proxy(TinyHtml.#cssPropAliases, {
    set(target, camelCaseKey, kebabValue) {
      target[camelCaseKey] = kebabValue;
      // @ts-ignore
      TinyHtml.cssPropRevAliases[kebabValue] = camelCaseKey;
      return true;
    },
  });

  /** @type {Record<string | symbol, string>} */
  static cssPropRevAliases = Object.fromEntries(
    Object.entries(TinyHtml.#cssPropAliases).map(([camel, kebab]) => [kebab, camel]),
  );

  /**
   * Converts a camelCase string to kebab-case
   * @param {string} str
   * @returns {string}
   */
  static toStyleKc(str) {
    if (typeof TinyHtml.cssPropAliases[str] === 'string') return TinyHtml.cssPropAliases[str];
    return str;
  }

  /**
   * Converts a kebab-case string to camelCase
   * @param {string} str
   * @returns {string}
   */
  static toStyleCc(str) {
    if (typeof TinyHtml.cssPropRevAliases[str] === 'string') return TinyHtml.cssPropRevAliases[str];
    return str;
  }

  /**
   * Sets one or more CSS inline style properties on the given element(s).
   *
   * - If `prop` is a string, the `value` will be applied to that property.
   * - If `prop` is an object, each key-value pair will be applied as a CSS property and value.
   *
   * @param {TinyHtmlElement|TinyHtmlElement[]} el - The element to inspect.
   * @param {string|Object} prop - The property name or an object with key-value pairs
   * @param {string|null} [value=null] - The value to set (if `prop` is a string)
   */
  static setStyle(el, prop, value = null) {
    TinyHtml._preHtmlElems(el, 'setStyle').forEach((elem) => {
      if (typeof prop === 'object') {
        for (const [k, v] of Object.entries(prop)) {
          elem.style.setProperty(
            TinyHtml.toStyleKc(k),
            typeof v === 'string' ? v : typeof v === 'number' ? `${v}px` : String(v),
          );
        }
      } else elem.style.setProperty(TinyHtml.toStyleKc(prop), value);
    });
  }

  /**
   * Gets the value of a specific inline style property.
   *
   * Returns only the value set directly via the `style` attribute.
   *
   * @param {TinyHtmlElement|TinyHtmlElement[]} el - A single element to inspect.
   * @param {string} prop - The style property name to retrieve.
   * @returns {string} The style value of the specified property.
   */
  static getStyle(el, prop) {
    return TinyHtml._preHtmlElem(el, 'getStyle').style.getPropertyValue(TinyHtml.toStyleKc(prop));
  }

  /**
   * Gets all inline styles defined directly on the element (`style` attribute).
   *
   * Returns an object with all property-value pairs in kebab-case format.
   *
   * @param {TinyHtmlElement|TinyHtmlElement[]} el - A single element to inspect.
   * @returns {Record<string, string>} All inline styles as an object.
   */
  static style(el, camelCase = false) {
    const elem = TinyHtml._preHtmlElem(el, 'style');
    const styles = elem.style;
    /** @type {Record<string, string>} */
    const result = {};

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i]; // Already in kebab-case
      const value = styles.getPropertyValue(prop);
      result[camelCase ? TinyHtml.toStyleCc(prop) : prop] = value;
    }

    return result;
  }

  /**
   * Removes one or more inline CSS properties from the given element(s).
   *
   * @param {TinyHtmlElement|TinyHtmlElement[]} el - A single element or an array of elements.
   * @param {string|string[]} prop - A property name or an array of property names to remove.
   */
  static removeStyle(el, prop) {
    TinyHtml._preHtmlElems(el, 'removeStyle').forEach((elem) => {
      if (Array.isArray(prop)) {
        for (const p of prop) {
          elem.style.removeProperty(TinyHtml.toStyleKc(p));
        }
      } else elem.style.removeProperty(TinyHtml.toStyleKc(prop));
    });
  }

  /**
   * Toggles a CSS property value between two given values.
   *
   * The current computed value is compared to `val1`. If it matches, the property is set to `val2`. Otherwise, it is set to `val1`.
   *
   * @param {TinyHtmlElement|TinyHtmlElement[]} el - A single element or an array of elements.
   * @param {string} prop - The CSS property to toggle.
   * @param {string} val1 - The first value (used as "current" check).
   * @param {string} val2 - The second value (used as the "alternative").
   */
  static toggleStyle(el, prop, val1, val2) {
    TinyHtml._preHtmlElems(el, 'toggleStyle').forEach((elem) => {
      const current = TinyHtml.getStyle(elem, prop).trim();
      const newVal = current === TinyHtml.toStyleKc(val1) ? val2 : val1;
      TinyHtml.setStyle(elem, prop, newVal);
    });
  }

  /**
   * Removes all inline styles (`style` attribute) from the given element(s).
   *
   * @param {TinyElement|TinyElement[]} el - A single element or an array of elements.
   */
  static clearStyle(el) {
    TinyHtml._preElems(el, 'clearStyle').forEach((elem) => elem.removeAttribute('style'));
  }

  //////////////////////////////////////////////////////////////////////

  /**
   * Focus the element.
   *
   * @param {TinyHtmlElement} el - The element or a selector string.
   */
  static focus(el) {
    const elem = TinyHtml._preHtmlElem(el, 'focus');
    elem.focus();
  }

  /**
   * Focus the element.
   */
  focus() {
    return TinyHtml.focus(this);
  }

  /**
   * Blur the element.
   *
   * @param {TinyHtmlElement} el - The element or a selector string.
   */
  static blur(el) {
    const elem = TinyHtml._preHtmlElem(el, 'blur');
    elem.blur();
  }

  /**
   * Blur the element.
   */
  blur() {
    return TinyHtml.blur(this);
  }

  //////////////////////////////////////////////////////////////////////

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
   * @param {TinyElementAndWindow} el - The element or window.
   * @param {"width"|"height"} type - Dimension type.
   * @param {"content"|"padding"|"border"|"margin"} [extra='content'] - Box model context.
   * @returns {number} - Computed dimension.
   * @throws {TypeError} If `type` or `extra` is not a string.
   */
  static getDimension(el, type, extra = 'content') {
    const elem = TinyHtml._preElemAndWindow(el, 'getDimension');
    if (typeof type !== 'string') throw new TypeError('The type must be a string.');
    if (typeof extra !== 'string') throw new TypeError('The extra must be a string.');

    const name = type === 'width' ? 'Width' : 'Height';

    if (TinyHtml.isWindow(elem)) {
      return extra === 'margin'
        ? // @ts-ignore
          elem['inner' + name]
        : // @ts-ignore
          elem.document.documentElement['client' + name];
    }
    /** @type {Element} */
    const elHtml = elem;

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
    return TinyHtml.getDimension(this, type, extra);
  }

  /**
   * Sets the height of the element.
   * @param {TinyHtmlElement} el - Target element.
   * @param {string|number} value - Height value.
   * @throws {TypeError} If `value` is neither a string nor number.
   */
  static setHeight(el, value) {
    const elem = TinyHtml._preHtmlElem(el, 'setHeight');
    if (typeof value !== 'number' && typeof value !== 'string')
      throw new TypeError('The value must be a string or number.');
    elem.style.height = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * Sets the height of the element.
   * @param {string|number} value - Height value.
   */
  setHeight(value) {
    return TinyHtml.setHeight(this, value);
  }

  /**
   * Sets the width of the element.
   * @param {TinyHtmlElement} el - Target element.
   * @param {string|number} value - Width value.
   * @throws {TypeError} If `value` is neither a string nor number.
   */
  static setWidth(el, value) {
    const elem = TinyHtml._preHtmlElem(el, 'setWidth');
    if (typeof value !== 'number' && typeof value !== 'string')
      throw new TypeError('The value must be a string or number.');
    elem.style.width = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * Sets the width of the element.
   * @param {string|number} value - Width value.
   */
  setWidth(value) {
    return TinyHtml.setWidth(this, value);
  }

  /**
   * Returns content box height.
   * @param {TinyElementAndWindow} el - Target element.
   * @returns {number}
   */
  static height(el) {
    const elem = TinyHtml._preElemAndWindow(el, 'height');
    return TinyHtml.getDimension(elem, 'height', 'content');
  }

  /**
   * Returns content box height.
   * @returns {number}
   */
  height() {
    return TinyHtml.height(this);
  }

  /**
   * Returns content box width.
   * @param {TinyElementAndWindow} el - Target element.
   * @returns {number}
   */
  static width(el) {
    const elem = TinyHtml._preElemAndWindow(el, 'width');
    return TinyHtml.getDimension(elem, 'width', 'content');
  }

  /**
   * Returns content box width.
   * @returns {number}
   */
  width() {
    return TinyHtml.width(this);
  }

  /**
   * Returns padding box height.
   * @param {TinyElementAndWindow} el - Target element.
   * @returns {number}
   */
  static innerHeight(el) {
    const elem = TinyHtml._preElemAndWindow(el, 'innerHeight');
    return TinyHtml.getDimension(elem, 'height', 'padding');
  }

  /**
   * Returns padding box height.
   * @returns {number}
   */
  innerHeight() {
    return TinyHtml.innerHeight(this);
  }

  /**
   * Returns padding box width.
   * @param {TinyElementAndWindow} el - Target element.
   * @returns {number}
   */
  static innerWidth(el) {
    const elem = TinyHtml._preElemAndWindow(el, 'innerWidth');
    return TinyHtml.getDimension(elem, 'width', 'padding');
  }

  /**
   * Returns padding box width.
   * @returns {number}
   */
  innerWidth() {
    return TinyHtml.innerWidth(this);
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {TinyElementAndWindow} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerHeight(el, includeMargin = false) {
    if (typeof includeMargin !== 'boolean')
      throw new TypeError('The "includeMargin" must be a boolean.');
    const elem = TinyHtml._preElemAndWindow(el, 'outerHeight');
    return TinyHtml.getDimension(elem, 'height', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer height of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerHeight(includeMargin) {
    return TinyHtml.outerHeight(this, includeMargin);
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {TinyElementAndWindow} el - Target element.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  static outerWidth(el, includeMargin = false) {
    if (typeof includeMargin !== 'boolean')
      throw new TypeError('The "includeMargin" must be a boolean.');
    const elem = TinyHtml._preElemAndWindow(el, 'outerWidth');
    return TinyHtml.getDimension(elem, 'width', includeMargin ? 'margin' : 'border');
  }

  /**
   * Returns outer width of the element, optionally including margin.
   * @param {boolean} [includeMargin=false] - Whether to include margin.
   * @returns {number}
   */
  outerWidth(includeMargin) {
    return TinyHtml.outerWidth(this, includeMargin);
  }

  //////////////////////////////////////////////////

  /**
   * Gets the offset of the element relative to the document.
   * @param {TinyElement} el - Target element.
   * @returns {{top: number, left: number}}
   */
  static offset(el) {
    const elem = TinyHtml._preElem(el, 'offset');
    const rect = elem.getBoundingClientRect();
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
    return TinyHtml.offset(this);
  }

  /**
   * Gets the position of the element relative to its offset parent.
   * @param {TinyHtmlElement} el - Target element.
   * @returns {{top: number, left: number}}
   */
  static position(el) {
    const elem = TinyHtml._preHtmlElem(el, 'position');

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
    return TinyHtml.position(this);
  }

  /**
   * Gets the closest positioned ancestor element.
   * @param {TinyHtmlElement} el - Target element.
   * @returns {HTMLElement} - Offset parent element.
   */
  static offsetParent(el) {
    const elem = TinyHtml._preHtmlElem(el, 'offsetParent');
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
    return TinyHtml.offsetParent(this);
  }

  /**
   * Gets the vertical scroll position.
   * @param {TinyElementAndWindow} el - Element or window.
   * @returns {number}
   */
  static scrollTop(el) {
    const elem = TinyHtml._preElemAndWindow(el, 'scrollTop');
    if (TinyHtml.isWindow(elem)) return elem.pageYOffset;
    // @ts-ignore
    if (elem.nodeType === 9) return elem.defaultView.pageYOffset;
    return elem.scrollTop;
  }

  /**
   * Gets the vertical scroll position.
   * @returns {number}
   */
  scrollTop() {
    return TinyHtml.scrollTop(this);
  }

  /**
   * Gets the horizontal scroll position.
   * @param {TinyElementAndWindow} el - Element or window.
   * @returns {number}
   */
  static scrollLeft(el) {
    const elem = TinyHtml._preElemAndWindow(el, 'scrollLeft');
    if (TinyHtml.isWindow(elem)) return elem.pageXOffset;
    // @ts-ignore
    if (elem.nodeType === 9) return elem.defaultView.pageXOffset;
    return elem.scrollLeft;
  }

  /**
   * Gets the horizontal scroll position.
   * @returns {number}
   */
  scrollLeft() {
    return TinyHtml.scrollLeft(this);
  }

  /**
   * Sets the vertical scroll position.
   * @param {TinyElementAndWindow|TinyElementAndWindow[]} el - Element or window.
   * @param {number} value - Scroll top value.
   */
  static setScrollTop(el, value) {
    if (typeof value !== 'number') throw new TypeError('ScrollTop value must be a number.');
    TinyHtml._preElemsAndWindow(el, 'setScrollTop').forEach((elem) => {
      if (TinyHtml.isWindow(elem)) {
        elem.scrollTo(elem.pageXOffset, value);
      } else if (elem.nodeType === 9) {
        // @ts-ignore
        elem.defaultView.scrollTo(elem.defaultView.pageXOffset, value);
      } else {
        elem.scrollTop = value;
      }
    });
  }

  /**
   * Sets the vertical scroll position.
   * @param {number} value - Scroll top value.
   */
  setScrollTop(value) {
    return TinyHtml.setScrollTop(this, value);
  }

  /**
   * Sets the horizontal scroll position.
   * @param {TinyElementAndWindow|TinyElementAndWindow[]} el - Element or window.
   * @param {number} value - Scroll left value.
   */
  static setScrollLeft(el, value) {
    if (typeof value !== 'number') throw new TypeError('ScrollLeft value must be a number.');
    TinyHtml._preElemsAndWindow(el, 'setScrollLeft').forEach((elem) => {
      if (TinyHtml.isWindow(elem)) {
        elem.scrollTo(value, elem.pageYOffset);
      } else if (elem.nodeType === 9) {
        // @ts-ignore
        elem.defaultView.scrollTo(value, elem.defaultView.pageYOffset);
      } else {
        elem.scrollLeft = value;
      }
    });
  }

  /**
   * Sets the horizontal scroll position.
   * @param {number} value - Scroll left value.
   */
  setScrollLeft(value) {
    return TinyHtml.setScrollLeft(this, value);
  }

  /**
   * Returns the total border width and individual sides from `border{Side}Width` CSS properties.
   *
   * @param {TinyElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border widths, and each side individually.
   */
  static borderWidth(el) {
    const elem = TinyHtml._preElem(el, 'borderWidth');
    const {
      borderLeftWidth: left,
      borderRightWidth: right,
      borderTopWidth: top,
      borderBottomWidth: bottom,
    } = TinyHtml.cssFloats(elem, [
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
    return TinyHtml.borderWidth(this);
  }

  /**
   * Returns the total border size and individual sides from `border{Side}` CSS properties.
   *
   * @param {TinyElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border sizes, and each side individually.
   */
  static border(el) {
    const elem = TinyHtml._preElem(el, 'border');
    const {
      borderLeft: left,
      borderRight: right,
      borderTop: top,
      borderBottom: bottom,
    } = TinyHtml.cssFloats(elem, ['borderLeft', 'borderRight', 'borderTop', 'borderBottom']);
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
    return TinyHtml.border(this);
  }

  /**
   * Returns the total margin and individual sides from `margin{Side}` CSS properties.
   *
   * @param {TinyElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) margins, and each side individually.
   */
  static margin(el) {
    const elem = TinyHtml._preElem(el, 'margin');
    const {
      marginLeft: left,
      marginRight: right,
      marginTop: top,
      marginBottom: bottom,
    } = TinyHtml.cssFloats(elem, ['marginLeft', 'marginRight', 'marginTop', 'marginBottom']);
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
    return TinyHtml.margin(this);
  }

  /**
   * Returns the total padding and individual sides from `padding{Side}` CSS properties.
   *
   * @param {TinyElement} el - The target DOM element.
   * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) paddings, and each side individually.
   */
  static padding(el) {
    const elem = TinyHtml._preElem(el, 'padding');
    const {
      paddingLeft: left,
      paddingRight: right,
      paddingTop: top,
      paddingBottom: bottom,
    } = TinyHtml.cssFloats(elem, ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']);
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
    return TinyHtml.padding(this);
  }

  /////////////////////////////////////////////

  /**
   * Adds one or more CSS class names to the element.
   * @type {(el: TinyElement|TinyElement[], ...tokens: string[]) => void} - One or more class names to add.
   */
  static addClass(el, ...args) {
    TinyHtml._preElems(el, 'addClass').forEach((elem) => elem.classList.add(...args));
  }

  /**
   * Adds one or more CSS class names to the element.
   * @type {(...tokens: string[]) => void} - One or more class names to add.
   */
  addClass(...args) {
    return TinyHtml.addClass(this, ...args);
  }

  /**
   * Removes one or more CSS class names from the element.
   * @type {(el: TinyElement|TinyElement[], ...tokens: string[]) => void} - One or more class names to remove.
   */
  static removeClass(el, ...args) {
    TinyHtml._preElems(el, 'removeClass').forEach((elem) => elem.classList.remove(...args));
  }

  /**
   * Removes one or more CSS class names from the element.
   * @type {(...tokens: string[]) => void} - One or more class names to remove.
   */
  removeClass(...args) {
    return TinyHtml.removeClass(this, ...args);
  }

  /**
   * Replaces an existing class name with a new one.
   * @param {TinyElement|TinyElement[]} el - Target element.
   * @param {string} token - The class name to be replaced.
   * @param {string} newToken - The new class name to apply.
   * @returns {boolean[]} Whether the replacement was successful.
   * @throws {TypeError} If either argument is not a string.
   */
  static replaceClass(el, token, newToken) {
    if (typeof token !== 'string') throw new TypeError('The "token" parameter must be a string.');
    if (typeof newToken !== 'string')
      throw new TypeError('The "newToken" parameter must be a string.');
    /** @type {boolean[]} */
    const result = [];
    TinyHtml._preElems(el, 'replaceClass').forEach((elem) =>
      result.push(elem.classList.replace(token, newToken)),
    );
    return result;
  }

  /**
   * Replaces an existing class name with a new one.
   * @param {string} token - The class name to be replaced.
   * @param {string} newToken - The new class name to apply.
   * @returns {boolean} Whether the replacement was successful.
   * @throws {TypeError} If either argument is not a string.
   */
  replaceClass(token, newToken) {
    return TinyHtml.replaceClass(this, token, newToken)[0];
  }

  /**
   * Returns the class name at the specified index.
   * @param {TinyElement} el - Target element.
   * @param {number} index - The index of the class name.
   * @returns {string|null} The class name at the index or null if not found.
   * @throws {TypeError} If the index is not a number.
   */
  static classItem(el, index) {
    const elem = TinyHtml._preElem(el, 'classItem');
    if (typeof index !== 'number') throw new TypeError('The "index" parameter must be a number.');
    return elem.classList.item(index);
  }

  /**
   * Returns the class name at the specified index.
   * @param {number} index - The index of the class name.
   * @returns {string|null} The class name at the index or null if not found.
   * @throws {TypeError} If the index is not a number.
   */
  classItem(index) {
    return TinyHtml.classItem(this, index);
  }

  /**
   * Toggles a class name on the element with an optional force boolean.
   * @param {TinyElement|TinyElement[]} el - Target element.
   * @param {string} token - The class name to toggle.
   * @param {boolean} [force] - If true, adds the class; if false, removes it.
   * @returns {boolean[]} Whether the class is present after the toggle.
   * @throws {TypeError} If token is not a string or force is not a boolean.
   */
  static toggleClass(el, token, force) {
    if (typeof token !== 'string') throw new TypeError('The "token" parameter must be a string.');
    if (typeof force !== 'undefined' && typeof force !== 'boolean')
      throw new TypeError('The "force" parameter must be a boolean.');
    /** @type {boolean[]} */
    const result = [];
    TinyHtml._preElems(el, 'toggleClass').forEach((elem) =>
      result.push(elem.classList.toggle(token, force)),
    );
    return result;
  }

  /**
   * Toggles a class name on the element with an optional force boolean.
   * @param {string} token - The class name to toggle.
   * @param {boolean} force - If true, adds the class; if false, removes it.
   * @returns {boolean} Whether the class is present after the toggle.
   * @throws {TypeError} If token is not a string or force is not a boolean.
   */
  toggleClass(token, force) {
    return TinyHtml.toggleClass(this, token, force)[0];
  }

  /**
   * Checks if the element contains the given class name.
   * @param {TinyElement} el - Target element.
   * @param {string} token - The class name to check.
   * @returns {boolean} True if the class is present, false otherwise.
   * @throws {TypeError} If token is not a string.
   */
  static hasClass(el, token) {
    const elem = TinyHtml._preElem(el, 'hasClass');
    if (typeof token !== 'string') throw new TypeError('The "token" parameter must be a string.');
    return elem.classList.contains(token);
  }

  /**
   * Checks if the element contains the given class name.
   * @param {string} token - The class name to check.
   * @returns {boolean} True if the class is present, false otherwise.
   * @throws {TypeError} If token is not a string.
   */
  hasClass(token) {
    return TinyHtml.hasClass(this, token);
  }

  /**
   * Returns the number of classes applied to the element.
   * @param {TinyElement} el - Target element.
   * @returns {number} The number of classes.
   */
  static classLength(el) {
    const elem = TinyHtml._preElem(el, 'classLength');
    return elem.classList.length;
  }

  /**
   * Returns the number of classes applied to the element.
   * @returns {number} The number of classes.
   */
  classLength() {
    return TinyHtml.classLength(this);
  }

  /**
   * Returns all class names as an array of strings.
   * @param {TinyElement} el - Target element.
   * @returns {string[]} An array of class names.
   */
  static classList(el) {
    const elem = TinyHtml._preElem(el, 'classList');
    return elem.classList.values().toArray();
  }

  /**
   * Returns all class names as an array of strings.
   * @returns {string[]} An array of class names.
   */
  classList() {
    return TinyHtml.classList(this);
  }

  /////////////////////////////////////////

  /**
   * Returns the tag name of the element.
   * @param {TinyElement} el - Target element.
   * @returns {string} The tag name in uppercase.
   */
  static tagName(el) {
    const elem = TinyHtml._preElem(el, 'tagName');
    return elem.tagName;
  }

  /**
   * Returns the tag name of the element.
   * @returns {string} The tag name in uppercase.
   */
  tagName() {
    return TinyHtml.tagName(this);
  }

  /**
   * Returns the ID of the element.
   * @param {TinyElement} el - Target element.
   * @returns {string} The element's ID.
   */
  static id(el) {
    const elem = TinyHtml._preElem(el, 'id');
    return elem.id;
  }

  /**
   * Returns the ID of the element.
   * @returns {string} The element's ID.
   */
  id() {
    return TinyHtml.id(this);
  }

  /**
   * Returns the text content of the element.
   * @param {TinyElement} el - Target element.
   * @returns {string|null} The text content or null if none.
   */
  static text(el) {
    const elem = TinyHtml._preElem(el, 'text');
    return elem.textContent;
  }

  /**
   * Returns the text content of the element.
   * @returns {string|null} The text content or null if none.
   */
  text() {
    return TinyHtml.text(this);
  }

  /**
   * Set text content of elements.
   * @param {TinyElement|TinyElement[]} el
   * @param {string} value
   */
  static setText(el, value) {
    if (typeof value !== 'string') throw new Error('Value is not a valid string.');
    TinyHtml._preElems(el, 'setText').forEach((el) => (el.textContent = value));
  }

  /**
   * Set text content of the element.
   * @param {string} value
   */
  setText(value) {
    return TinyHtml.setText(this, value);
  }

  /**
   * Remove all child nodes from each element.
   * @param {TinyElement|TinyElement[]} el
   */
  static empty(el) {
    TinyHtml._preElems(el, 'empty').forEach((el) => (el.textContent = ''));
  }

  /**
   * Remove all child nodes of the element.
   */
  empty() {
    return TinyHtml.empty(this);
  }

  /**
   * Get the innerHTML of the element.
   * @param {TinyElement|TinyElement[]} el
   * @returns {string}
   */
  static html(el) {
    const elem = TinyHtml._preElem(el, 'html');
    return elem.innerHTML;
  }

  /**
   * Get the innerHTML of the element.
   * @returns {string}
   */
  html() {
    return TinyHtml.html(this);
  }

  /**
   * Set the innerHTML of each element.
   * @param {TinyElement|TinyElement[]} el
   * @param {string} value
   */
  static setHtml(el, value) {
    if (typeof value !== 'string') throw new Error('Value is not a valid string.');
    TinyHtml._preElems(el, 'setHtml').forEach((el) => (el.innerHTML = value));
  }

  /**
   * Set the innerHTML of the element.
   * @param {string} value
   */
  setHtml(value) {
    return TinyHtml.setHtml(this, value);
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
   * @param {TinyInputElement|TinyInputElement[]} el - Target element.
   * @param {SetValueList|((el: InputElement, val: SetValueList) => SetValueList)} value - The value to assign or a function that returns it.
   * @throws {Error} If the computed value is not a valid string or boolean.
   */
  static setVal(el, value) {
    TinyHtml._preInputElems(el, 'setVal').forEach((elem) => {
      /**
       * @param {SetValueBase[]} array
       * @param {(v: SetValueBase, i: number) => SetValueBase} callback
       */
      const mapArray = (array, callback) => {
        const result = [];
        for (let i = 0; i < array.length; i++) {
          result.push(callback(array[i], i));
        }
        return result;
      };

      if (elem.nodeType !== 1) return;
      /** @type {SetValueList} */
      let valToSet = typeof value === 'function' ? value(elem, TinyHtml.val(elem)) : value;

      if (valToSet == null) {
        valToSet = '';
      } else if (typeof valToSet === 'number') {
        valToSet = String(valToSet);
      } else if (Array.isArray(valToSet)) {
        valToSet = mapArray(valToSet, (v) => (v == null ? '' : String(v)));
      }

      // @ts-ignore
      const hook = TinyHtml._valHooks[elem.type] || TinyHtml._valHooks[elem.nodeName.toLowerCase()];
      if (
        !hook ||
        typeof hook.set !== 'function' ||
        hook.set(elem, valToSet, 'value') === undefined
      ) {
        if (typeof valToSet !== 'string' && typeof valToSet !== 'boolean')
          throw new Error(`Invalid setValue "${typeof valToSet}" value.`);
        if (typeof valToSet === 'string') elem.value = valToSet;
      }
    });
  }

  /**
   * Sets the value of the current HTML value element (input, select, textarea, etc.).
   * Accepts strings, numbers, booleans or arrays of these values, or a callback function that computes them.
   *
   * @param {SetValueList|((el: InputElement, val: SetValueList) => SetValueList)} value - The value to assign or a function that returns it.
   * @throws {Error} If the computed value is not a valid string or boolean.
   */
  setVal(value) {
    return TinyHtml.setVal(this, value);
  }

  /**
   * Maps value types to their corresponding getter functions.
   * Each function extracts a value of a specific type from a compatible HTMLInputElement.
   * @readonly
   */
  static _valTypes = {
    /**
     * Gets the string value from any HTMLInputElement.
     * @type {(elem: HTMLInputElement) => string}
     */
    string: (elem) => elem.value,

    /**
     * Gets the value as a Date object from supported input types.
     * Valid only for types: "date", "datetime-local", "month", "time", "week".
     * Returns `null` if the field is empty or invalid.
     * @type {(elem: HTMLInputElement & { type: "date" | "datetime-local" | "month" | "time" | "week" }) => Date | null}
     */
    date: (elem) => elem.valueAsDate,

    /**
     * Gets the numeric value from supported input types.
     * Valid for types: "number", "range", "date", "time".
     * Returns `NaN` if the value is invalid or empty.
     * @type {(elem: HTMLInputElement & { type: "number" | "range" | "date" | "time" }) => number}
     */
    number: (elem) => elem.valueAsNumber,
  };

  /**
   * Gets the value of an input element according to the specified type.
   *
   * @param {InputElement} elem - The input element to extract the value from.
   * @param {GetValueTypes} type - The type of value to retrieve ("string", "date", or "number").
   * @param {string} where - The context/method name using this validation.
   * @returns {any} The extracted value, depending on the type.
   * @throws {Error} If the element is not an HTMLInputElement or if the type handler is invalid.
   * @readonly
   */
  static _getValByType(elem, type, where) {
    if (typeof type !== 'string') throw new TypeError('The "type" must be a string.');
    if (typeof where !== 'string') throw new TypeError('The "where" must be a string.');
    if (!(elem instanceof HTMLInputElement))
      throw new Error(`Provided element is not an HTMLInputElement in ${where}().`);
    if (typeof TinyHtml._valTypes[type] !== 'function')
      throw new Error(`No handler found for type "${type}" in ${where}().`);
    // @ts-ignore
    return TinyHtml._valTypes[type](elem);
  }

  /**
   * Retrieves the raw value from the HTML input element.
   * If a custom value hook exists, it will be used first.
   *
   * @param {TinyInputElement} el - Target element.
   * @param {GetValueTypes} type - The type of value to retrieve ("string", "date", or "number").
   * @param {string} where - The context/method name using this validation.
   * @returns {any} The raw value retrieved from the element or hook.
   * @readonly
   */
  static _val(el, where, type) {
    const elem = TinyHtml._preInputElem(el, where);
    // @ts-ignore
    const hook = TinyHtml._valHooks[elem.type] || TinyHtml._valHooks[elem.nodeName.toLowerCase()];
    if (hook && typeof hook.get === 'function') {
      const ret = hook.get(elem, 'value', type);
      if (ret !== undefined) return typeof ret === 'string' ? ret.replace(/\r/g, '') : ret;
    }

    return TinyHtml._getValByType(elem, type, where);
  }

  /**
   * Retrieves the raw value from the HTML input element.
   * If a custom value hook exists, it will be used first.
   *
   * @param {GetValueTypes} type - The type of value to retrieve ("string", "date", or "number").
   * @param {string} where - The context/method name using this validation.
   * @returns {any} The raw value retrieved from the element or hook.
   * @readonly
   */
  _val(where, type) {
    return TinyHtml._val(this, where, type);
  }

  /**
   * Gets the value of the current HTML value element.
   *
   * @param {TinyInputElement} el - Target element.
   * @returns {SetValueList} The normalized value, with carriage returns removed.
   */
  static val(el) {
    return /** @type {SetValueList} */ (TinyHtml._val(el, 'val', 'string'));
  }

  /**
   * Gets the value of the current HTML value element.
   *
   * @returns {SetValueList} The normalized value, with carriage returns removed.
   */
  val() {
    return TinyHtml.val(this);
  }

  /**
   * Gets the text of the current HTML value element (for text).
   *
   * @param {TinyInputElement} el - Target element.
   * @returns {string} The text value.
   * @throws {Error} If the element is not a string value.
   */
  static valTxt(el) {
    /** @type {string} */
    const ret = TinyHtml._val(el, 'valTxt', 'string');
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
    return TinyHtml.valTxt(this);
  }

  /**
   * Internal helper to get a value from an input expected to return an array.
   *
   * @param {TinyInputElement} el - Target element.
   * @param {string} where - The method name or context using this validation (for error reporting).
   * @param {GetValueTypes} type - The type of value to retrieve ("string", "date", or "number").
   * @returns {SetValueBase[]} - The validated value as an array.
   * @throws {Error} If the returned value is not an array.
   * @readonly
   */
  static _valArr(el, where, type) {
    /** @type {SetValueBase[]} */
    const ret = TinyHtml._val(el, where, type);
    if (!Array.isArray(ret)) throw new Error(`Value expected an array but got ${typeof ret}.`);
    return ret;
  }

  /**
   * Internal helper to get a value from an input expected to return an array.
   *
   * @param {string} where - The method name or context using this validation (for error reporting).
   * @param {GetValueTypes} type - The type of value to retrieve ("string", "date", or "number").
   * @returns {SetValueBase[]} - The validated value as an array.
   * @throws {Error} If the returned value is not an array.
   * @readonly
   */
  _valArr(where, type) {
    return TinyHtml._valArr(this, where, type);
  }

  /**
   * Gets the raw value as a generic array of the current HTML value element (for select).
   *
   * @param {TinyInputElement} el - Target element.
   * @returns {SetValueBase[]} - The value cast as a generic array.
   * @throws {Error} If the value is not a valid array.
   */
  static valArr(el) {
    return TinyHtml._valArr(el, 'valArr', 'string');
  }

  /**
   * Gets the raw value as a generic array of the current HTML value element (for select).
   *
   * @returns {SetValueBase[]} - The value cast as a generic array.
   * @throws {Error} If the value is not a valid array.
   */
  valArr() {
    return TinyHtml.valArr(this);
  }

  /**
   * Gets the current value parsed as a number (for number/text).
   *
   * @param {TinyInputElement} el - Target element.
   * @returns {number} The numeric value.
   * @throws {Error} If the element is not a number-compatible input or value is NaN.
   */
  static valNb(el) {
    const elem = TinyHtml._preInputElem(el, 'valNb');
    if (!(elem instanceof HTMLInputElement)) throw new Error('Element must be an input element.');
    /** @type {number} */
    const result = TinyHtml._val(el, 'valNb', 'number');
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
    return TinyHtml.valNb(this);
  }

  /**
   * Gets the current value parsed as a Date (for time/date).
   *
   * @param {TinyInputElement} el - Target element.
   * @returns {Date} The date value.
   * @throws {Error} If the element is not a date-compatible input.
   */
  static valDate(el) {
    const elem = TinyHtml._preInputElem(el, 'valDate');
    if (!(elem instanceof HTMLInputElement)) throw new Error('Element must be an input element.');
    /** @type {Date} */
    const result = TinyHtml._val(el, 'valDate', 'date');
    if (!(result instanceof Date)) throw new Error('Value is not a valid date.');
    return result;
  }

  /**
   * Gets the current value parsed as a Date (for time/date).
   *
   * @returns {Date} The date value.
   * @throws {Error} If the element is not a date-compatible input.
   */
  valDate() {
    return TinyHtml.valDate(this);
  }

  /**
   * Checks if the input element is boolean (for checkboxes/radios).
   *
   * @param {TinyInputElement} el - Target element.
   * @returns {boolean} True if the input is considered checked (value === "on"), false otherwise.
   * @throws {Error} If the element is not a checkbox/radio input.
   */
  static valBool(el) {
    const elem = TinyHtml._preInputElem(el, 'valBool');
    if (!(elem instanceof HTMLInputElement)) throw new Error('Element must be an input element.');
    return TinyHtml.val(elem) === 'on' ? true : false;
  }

  /**
   * Checks if the input element is boolean (for checkboxes/radios).
   *
   * @returns {boolean} True if the input is considered checked (value === "on"), false otherwise.
   * @throws {Error} If the element is not a checkbox/radio input.
   */
  valBool() {
    return TinyHtml.valBool(this);
  }

  ////////////////////////////////////////////

  /**
   * Registers an event listener on the specified element.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} el - The target to listen on.
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options] - Optional event listener options.
   */
  static on(el, event, handler, options) {
    if (typeof event !== 'string') throw new TypeError('The event name must be a string.');
    TinyHtml._preEventTargetElems(el, 'on').forEach((elem) => {
      elem.addEventListener(event, handler, options);

      if (!__eventRegistry.has(elem)) __eventRegistry.set(elem, {});
      const events = __eventRegistry.get(elem);
      if (!events) return;
      if (!Array.isArray(events[event])) events[event] = [];
      events[event].push({ handler, options });
    });
  }

  /**
   * Registers an event listener on the specified element.
   *
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options] - Optional event listener options.
   */
  on(event, handler, options) {
    return TinyHtml.on(this, event, handler, options);
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} el - The target to listen on.
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options={}] - Optional event listener options.
   */
  static once(el, event, handler, options = {}) {
    if (typeof event !== 'string') throw new TypeError('The event name must be a string.');
    TinyHtml._preEventTargetElems(el, 'once').forEach((elem) => {
      /** @type {EventRegistryHandle} e */
      const wrapped = (e) => {
        TinyHtml.off(elem, event, wrapped);
        handler(e);
      };

      TinyHtml.on(
        elem,
        event,
        wrapped,
        typeof options === 'boolean' ? options : { ...options, once: true },
      );
    });
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string} event - The event type (e.g. 'click', 'keydown').
   * @param {EventRegistryHandle} handler - The callback function to run on event.
   * @param {EventRegistryOptions} [options={}] - Optional event listener options.
   */
  once(event, handler, options = {}) {
    return TinyHtml.once(this, event, handler, options);
  }

  /**
   * Removes a specific event listener from an element.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} el - The target element.
   * @param {string} event - The event type.
   * @param {EventRegistryHandle} handler - The function originally bound to the event.
   * @param {boolean|EventListenerOptions} [options] - Optional listener options.
   */
  static off(el, event, handler, options) {
    if (typeof event !== 'string') throw new TypeError('The event name must be a string.');
    TinyHtml._preEventTargetElems(el, 'off').forEach((elem) => {
      elem.removeEventListener(event, handler, options);

      const events = __eventRegistry.get(elem);
      if (events && events[event]) {
        events[event] = events[event].filter((entry) => entry.handler !== handler);
        if (events[event].length === 0) delete events[event];
      }
    });
  }

  /**
   * Removes a specific event listener from an element.
   *
   * @param {string} event - The event type.
   * @param {EventRegistryHandle} handler - The function originally bound to the event.
   * @param {boolean|EventListenerOptions} [options] - Optional listener options.
   */
  off(event, handler, options) {
    return TinyHtml.off(this, event, handler, options);
  }

  /**
   * Removes all event listeners of a specific type from the element.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} el - The target element.
   * @param {string} event - The event type to remove (e.g. 'click').
   */
  static offAll(el, event) {
    if (typeof event !== 'string') throw new TypeError('The event name must be a string.');
    TinyHtml._preEventTargetElems(el, 'offAll').forEach((elem) => {
      const events = __eventRegistry.get(elem);
      if (events && events[event]) {
        for (const entry of events[event]) {
          elem.removeEventListener(event, entry.handler, entry.options);
        }
        delete events[event];
      }
    });
  }

  /**
   * Removes all event listeners of a specific type from the element.
   *
   * @param {string} event - The event type to remove (e.g. 'click').
   */
  offAll(event) {
    return TinyHtml.offAll(this, event);
  }

  /**
   * Removes all event listeners of all types from the element.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} el - The target element.
   * @param {((handler: EventListenerOrEventListenerObject, event: string) => boolean)|null} [filterFn=null] -
   *        Optional filter function to selectively remove specific handlers.
   */
  static offAllTypes(el, filterFn = null) {
    if (filterFn !== null && typeof filterFn !== 'function')
      throw new TypeError('The "filterFn" must be a function.');
    TinyHtml._preEventTargetElems(el, 'offAllTypes').forEach((elem) => {
      const events = __eventRegistry.get(elem);
      if (!events) return;

      for (const event in events) {
        for (const entry of events[event]) {
          if (typeof filterFn !== 'function' || filterFn(entry.handler, event)) {
            elem.removeEventListener(event, entry.handler, entry.options);
          }
        }
      }

      __eventRegistry.delete(elem);
    });
  }

  /**
   * Removes all event listeners of all types from the element.
   *
   * @param {((handler: EventListenerOrEventListenerObject, event: string) => boolean)|null} [filterFn=null] -
   *        Optional filter function to selectively remove specific handlers.
   */
  offAllTypes(filterFn = null) {
    return TinyHtml.offAllTypes(this, filterFn);
  }

  /**
   * Triggers all handlers associated with a specific event on the given element.
   *
   * @param {TinyEventTarget|TinyEventTarget[]} el - Target element where the event should be triggered.
   * @param {string} event - Name of the event to trigger.
   * @param {Event|CustomEvent|CustomEventInit} [payload] - Optional event object or data to pass.
   */
  static trigger(el, event, payload = {}) {
    if (typeof event !== 'string') throw new TypeError('The event name must be a string.');
    TinyHtml._preEventTargetElems(el, 'trigger').forEach((elem) => {
      const evt =
        payload instanceof Event || payload instanceof CustomEvent
          ? payload
          : new CustomEvent(event, {
              bubbles: true,
              cancelable: true,
              detail: payload,
            });

      elem.dispatchEvent(evt);
    });
  }

  /**
   * Triggers all handlers associated with a specific event on the given element.
   *
   * @param {string} event - Name of the event to trigger.
   * @param {Event|CustomEvent|CustomEventInit} [payload] - Optional event object or data to pass.
   */
  trigger(event, payload = {}) {
    return TinyHtml.trigger(this, event, payload);
  }

  ///////////////////////////////////////////////////////////////

  /**
   * Property name normalization similar to jQuery's propFix.
   * @readonly
   */
  static _propFix = {
    for: 'htmlFor',
    class: 'className',
  };

  /**
   * Get an attribute on an element.
   * @param {TinyElement} el
   * @param {string} name
   * @returns {string|null}
   */
  static attr(el, name) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    const elem = TinyHtml._preElem(el, 'attr');
    return elem.getAttribute(name);
  }

  /**
   * Get an attribute on an element.
   * @param {string} name
   * @returns {string|null}
   */
  attr(name) {
    return TinyHtml.attr(this, name);
  }

  /**
   * Set an attribute on an element.
   * @param {TinyElement|TinyElement[]} el
   * @param {string} name
   * @param {string|null} [value=null]
   */
  static setAttr(el, name, value = null) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    if (value !== null && typeof value !== 'string')
      throw new TypeError('The "value" must be a string.');
    TinyHtml._preElems(el, 'setAttr').forEach((elem) => {
      if (value === null) elem.removeAttribute(name);
      else elem.setAttribute(name, value);
    });
  }

  /**
   * Set an attribute on an element.
   * @param {string} name
   * @param {string|null} [value=null]
   */
  setAttr(name, value) {
    return TinyHtml.setAttr(this, name, value);
  }

  /**
   * Remove attribute(s) from an element.
   * @param {TinyElement|TinyElement[]} el
   * @param {string} name Space-separated list of attributes.
   */
  static removeAttr(el, name) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    TinyHtml._preElems(el, 'removeAttr').forEach((elem) => elem.removeAttribute(name));
  }

  /**
   * Remove attribute(s) from an element.
   * @param {string} name Space-separated list of attributes.
   */
  removeAttr(name) {
    return TinyHtml.removeAttr(this, name);
  }

  /**
   * Check if an attribute exists on an element.
   * @param {TinyElement} el
   * @param {string} name
   * @returns {boolean}
   */
  static hasAttr(el, name) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    const elem = TinyHtml._preElem(el, 'hasAttr');
    return elem.hasAttribute(name);
  }

  /**
   * Check if an attribute exists on an element.
   * @param {string} name
   * @returns {boolean}
   */
  hasAttr(name) {
    return TinyHtml.hasAttr(this, name);
  }

  /**
   * Check if a property exists.
   * @param {TinyElement} el
   * @param {string} name
   * @returns {boolean}
   */
  static hasProp(el, name) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    const elem = TinyHtml._preElem(el, 'hasProp');
    // @ts-ignore
    const propName = TinyHtml._propFix[name] || name;
    // @ts-ignore
    return !!elem[propName];
  }

  /**
   * Check if a property exists.
   * @param {string} name
   * @returns {boolean}
   */
  hasProp(name) {
    return TinyHtml.hasProp(this, name);
  }

  /**
   * Set a property on an element.
   * @param {TinyElement|TinyElement[]} el
   * @param {string} name
   */
  static addProp(el, name) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    TinyHtml._preElems(el, 'addProp').forEach((elem) => {
      // @ts-ignore
      name = TinyHtml._propFix[name] || name;
      // @ts-ignore
      elem[name] = true;
    });
  }

  /**
   * Set a property on an element.
   * @param {string} name
   */
  addProp(name) {
    return TinyHtml.addProp(this, name);
  }

  /**
   * Remove a property from an element.
   * @param {TinyElement|TinyElement[]} el
   * @param {string} name
   */
  static removeProp(el, name) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    TinyHtml._preElems(el, 'removeProp').forEach((elem) => {
      // @ts-ignore
      name = TinyHtml._propFix[name] || name;
      // @ts-ignore
      elem[name] = false;
    });
  }

  /**
   * Remove a property from an element.
   * @param {string} name
   */
  removeProp(name) {
    return TinyHtml.removeProp(this, name);
  }

  /**
   * Toggle a boolean property.
   * @param {TinyElement|TinyElement[]} el
   * @param {string} name
   * @param {boolean} [force]
   */
  static toggleProp(el, name, force) {
    if (typeof name !== 'string') throw new TypeError('The "name" must be a string.');
    if (typeof force !== 'undefined' && typeof force !== 'boolean')
      throw new TypeError('The "force" must be a boolean.');
    TinyHtml._preElems(el, 'toggleProp').forEach((elem) => {
      // @ts-ignore
      const propName = TinyHtml._propFix[name] || name;
      // @ts-ignore
      const shouldEnable = force === undefined ? !elem[propName] : force;
      // @ts-ignore
      if (shouldEnable) TinyHtml.addProp(elem, name);
      else TinyHtml.removeProp(elem, name);
    });
  }

  /**
   * Toggle a boolean property.
   * @param {string} name
   * @param {boolean} [force]
   */
  toggleProp(name, force) {
    return TinyHtml.toggleProp(this, name, force);
  }

  /////////////////////////////////////////////////////

  /**
   * Removes an element from the DOM.
   * @param {TinyElement|TinyElement[]} el - The DOM element or selector to remove.
   */
  static remove(el) {
    TinyHtml._preElems(el, 'remove').forEach((elem) => elem.remove());
  }

  /**
   * Removes the element from the DOM.
   */
  remove() {
    return TinyHtml.remove(this);
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
    return TinyHtml.index(this, elem);
  }

  ////////////////////////////////////////////////////////////////////

  /**
   * Creates a new DOMRect object by copying the base rect and applying optional additional dimensions.
   *
   * @param {DOMRect} rect - The base rectangle to be cloned and extended.
   * @param {Partial<DOMRect>} extraRect - Additional dimensions to apply to the base rect (e.g., extra padding or offset).
   * @returns {DOMRect} - A new DOMRect object with the combined dimensions.
   * @readonly
   */
  static _getCustomRect(rect, extraRect) {
    /** @type {DOMRect} */
    const result = {
      height: 0,
      width: 0,
      x: 0,
      y: 0,
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      toJSON: function () {
        throw new Error('Function not implemented.');
      },
    };
    for (const name in rect) {
      // @ts-ignore
      if (typeof rect[name] === 'number')
        // @ts-ignore
        result[name] = rect[name];
    }

    if (typeof extraRect !== 'object' || extraRect === null || Array.isArray(extraRect))
      throw new Error('');
    const { height = 0, width = 0, top = 0, bottom = 0, left = 0, right = 0 } = extraRect;
    if (typeof height !== 'number') throw new Error('');
    if (typeof width !== 'number') throw new Error('');
    if (typeof top !== 'number') throw new Error('');
    if (typeof bottom !== 'number') throw new Error('');
    if (typeof left !== 'number') throw new Error('');
    if (typeof right !== 'number') throw new Error('');

    // @ts-ignore
    result.height += height;
    // @ts-ignore
    result.width += width;
    // @ts-ignore
    result.top += top;
    // @ts-ignore
    result.bottom += bottom;
    // @ts-ignore
    result.left += left;
    // @ts-ignore
    result.right += right;
    return result;
  }

  /**
   * Determines if two HTML elements are colliding, using a simple bounding box comparison.
   *
   * @param {TinyElement} el1 - The first element to compare.
   * @param {TinyElement} el2 - The second element to compare.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} - `true` if the elements are colliding, `false` otherwise.
   */
  static isCollWith(el1, el2, extraRect = {}) {
    const rect1 = TinyHtml._getCustomRect(
      TinyHtml._preElem(el1, 'isCollWith').getBoundingClientRect(),
      extraRect,
    );
    const rect2 = TinyHtml._preElem(el2, 'isCollWith').getBoundingClientRect();
    return areElsColliding(rect1, rect2);
  }

  /**
   * Determines if two HTML elements are colliding, using a simple bounding box comparison.
   *
   * @param {TinyElement} el2 - The second element to compare.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} - `true` if the elements are colliding, `false` otherwise.
   */
  isCollWith(el2, extraRect) {
    return TinyHtml.isCollWith(this, el2, extraRect);
  }

  /**
   * Determines if two HTML elements are colliding using a pixel-perfect collision algorithm.
   *
   * @param {TinyElement} el1 - The first element to compare.
   * @param {TinyElement} el2 - The second element to compare.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} - `true` if the elements are colliding with higher precision, `false` otherwise.
   */
  static isCollPerfWith(el1, el2, extraRect = {}) {
    const rect1 = TinyHtml._getCustomRect(
      TinyHtml._preElem(el1, 'isCollPerfWith').getBoundingClientRect(),
      extraRect,
    );
    const rect2 = TinyHtml._preElem(el2, 'isCollPerfWith').getBoundingClientRect();
    return areElsPerfColliding(rect1, rect2);
  }

  /**
   * Determines if two HTML elements are colliding using a pixel-perfect collision algorithm.
   *
   * @param {TinyElement} el2 - The second element to compare.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} - `true` if the elements are colliding with higher precision, `false` otherwise.
   */
  isCollPerfWith(el2, extraRect) {
    return TinyHtml.isCollPerfWith(this, el2, extraRect);
  }

  /**
   * Determines whether two elements are colliding with a directional lock mechanism.
   *
   * This function tracks the direction from which an element (`elem1`) initially collided with another,
   * and keeps the collision "locked" until the element exits the collision from the same direction.
   *
   * - If `isColliding` is true and no lock is stored yet, it saves the direction of entry.
   * - If `isColliding` is false but a previous lock exists, it checks if the element has exited
   *   in the same direction it entered to remove the lock.
   *
   * @param {boolean} isColliding - Indicates whether `rect1` and `rect2` are currently colliding.
   * @param {DOMRect} rect1 - The bounding box of the first element.
   * @param {DOMRect} rect2 - The bounding box of the second element.
   * @param {Element} elem1 - The element to track collision state for.
   * @param {CollisionDirLock} lockDirection - The direction from which the collision was first detected.
   * @returns {boolean} Returns `true` if the element is still considered colliding (locked), otherwise `false`.
   * @readonly
   */
  static _isCollWithLock(isColliding, rect1, rect2, elem1, lockDirection) {
    const lockMap = __elemCollision[lockDirection];

    if (isColliding) {
      // Save entry direction
      if (!lockMap.has(elem1)) {
        lockMap.set(elem1, true);
      }
      return true;
    }

    // Handle unlock logic
    if (lockMap.has(elem1)) {
      let shouldUnlock = false;

      switch (lockDirection) {
        case 'top':
          shouldUnlock = areElsCollTop(rect1, rect2);
          break;
        case 'bottom':
          shouldUnlock = areElsCollBottom(rect1, rect2);
          break;
        case 'left':
          shouldUnlock = areElsCollLeft(rect1, rect2);
          break;
        case 'right':
          shouldUnlock = areElsCollRight(rect1, rect2);
          break;
      }

      if (shouldUnlock) lockMap.delete(elem1);

      return lockMap.has(elem1); // still colliding (locked)
    }

    return false;
  }

  /**
   * Checks if two DOM elements are colliding on the screen, and locks the collision
   * until the element exits through the same side it entered.
   *
   * @param {TinyElement} el1 - First DOM element (e.g. draggable or moving element).
   * @param {TinyElement} el2 - Second DOM element (e.g. a container or boundary element).
   * @param {CollisionDirLock} lockDirection - Direction that must be respected to unlock the collision.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} True if collision is still active.
   */
  static isCollWithLock(el1, el2, lockDirection, extraRect = {}) {
    const elem1 = TinyHtml._preElem(el1, 'isCollWithLock');
    const elem2 = TinyHtml._preElem(el2, 'isCollWithLock');
    const rect1 = TinyHtml._getCustomRect(elem1.getBoundingClientRect(), extraRect);
    const rect2 = elem2.getBoundingClientRect();
    const isColliding = areElsColliding(rect1, rect2);
    return TinyHtml._isCollWithLock(isColliding, rect1, rect2, elem1, lockDirection);
  }

  /**
   * Checks if two DOM elements are colliding on the screen, and locks the collision
   * until the element exits through the same side it entered.
   *
   * @param {TinyElement} el2 - Second DOM element (e.g. a container or boundary element).
   * @param {CollisionDirLock} lockDirection - Direction that must be respected to unlock the collision.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} True if collision is still active.
   */
  isCollWithLock(el2, lockDirection, extraRect) {
    return TinyHtml.isCollWithLock(this, el2, lockDirection, extraRect);
  }

  /**
   * Checks if two DOM elements are colliding on the screen, and locks the collision
   * until the element exits through the same side it entered.
   *
   * @param {TinyElement} el1 - First DOM element (e.g. draggable or moving element).
   * @param {TinyElement} el2 - Second DOM element (e.g. a container or boundary element).
   * @param {CollisionDirLock} lockDirection - Direction that must be respected to unlock the collision.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} True if collision is still active.
   */
  static isCollPerfWithLock(el1, el2, lockDirection, extraRect = {}) {
    const elem1 = TinyHtml._preElem(el1, 'isCollPerfWithLock');
    const elem2 = TinyHtml._preElem(el2, 'isCollPerfWithLock');
    const rect1 = TinyHtml._getCustomRect(elem1.getBoundingClientRect(), extraRect);
    const rect2 = elem2.getBoundingClientRect();
    const isColliding = areElsPerfColliding(rect1, rect2);
    return TinyHtml._isCollWithLock(isColliding, rect1, rect2, elem1, lockDirection);
  }

  /**
   * Checks if two DOM elements are colliding on the screen, and locks the collision
   * until the element exits through the same side it entered.
   *
   * @param {TinyElement} el2 - Second DOM element (e.g. a container or boundary element).
   * @param {CollisionDirLock} lockDirection - Direction that must be respected to unlock the collision.
   * @param {Partial<ObjRect>} [extraRect] - Optional values to expand the size of the first element's rect.
   * @returns {boolean} True if collision is still active.
   */
  isCollPerfWithLock(el2, lockDirection, extraRect) {
    return TinyHtml.isCollPerfWithLock(this, el2, lockDirection, extraRect);
  }

  /**
   * Resets all collision locks for a specific element (for all directions).
   *
   * @param {TinyElement} el - The element whose locks should be removed.
   * @returns {boolean} True if at least one lock was removed.
   */
  static resetCollLock(el) {
    const elem = TinyHtml._preElem(el, 'resetCollLock');
    let removed = false;

    for (const dir of /** @type {CollisionDirLock[]} */ (['top', 'bottom', 'left', 'right'])) {
      if (__elemCollision[dir].has(elem)) {
        __elemCollision[dir].delete(elem);
        removed = true;
      }
    }

    return removed;
  }

  /**
   * Resets the collision lock for a specific element.
   *
   * This removes any previously stored collision direction for the given element,
   * effectively unlocking its collision state.
   *
   * @returns {boolean} Returns `true` if a lock was removed, `false` if no lock was present.
   */
  resetCollLock() {
    return TinyHtml.resetCollLock(this);
  }

  /**
   * Resets the collision lock for a specific element and direction.
   *
   * @param {TinyElement} el - The element whose lock should be removed.
   * @param {CollisionDirLock} direction - The direction to clear the lock from.
   * @returns {boolean} True if the lock was removed.
   */
  static resetCollLockDir(el, direction) {
    const elem = TinyHtml._preElem(el, 'resetCollLockDir');
    const lockMap = __elemCollision[direction];

    if (lockMap.has(elem)) {
      lockMap.delete(elem);
      return true;
    }

    return false;
  }

  /**
   * Resets the collision lock for a specific element and direction.
   *
   * @param {CollisionDirLock} direction - The direction to clear the lock from.
   * @returns {boolean} True if the lock was removed.
   */
  resetCollLockDir(direction) {
    return TinyHtml.resetCollLockDir(this, direction);
  }

  //////////////////////////////////////////////////////////////////////////////

  /**
   * Checks if the given element is at least partially visible in the viewport.
   *
   * @param {TinyElement} el - The DOM element to check.
   * @returns {boolean} True if the element is partially in the viewport, false otherwise.
   */
  static isInViewport(el) {
    const elem = TinyHtml._preElem(el, 'isInViewport');
    const elementTop = TinyHtml.offset(elem).top;
    const elementBottom = elementTop + TinyHtml.outerHeight(elem);

    const viewportTop = TinyHtml.scrollTop(window);
    const viewportBottom = viewportTop + TinyHtml.height(window);

    return elementBottom > viewportTop && elementTop < viewportBottom;
  }

  /**
   * Checks if the given element is at least partially visible in the viewport.
   *
   * @returns {boolean} True if the element is partially in the viewport, false otherwise.
   */
  isInViewport() {
    return TinyHtml.isInViewport(this);
  }

  /**
   * Checks if the given element is fully visible in the viewport (top and bottom).
   *
   * @param {TinyElement} el - The DOM element to check.
   * @returns {boolean} True if the element is fully visible in the viewport, false otherwise.
   */
  static isScrolledIntoView(el) {
    const elem = TinyHtml._preElem(el, 'isScrolledIntoView');
    const docViewTop = TinyHtml.scrollTop(window);
    const docViewBottom = docViewTop + TinyHtml.height(window);

    const elemTop = TinyHtml.offset(elem).top;
    const elemBottom = elemTop + TinyHtml.height(elem);

    return elemBottom <= docViewBottom && elemTop >= docViewTop;
  }

  /**
   * Checks if the given element is fully visible in the viewport (top and bottom).
   *
   * @returns {boolean} True if the element is fully visible in the viewport, false otherwise.
   */
  isScrolledIntoView() {
    return TinyHtml.isScrolledIntoView(this);
  }
}

export default TinyHtml;
