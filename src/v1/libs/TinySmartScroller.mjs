class TinySmartScroller {
  /** @type {WeakMap<Node, NodeSizes>} */
  #oldSizes = new WeakMap();
  /** @type {WeakMap<Node, NodeSizes>} */
  #newSizes = new WeakMap();

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

  #querySelector = '';
  #useWindow = false;
  #destroyed = false;
  #scrollPaused = false;
  #isAtBottom = false;
  #isAtTop = false;
  #autoScrollBottom = false;
  #observeMutations = false;
  #preserveScrollOnLayoutShift = false;
  #debounceTime = 0;
  #elemAmount = 0;
  #elemOldAmount = 0;
  #lastKnownScrollBottomOffset = 0;

  /** @type {Set<string>} */
  #attributeFilter;

  /** @type {Element} */
  #target;

  /**
   * @typedef {{ height: number; width: number; }} NodeSizes
   */

  /**
   * @typedef {(node: Node, sizes: { old: NodeSizes; now: NodeSizes }, elemAmount: { old: number; now: number; }) => (NodeSizes|undefined)} NodeSizesEvent
   */

  /** @type {Set<NodeSizesEvent>} */
  #sizeFilter = new Set();

  /**
   * @param {Element|Window} target
   * @param {Object} [options={}]
   * @param {boolean} [options.autoScrollBottom=true]
   * @param {boolean} [options.observeMutations=true]
   * @param {boolean} [options.preserveScrollOnLayoutShift=true]
   * @param {number} [options.debounceTime=100]
   * @param {string|null} [options.querySelector=null]
   * @param {string[]|Set<string>|null} [options.attributeFilter=['class', 'style', 'src', 'data-*']]
   */
  constructor(
    target,
    {
      autoScrollBottom = true,
      observeMutations = true,
      preserveScrollOnLayoutShift = true,
      debounceTime = 100,
      querySelector = null,
      attributeFilter = ['class', 'style', 'src', 'data-*'],
    } = {},
  ) {
    // Start values
    this.#target = target instanceof Window ? document.documentElement : target;
    this.#useWindow = target instanceof Window;
    this.#autoScrollBottom = autoScrollBottom;
    this.#observeMutations = observeMutations;
    this.#preserveScrollOnLayoutShift = preserveScrollOnLayoutShift;
    this.#debounceTime = debounceTime;
    this.#querySelector = querySelector || '';
    this.#attributeFilter = new Set(attributeFilter || undefined);

    // Bind scroll
    /** @type {NodeJS.Timeout} */
    let timeout;
    this.#handler = () => {
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
  }

  /**
   * @param {NodeSizesEvent} handler
   */
  onSize(handler) {
    if (this.#destroyed) return;
    this.#sizeFilter.add(handler);
  }

  /**
   * @param {string} event
   * @param {Function} handler
   */
  on(event, handler) {
    if (this.#destroyed) return;
    if (!this.#scrollListeners[event]) this.#scrollListeners[event] = [];
    this.#scrollListeners[event].push(handler);
  }

  /**
   * @param {string} event
   * @param {*} [payload]
   */
  _emit(event, payload) {
    if (this.#destroyed) return;
    (this.#scrollListeners[event] || []).forEach((fn) => fn(payload));
  }

  _onScroll() {
    if (this.#destroyed) return;
    const el = this.#target;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    const atTop = scrollTop === 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if (atTop && !this.#isAtTop) {
      this._emit('onScrollBoundary', 'top');
    }

    if (atBottom && !this.#isAtBottom) {
      this._emit('onScrollBoundary', 'bottom');
    }

    this.#isAtTop = atTop;
    this.#isAtBottom = atBottom;

    this.#scrollPaused = !(this.#autoScrollBottom && this.#isAtBottom);

    this.#lastKnownScrollBottomOffset = scrollHeight - scrollTop - clientHeight;

    if (!this.#scrollPaused) {
      this._emit('onAutoScroll');
    } else {
      this._emit('onScrollPause');
    }
  }

  /**
   * @param {number} prevScrollTop
   * @param {number} prevScrollHeight
   * @param {number} prevBottomOffset
   * @param {Node[]} [targets=[]]
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

          if (typeof sizes !== 'undefined' && typeof sizes !== 'object') throw new Error('');
          if (typeof sizes === 'undefined') return;
          scrollSize.height = sizes.height;
          scrollSize.width = sizes.width;
        });
      }

      // Checker
      if (typeof scrollSize.height !== 'number' && scrollSize.height < 0) throw new Error('');
      if (typeof scrollSize.width !== 'number' && scrollSize.width < 0) throw new Error('');

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

  _observeMutations() {
    this.#mutationObserver = new MutationObserver((mutations) => {
      if (this.#destroyed) return;
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
   * @param {NodeListOf<Element>|Element[]|HTMLCollection} elements
   */
  _observeResizes(elements) {
    // Add resize observer
    if (!this.#resizeObserver) {
      this.#resizeObserver = new ResizeObserver((entries) => {
        if (this.#destroyed) return;
        /** @type {Node[]} */
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
   * @param {NodeListOf<Element>|Element} elements
   */
  _listenLoadEvents(elements) {
    if (this.#destroyed) return;
    const list = elements instanceof NodeList ? Array.from(elements) : [elements];

    list.forEach((el) => {
      if (this.#loadTags.has(el.tagName)) {
        // @ts-ignore
        if (!el.complete) {
          el.addEventListener('load', () => {
            if (!this.#scrollPaused && this.#autoScrollBottom) {
              this.scrollToBottom();
            }
          });
        }
      }
    });
  }

  getLastKnownScrollBottomOffset() {
    return this.#lastKnownScrollBottomOffset;
  }

  scrollToBottom() {
    this.#target.scrollTop = this.#target.scrollHeight;
  }

  scrollToTop() {
    this.#target.scrollTop = 0;
  }

  isUserAtBottom() {
    return this.#isAtBottom;
  }

  isUserAtTop() {
    return this.#isAtTop;
  }

  isScrollPaused() {
    return this.#scrollPaused;
  }

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

    // Cleans listeners and filters
    this.#scrollListeners = {};
    this.#sizeFilter.clear();
  }
}

export default TinySmartScroller;
