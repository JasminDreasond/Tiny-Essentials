class TinyHtml {
  /**
   * Check if the object is a window.
   * @param {*} obj
   * @returns {obj is Window}
   */
  static isWindow(obj) {
    return obj != null && obj === obj.window;
  }

  /**
   * Get the computed CSS value as a float.
   * @param {HTMLElement} el
   * @param {string} prop
   * @returns {number}
   */
  static cssFloat(el, prop) {
    // @ts-ignore
    const val = window.getComputedStyle(el)[prop];
    return parseFloat(val) || 0;
  }

  /**
   * Get the computed CSS value as a float.
   * @param {HTMLElement} el
   * @param {string[]} prop
   * @returns {Record<string, number>}
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
   * Get or set the vertical scroll position of the page
   * @param {number} [value] - Optional value to set scroll position
   * @returns {number}
   */
  static winScrollTop(value) {
    if (typeof value === 'number') window.scrollTo({ top: value });
    return window.scrollY || document.documentElement.scrollTop;
  }

  /**
   * Gets or sets the horizontal scroll position
   * @param {number} [value]
   * @returns {number}
   */
  static winScrollLeft(value) {
    if (typeof value === 'number') window.scrollTo({ left: value });
    return window.scrollX || document.documentElement.scrollLeft;
  }

  /**
   * Returns the current height of the viewport (visible window area)
   * @returns {number}
   */
  static winInnerHeight() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  /**
   * Gets the visible width of the window (viewport)
   * @returns {number}
   */
  static winInnerWidth() {
    return window.innerWidth || document.documentElement.clientWidth;
  }

  /**
   * Get width or height of an element.
   * @param {HTMLElement|Window} el
   * @param {"width"|"height"} type
   * @param {"content"|"padding"|"border"|"margin"} extra
   * @returns {number}
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
   * @param {HTMLElement} el
   * @param {string|number} value
   */
  static setHeight(el, value) {
    el.style.height = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * @param {HTMLElement} el
   * @param {string|number} value
   */
  static setWidth(el, value) {
    el.style.width = typeof value === 'number' ? `${value}px` : value;
  }

  /**
   * @param {HTMLElement} el
   */
  static height(el) {
    return TinyHtml.getDimension(el, 'height', 'content');
  }

  /**
   * @param {HTMLElement} el
   */
  static width(el) {
    return TinyHtml.getDimension(el, 'width', 'content');
  }

  /**
   * @param {HTMLElement} el
   */
  static innerHeight(el) {
    return TinyHtml.getDimension(el, 'height', 'padding');
  }

  /**
   * @param {HTMLElement} el
   */
  static innerWidth(el) {
    return TinyHtml.getDimension(el, 'width', 'padding');
  }

  /**
   * @param {HTMLElement} el
   * @param {boolean} includeMargin
   */
  static outerHeight(el, includeMargin = false) {
    return TinyHtml.getDimension(el, 'height', includeMargin ? 'margin' : 'border');
  }

  /**
   * @param {HTMLElement} el
   * @param {boolean} includeMargin
   */
  static outerWidth(el, includeMargin = false) {
    return TinyHtml.getDimension(el, 'width', includeMargin ? 'margin' : 'border');
  }

  //////////////////////////////////////////////////

  /**
   * Gets the element's position relative to the top-left of the document
   * @param {HTMLElement} el
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
   * Get the element's position relative to its offset parent.
   * @param {HTMLElement} elem
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
   * Get the real offsetParent of an element, skipping static ones.
   * @param {HTMLElement} elem
   * @returns {HTMLElement}
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
   * Get scrollTop (vertical)
   * @param {HTMLElement|Window} el
   * @returns {number}
   */
  static scrollTop(el) {
    if (TinyHtml.isWindow(el)) return el.pageYOffset;
    // @ts-ignore
    if (el.nodeType === 9) return el.defaultView.pageYOffset;
    return el.scrollTop;
  }

  /**
   * Get scrollLeft (horizontal)
   * @param {HTMLElement|Window} el
   * @returns {number}
   */
  static scrollLeft(el) {
    if (TinyHtml.isWindow(el)) return el.pageXOffset;
    // @ts-ignore
    if (el.nodeType === 9) return el.defaultView.pageXOffset;
    return el.scrollLeft;
  }

  /**
   * Set scrollTop (vertical)
   * @param {HTMLElement|Window} el
   * @param {number} value
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
   * Set scrollLeft (horizontal)
   * @param {HTMLElement|Window} el
   * @param {number} value
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
}

export default TinyHtml;
