import TinyHtml from './TinyHtml.mjs';
import * as TinyCollision from '../basics/collision.mjs';

/**
 * TinySmartScroller is a utility class designed to enhance and manage scroll behaviors within containers or the window.
 *
 * It enables advanced scroll monitoring, auto-scrolling to bottom, preserving scroll position during DOM changes,
 * and detecting visibility changes of elements. This is particularly useful for dynamic UIs like chat applications,
 * feed viewers, or live content containers.
 *
 * Features:
 * - Detects when the scroll reaches the top, bottom, or custom boundaries
 * - Supports automatic scrolling to the bottom unless the user scrolls away
 * - Observes DOM mutations and resizes, and adapts scroll position accordingly
 * - Emits scroll-related events such as 'onScrollBoundary', 'onAutoScroll', and 'onScrollPause'
 * - Includes customizable scroll correction filters for layout shift mitigation
 * - Handles media element load events (e.g. `<img>`, `<iframe>`, `<video>`) to prevent sudden scroll jumps
 *
 * This class is **not framework-dependent** and works with vanilla DOM elements and the window object.
 */
class TinySmartScroller {
  static Utils = { ...TinyCollision, TinyHtml };

  /** @type {WeakMap<Element, NodeSizes>} */
  #oldSizes = new WeakMap();
  /** @type {WeakMap<Element, NodeSizes>} */
  #newSizes = new WeakMap();

  /** @type {WeakMap<Element, boolean>} */
  #newVisibles = new WeakMap();
  /** @type {WeakMap<Element, boolean>} */
  #oldVisibles = new WeakMap();

  /** @type {WeakMap<Element, boolean>} */
  #newVisiblesByTime = new WeakMap();
  /** @type {WeakMap<Element, boolean>} */
  #oldVisiblesByTime = new WeakMap();

  /** @type {Record<string, Function[]>} */
  #scrollListeners = {};

  /** @type {ResizeObserver|null} */
  #resizeObserver = null;
  /** @type {MutationObserver|null} */
  #mutationObserver = null;

  /** @type {Set<string>} */
  #loadTags = new Set(['IMG', 'IFRAME', 'VIDEO']);

  /** @type {null|EventListenerOrEventListenerObject} */
  #handler = null;

  #isAtBottom = false;
  #isAtTop = false;
  #isAtCustomTop = false;
  #isAtCustomBottom = false;

  #querySelector = '';
  #useWindow = false;
  #destroyed = false;
  #scrollPaused = false;
  #autoScrollBottom = false;
  #observeMutations = false;
  #preserveScrollOnLayoutShift = false;
  #debounceTime = 0;
  #elemAmount = 0;
  #elemOldAmount = 0;
  #lastKnownScrollBottomOffset = 0;
  #extraScrollBoundary = 0;

  /** @type {Set<string>} */
  #attributeFilter;

  /** @type {Element} */
  #target;

  /**
   * @typedef {{ height: number; width: number; }} NodeSizes
   */

  /**
   * @typedef {(elem: Element, sizes: { old: NodeSizes; now: NodeSizes }, elemAmount: { old: number; now: number; }) => (NodeSizes|undefined)} NodeSizesEvent
   */

  /** @type {Set<NodeSizesEvent>} */
  #sizeFilter = new Set();

