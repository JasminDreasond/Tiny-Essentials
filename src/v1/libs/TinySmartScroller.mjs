class TinySmartScroller {
  constructor(target, options = {}) {
    this.target = target === window ? document.documentElement : target;
    this.useWindow = target === window;
    this.autoScrollBottom = options.autoScrollBottom ?? true;
    this.observeMutations = options.observeMutations ?? true;
    this.preserveScrollOnLayoutShift = options.preserveScrollOnLayoutShift ?? true;
    this.debounceTime = options.debounceTime ?? 100;

    this.scrollListeners = {};
    this.scrollPaused = false;
    this.isAtBottom = false;
    this.isAtTop = false;
    this.lastKnownScrollBottomOffset = 0;

    this.resizeObserver = null;
    this.mutationObserver = null;

    this._init();
  }

  on(event, handler) {
    if (!this.scrollListeners[event]) this.scrollListeners[event] = [];
    this.scrollListeners[event].push(handler);
  }

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

  _observeMutations() {
    this.mutationObserver = new MutationObserver((mutations) => {
      const prevScrollHeight = this.target.scrollHeight;
      const prevScrollTop = this.target.scrollTop;
      const prevBottomOffset = this.target.scrollHeight - this.target.scrollTop - this.target.clientHeight;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;

          this._observeResizes([node]);
          this._listenLoadEvents(node);

          if (node.querySelectorAll) {
            const children = node.querySelectorAll('*');
            this._observeResizes(children);
            this._listenLoadEvents(children);
          }
        });
      });

      requestAnimationFrame(() => {
        setTimeout(() => {
          const newScrollHeight = this.target.scrollHeight;
          const heightDelta = newScrollHeight - prevScrollHeight;

          if (!this.autoScrollBottom && this.preserveScrollOnLayoutShift) {
            this.target.scrollTop = prevScrollTop + heightDelta;
          } else if (!this.scrollPaused && this.autoScrollBottom) {
            this.scrollToBottom();
          } else if (!this.autoScrollBottom && !this.isAtBottom) {
            this.target.scrollTop = this.target.scrollHeight - this.target.clientHeight - prevBottomOffset;
          }
        }, 60);
      });
    });

    this.mutationObserver.observe(this.target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'src', 'data-*'],
    });
  }

  _observeResizes(elements) {
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        const prevScrollHeight = this.target.scrollHeight;
        const prevScrollTop = this.target.scrollTop;
        const prevBottomOffset = this.target.scrollHeight - this.target.scrollTop - this.target.clientHeight;

        requestAnimationFrame(() => {
          const newScrollHeight = this.target.scrollHeight;
          const heightDelta = newScrollHeight - prevScrollHeight;

          if (!this.autoScrollBottom && this.preserveScrollOnLayoutShift) {
            this.target.scrollTop = prevScrollTop + heightDelta;
          } else if (!this.scrollPaused && this.autoScrollBottom) {
            this.scrollToBottom();
          } else if (!this.autoScrollBottom && !this.isAtBottom) {
            this.target.scrollTop = this.target.scrollHeight - this.target.clientHeight - prevBottomOffset;
          }
        });
      });
    }

    Array.from(elements).forEach((el) => {
      try {
        this.resizeObserver.observe(el);
      } catch (e) {
        console.error(e);
      }
    });
  }

  _listenLoadEvents(elements) {
    const list = elements instanceof NodeList ? Array.from(elements) : [elements];

    list.forEach((el) => {
      if (el.tagName === 'IMG' || el.tagName === 'IFRAME' || el.tagName === 'VIDEO') {
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
