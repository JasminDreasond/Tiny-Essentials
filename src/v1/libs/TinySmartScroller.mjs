class TinySmartScroller {
  /** @type {WeakMap<Node, { height: number; width: number; }>} */
  #oldSizes = new WeakMap();
  /** @type {WeakMap<Node, { height: number; width: number; }>} */
  #newSizes = new WeakMap();

  /** @type {Record<string, Function[]>} */
  scrollListeners = {};

  /** @type {ResizeObserver|null} */
  resizeObserver = null;
  /** @type {MutationObserver|null} */
  mutationObserver = null;

  /** @type {Element} */
  target;

  scrollPaused = false;
  isAtBottom = false;
  isAtTop = false;
  lastKnownScrollBottomOffset = 0;

  /**
   * @param {Element|Window} target
   * @param {Object} [options={}]
   * @param {boolean} [options.autoScrollBottom=true]
   * @param {boolean} [options.observeMutations=true]
   * @param {boolean} [options.preserveScrollOnLayoutShift=true]
   * @param {number} [options.debounceTime=100]
   */
  constructor(target, options = {}) {
    this.target = target instanceof Window ? document.documentElement : target;
    this.useWindow = target instanceof Window;
    this.autoScrollBottom = options.autoScrollBottom ?? true;
    this.observeMutations = options.observeMutations ?? true;
    this.preserveScrollOnLayoutShift = options.preserveScrollOnLayoutShift ?? true;
    this.debounceTime = options.debounceTime ?? 100;

    this._init();
  }

  /**
   * @param {string} event
   * @param {Function} handler
   */
  on(event, handler) {
    if (!this.scrollListeners[event]) this.scrollListeners[event] = [];
    this.scrollListeners[event].push(handler);
  }

  /**
   * @param {string} event
   * @param {*} [payload]
   */
  _emit(event, payload) {
    (this.scrollListeners[event] || []).forEach((fn) => fn(payload));
  }

  _init() {
    this._bindScroll();
    if (this.observeMutations) {
      this._observeMutations();
      this._observeResizes(this.target.children);
    }
  }

  _bindScroll() {
    /** @type {NodeJS.Timeout} */
    let timeout;
    const handler = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this._onScroll(), this.debounceTime);
    };
    (this.useWindow ? window : this.target).addEventListener('scroll', handler, { passive: true });
  }

  _onScroll() {
    const el = this.target;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    const atTop = scrollTop === 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if (atTop && !this.isAtTop) {
      this._emit('onScrollBoundary', 'top');
    }

    if (atBottom && !this.isAtBottom) {
      this._emit('onScrollBoundary', 'bottom');
    }

    this.isAtTop = atTop;
    this.isAtBottom = atBottom;

    this.scrollPaused = !(this.autoScrollBottom && this.isAtBottom);

    this.lastKnownScrollBottomOffset = scrollHeight - scrollTop - clientHeight;

    if (!this.scrollPaused) {
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
    for (const target of targets) {
    }

    const newScrollHeight = this.target.scrollHeight;
    const heightDelta = newScrollHeight - prevScrollHeight;

    if (this.autoScrollBottom && this.preserveScrollOnLayoutShift && !this.isAtBottom) {
      console.log('yay 1');
      this.target.scrollTop = prevScrollTop + heightDelta;
    } else if (!this.scrollPaused && this.autoScrollBottom) {
      this.scrollToBottom();
    } else if (!this.autoScrollBottom && !this.isAtBottom) {
      console.log('yay 3');
      this.target.scrollTop =
        this.target.scrollHeight - this.target.clientHeight - prevBottomOffset;
    }
  }

  _observeMutations() {
    this.mutationObserver = new MutationObserver((mutations) => {
      const prevScrollHeight = this.target.scrollHeight;
      const prevScrollTop = this.target.scrollTop;
      const prevBottomOffset =
        this.target.scrollHeight - this.target.scrollTop - this.target.clientHeight;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element) || node.nodeType !== 1) return;

          this._observeResizes([node]);
          this._listenLoadEvents(node);

          const children = node.querySelectorAll('*');
          this._observeResizes(children);
          this._listenLoadEvents(children);
        });
      });

      requestAnimationFrame(
        () =>
          // setTimeout(() => {
          this._fixScroll(prevScrollTop, prevScrollHeight, prevBottomOffset),
        // }, 60);
      );
    });

    // Install observer
    this.mutationObserver.observe(this.target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'src', 'data-*'],
    });
  }

  /**
   * @param {NodeListOf<Element>|Element[]|HTMLCollection} elements
   */
  _observeResizes(elements) {
    // Add resize observer
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
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
        const prevScrollHeight = this.target.scrollHeight;
        const prevScrollTop = this.target.scrollTop;
        const prevBottomOffset =
          this.target.scrollHeight - this.target.scrollTop - this.target.clientHeight;

        // Animation frame
        requestAnimationFrame(() =>
          this._fixScroll(prevScrollTop, prevScrollHeight, prevBottomOffset, targets),
        );
      });
    }

    // Execute observer
    Array.from(elements).forEach((el) => {
      if (!this.resizeObserver) throw new Error('');
      this.resizeObserver.observe(el);
    });
  }

  /**
   * @param {NodeListOf<Element>|Element} elements
   */
  _listenLoadEvents(elements) {
    const list = elements instanceof NodeList ? Array.from(elements) : [elements];

    list.forEach((el) => {
      if (el.tagName === 'IMG' || el.tagName === 'IFRAME' || el.tagName === 'VIDEO') {
        // @ts-ignore
        if (!el.complete) {
          el.addEventListener('load', () => {
            if (!this.scrollPaused && this.autoScrollBottom) {
              this.scrollToBottom();
            }
          });
        }
      }
    });
  }

  scrollToBottom() {
    this.target.scrollTop = this.target.scrollHeight;
  }

  scrollToTop() {
    this.target.scrollTop = 0;
  }

  isUserAtBottom() {
    return this.isAtBottom;
  }

  isUserAtTop() {
    return this.isAtTop;
  }
}

export default TinySmartScroller;