  /**
   * Creates a new instance of TinySmartScroller, attaching scroll and resize observers to manage
   * automatic scroll behaviors, layout shift correction, and visibility tracking.
   *
   * @param {Element|Window} target - The scroll container to monitor. Can be an element or `window`.
   * @param {Object} [options={}] - Optional settings to configure scroll behavior.
   * @param {number} [options.extraScrollBoundary=0] - Extra margin in pixels to extend scroll boundary detection.
   * @param {boolean} [options.autoScrollBottom=true] - Whether to auto-scroll to bottom on layout updates.
   * @param {boolean} [options.observeMutations=true] - Enables MutationObserver to detect DOM changes.
   * @param {boolean} [options.preserveScrollOnLayoutShift=true] - Prevents scroll jumps when layout changes.
   * @param {number} [options.debounceTime=100] - Debounce time in milliseconds for scroll events.
   * @param {string|null} [options.querySelector=null] - Optional CSS selector to filter observed child nodes.
   * @param {string[]|Set<string>|null} [options.attributeFilter=['class', 'style', 'src', 'data-*', 'height', 'width']]
   *     - Which attributes to observe for changes.
   */
  constructor(
    target,
    {
      extraScrollBoundary = 0,
      autoScrollBottom = true,
      observeMutations = true,
      preserveScrollOnLayoutShift = true,
      debounceTime = 100,
      querySelector = null,
      attributeFilter = ['class', 'style', 'src', 'data-*', 'height', 'width'],
    } = {},
  ) {
    // Start values
    this.#target = target instanceof Window ? document.documentElement : target;
    this.#useWindow = target instanceof Window;
    this.#autoScrollBottom = autoScrollBottom;
    this.#observeMutations = observeMutations;
    this.#preserveScrollOnLayoutShift = preserveScrollOnLayoutShift;
    this.#debounceTime = debounceTime;
    this.#extraScrollBoundary = extraScrollBoundary;
    this.#querySelector = querySelector || '';
    this.#attributeFilter = new Set(attributeFilter || undefined);

    // Bind scroll
    /** @type {NodeJS.Timeout} */
    let timeout;
    this.#handler = () => {
      this._scrollDataUpdater();
      clearTimeout(timeout);
      timeout = setTimeout(() => this._onScroll(), this.#debounceTime);
    };
    (this.#useWindow ? window : this.#target).addEventListener('scroll', this.#handler, {
      passive: true,
    });

    // Mutations
    if (this.#observeMutations) {
      this._observeMutations();
      this._observeResizes(this.#target.children);
    }

    this._scrollDataUpdater();
  }

  /**
   * Returns a size difference callback that only reacts when height changes, filtered by tag name.
   *
   * @param {string[]} filter - List of tag names to allow. If empty, all tags are accepted.
   * @returns {NodeSizesEvent} A function that compares previous and current height, returning height delta.
   */
  getSimpleOnHeight(filter = []) {
    return (elem, sizes, amounts) => {
      if ((filter.length > 0 && !filter.includes(elem.tagName)) || amounts.now !== amounts.old)
        return;
      const oldSize = sizes.old;
      const newSize = sizes.now;
      const height = newSize.height - oldSize.height;
      return { height, width: 0 };
    };
  }

  /**
   * Adds a height difference callback to the size filter system.
   *
   * @param {string[]} filter - List of tag names to allow.
   * @returns {NodeSizesEvent} The added size difference callback.
   */
  addSimpleOnHeight(filter) {
    const result = this.getSimpleOnHeight(filter);
    this.onSize(result);
    return result;
  }

  /**
   * Registers a custom node size change handler to the internal size filter set.
   *
   * @param {NodeSizesEvent} handler - Function that compares old and new sizes.
   */
  onSize(handler) {
    if (this.#destroyed) return;
    this.#sizeFilter.add(handler);
  }

  /**
   * Adds a scroll-related event listener.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {Function} handler - Callback function to be called when event fires.
   */
  on(event, handler) {
    if (this.#destroyed) return;
    if (!this.#scrollListeners[event]) this.#scrollListeners[event] = [];
    this.#scrollListeners[event].push(handler);
  }

  /**
   * Checks which elements inside the target are currently visible and updates internal maps.
   *
   * @returns {Map<Element, { oldIsVisible: boolean; isVisible: boolean }>} Visibility comparison results.
   */
  _scrollDataUpdater() {
    const results = new Map();
    this.#target.querySelectorAll(this.#querySelector || '*').forEach((target) => {
      const oldIsVisible = this.#newVisibles.get(target) ?? false;
      this.#oldVisibles.set(target, oldIsVisible);

      const isVisible = TinyHtml.isInContainer(this.#target, target);
      this.#newVisibles.set(target, isVisible);

      results.set(target, { oldIsVisible, isVisible });
    });
    return results;
  }

  /**
   * Emits a scroll-related event to all registered listeners.
   *
   * @param {string} event - Event name.
   * @param {*} [payload] - Optional event data payload.
   */
  _emit(event, payload) {
    if (this.#destroyed) return;
    (this.#scrollListeners[event] || []).forEach((fn) => fn(payload));
  }

  /**
   * Handles scroll events, calculates position-related statuses, and emits appropriate events.
   */
  _onScroll() {
    if (this.#destroyed) return;
    // Get values
    const scrollCache = this._scrollDataUpdater();
    const el = this.#target;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    // Prepare sroll values
    const scrollResult = { scrollTop, scrollHeight, clientHeight };
    let atResult = null;
    let atCustomResult = null;

    const atTop = scrollTop === 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    const atCustomTop = scrollTop <= 0 + this.#extraScrollBoundary;
    const atCustomBottom = scrollTop + clientHeight >= scrollHeight - 1 - this.#extraScrollBoundary;

    // Scroll results
    if (atTop && atBottom) atResult = 'all';
    else if (atTop) atResult = 'top';
    else if (atBottom) atResult = 'bottom';

    if (atCustomTop && atCustomBottom) atCustomResult = 'all';
    else if (atCustomTop) atCustomResult = 'top';
    else if (atCustomBottom) atCustomResult = 'bottom';

    this.#isAtTop = atTop;
    this.#isAtBottom = atBottom;

    this.#isAtCustomTop = atCustomTop;
    this.#isAtCustomBottom = atCustomBottom;

    this.#scrollPaused = !(this.#autoScrollBottom && this.#isAtBottom);

    this.#lastKnownScrollBottomOffset = scrollHeight - scrollTop - clientHeight;

    // Send results
    this._emit('onScrollBoundary', { status: atResult, ...scrollResult, scrollCache });
    this._emit('onExtraScrollBoundary', { status: atCustomResult, ...scrollResult, scrollCache });

    if (!this.#scrollPaused) {
      this._emit('onAutoScroll', { ...scrollResult, scrollCache });
    } else {
      this._emit('onScrollPause', { ...scrollResult, scrollCache });
    }
  }

  /**
   * Attempts to correct the scroll position when layout shifts happen, preserving the user position if needed.
   *
   * @param {number} prevScrollTop - Previous scrollTop value before change.
   * @param {number} prevScrollHeight - Previous total scroll height.
   * @param {number} prevBottomOffset - Distance from bottom before the layout change.
   * @param {Element[]} [targets=[]] - List of elements involved in the size change.
   */
  _fixScroll(prevScrollTop, prevScrollHeight, prevBottomOffset, targets = []) {
    if (this.#destroyed) return;
    // Get new size
    const newScrollHeight = this.#target.scrollHeight;
    const heightDelta = newScrollHeight - prevScrollHeight;

    // Fix scroll size
    if (
      this.#autoScrollBottom &&
      this.#preserveScrollOnLayoutShift &&
      !this.#isAtBottom &&
      !this.#isAtTop
    ) {
      // Run size getter
      const scrollSize = { height: 0, width: 0 };
      for (const target of targets) {
        const tgOs = this.#oldSizes.get(target) || { height: 0, width: 0 };
        const tgNs = this.#newSizes.get(target) || { height: 0, width: 0 };
        this.#sizeFilter.forEach((fn) => {
          /** @type {NodeSizes| undefined} */
          const sizes = fn(
            target,
            { old: tgOs, now: tgNs },
            { old: this.#elemOldAmount, now: this.#elemAmount },
          );

          // Fix size
          if (this.#newVisibles.get(target) || this.#newVisiblesByTime.get(target)) {
            if (typeof sizes !== 'undefined' && typeof sizes !== 'object') throw new Error('');
            if (typeof sizes === 'undefined') return;
            scrollSize.height = sizes.height;
            scrollSize.width = sizes.width;
          }
        });
      }

      // Checker
      if (typeof scrollSize.height !== 'number' && scrollSize.height < 0) throw new Error('');
      if (typeof scrollSize.width !== 'number' && scrollSize.width < 0) throw new Error('');

      if (scrollSize.height !== 0 || scrollSize.width !== 0) {
        for (const target of targets) {
          this.#newVisiblesByTime.set(target, this.#newVisibles.get(target) ?? false);
          this.#oldVisiblesByTime.set(target, this.#oldVisibles.get(target) ?? false);
        }
      }

      // Complete
      this.#target.scrollTop = prevScrollTop + heightDelta + scrollSize.height;
      if (scrollSize.width > 0)
        this.#target.scrollLeft = this.#target.scrollLeft + scrollSize.width;
    }

    // Normal stuff
    else if (!this.#scrollPaused && this.#autoScrollBottom) {
      this.scrollToBottom();
    } else if (!this.#autoScrollBottom && !this.#isAtBottom) {
      this.#target.scrollTop =
        this.#target.scrollHeight - this.#target.clientHeight - prevBottomOffset;
    }
  }
  /**
   * Sets up a MutationObserver to watch for DOM changes and react accordingly to maintain scroll consistency.
   */
  _observeMutations() {
    this.#mutationObserver = new MutationObserver((mutations) => {
      if (this.#destroyed) return;
      this._scrollDataUpdater();
      this.#elemOldAmount = this.#elemAmount;
      this.#elemAmount = this.#target.childElementCount;
      const prevScrollHeight = this.#target.scrollHeight;
      const prevScrollTop = this.#target.scrollTop;
      const prevBottomOffset =
        this.#target.scrollHeight - this.#target.scrollTop - this.#target.clientHeight;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element) || node.nodeType !== 1) return;

          this._observeResizes([node]);
          this._listenLoadEvents(node);

          if (this.#querySelector) {
            const children = node.querySelectorAll(this.#querySelector);
            this._observeResizes(children);
            this._listenLoadEvents(children);
          }
        });
      });

      this._fixScroll(prevScrollTop, prevScrollHeight, prevBottomOffset);
    });

    // Install observer
    this.#mutationObserver.observe(this.#target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter:
        this.#attributeFilter.size > 0 ? Array.from(this.#attributeFilter) : undefined,
    });
  }

  /**
   * Adds a ResizeObserver to monitor elements' size changes and trigger layout adjustments.
   *
   * @param {NodeListOf<Element>|Element[]|HTMLCollection} elements - Elements to observe.
   */
  _observeResizes(elements) {
    // Add resize observer
    if (!this.#resizeObserver) {
      this.#resizeObserver = new ResizeObserver((entries) => {
        if (this.#destroyed) return;
        this._scrollDataUpdater();
        /** @type {Element[]} */
        const targets = [];
        for (const entry of entries) {
          // Target
          const target = entry.target;

          // Update old size
          const oldSize = this.#newSizes.get(target);
          if (oldSize) this.#oldSizes.set(target, oldSize);

          // Set new size
          const { width, height } = entry.contentRect;
          this.#newSizes.set(target, { width, height });
          targets.push(target);
        }

        // Get Scroll data
        const prevScrollHeight = this.#target.scrollHeight;
        const prevScrollTop = this.#target.scrollTop;
        const prevBottomOffset =
          this.#target.scrollHeight - this.#target.scrollTop - this.#target.clientHeight;

        // Animation frame
        this._fixScroll(prevScrollTop, prevScrollHeight, prevBottomOffset, targets);
      });
    }

    // Execute observer
    Array.from(elements).forEach((el) => {
      if (!this.#resizeObserver) throw new Error('');
      this.#resizeObserver.observe(el);
    });
  }

  /**
   * Listens for media/content load events (e.g., images, iframes, videos) to trigger scroll updates.
   *
   * @param {NodeListOf<Element>|Element} elements - Target element(s) to listen on.
   */
  _listenLoadEvents(elements) {
    if (this.#destroyed) return;
    const list = elements instanceof NodeList ? Array.from(elements) : [elements];

    list.forEach((el) => {
      if (this.#loadTags.has(el.tagName)) {
        // @ts-ignore
        if (!el.complete) {
          el.addEventListener('load', () => {
            this._scrollDataUpdater();
            if (!this.#scrollPaused && this.#autoScrollBottom) {
              this.scrollToBottom();
            }
          });
        }
      }
    });
  }

  /**
   * Sets the extra scroll boundary margin used when determining if the user is at a "custom" bottom or top.
   *
   * @param {number} value - Pixels of additional margin to use.
   */
  setExtraScrollBoundary(value) {
    this.#extraScrollBoundary = value;
  }

  /**
   * Returns the current extra scroll boundary setting.
   *
   * @returns {number}
   */
  getExtraScrollBoundary() {
    return this.#extraScrollBoundary;
  }

  /**
   * Returns the last known distance (in pixels) from the bottom of the scroll container.
   *
   * @returns {number}
   */
  getLastKnownScrollBottomOffset() {
    return this.#lastKnownScrollBottomOffset;
  }

  /**
   * Forces the scroll position to move to the very bottom of the target.
   */
  scrollToBottom() {
    this.#target.scrollTop = this.#target.scrollHeight;
  }

  /**
   * Forces the scroll position to move to the very top of the target.
   */
  scrollToTop() {
    this.#target.scrollTop = 0;
  }

  /**
   * Checks if the user is within the defined extra scroll boundary from the bottom.
   *
   * @returns {boolean}
   */
  isUserAtCustomBottom() {
    return this.#isAtCustomBottom;
  }

  /**
   * Checks if the user is within the defined extra scroll boundary from the top.
   *
   * @returns {boolean}
   */
  isUserAtCustomTop() {
    return this.#isAtCustomTop;
  }

  /**
   * Returns true if the user is currently scrolled to the bottom of the element.
   *
   * @returns {boolean}
   */
  isUserAtBottom() {
    return this.#isAtBottom;
  }

  /**
   * Returns true if the user is currently scrolled to the top of the element.
   *
   * @returns {boolean}
   */
  isUserAtTop() {
    return this.#isAtTop;
  }

  /**
   * Returns true if automatic scrolling is currently paused.
   *
   * @returns {boolean}
   */
  isScrollPaused() {
    return this.#scrollPaused;
  }

  /**
   * Disconnects all listeners, observers, and clears memory structures.
   * Once destroyed, this instance should no longer be used.
   */
  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;

    // Disconnects MutationObserver
    if (this.#mutationObserver) {
      this.#mutationObserver.disconnect();
      this.#mutationObserver = null;
    }

    // Disconnect ResizeObserver
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }

    // Removes scroll listener
    const target = this.#useWindow ? window : this.#target;
    if (this.#handler) target.removeEventListener('scroll', this.#handler);

    // Clean the WeakMaps
    this.#oldSizes = new WeakMap();
    this.#newSizes = new WeakMap();
    this.#newVisibles = new WeakMap();
    this.#oldVisibles = new WeakMap();
    this.#newVisiblesByTime = new WeakMap();
    this.#oldVisiblesByTime = new WeakMap();

    // Cleans listeners and filters
    this.#scrollListeners = {};
    this.#sizeFilter.clear();
    this.#loadTags.clear();
  }
}

export default TinySmartScroller;
