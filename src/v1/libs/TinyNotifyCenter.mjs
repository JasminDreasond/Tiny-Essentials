class TinyNotifyCenter {
  /** @type {HTMLElement} */
  #center;
  /** @type {HTMLElement} */
  #list;
  /** @type {HTMLElement} */
  #badge;
  /** @type {HTMLElement} */
  #button;
  /** @type {HTMLElement} */
  #overlay;

  #count = 0;
  #maxCount = 99;
  #removeDelay = 300;
  #markAllAsReadOnClose = false;
  #modes = new WeakMap();

  /** @param {HTMLElement|ChildNode} item */
  #removeItem(item) {
    this.#modes.delete(item);
    if (item instanceof HTMLElement) {
      item.classList.add('removing');

      setTimeout(() => {
        this.markAsRead(item);
        item.remove();
      }, this.#removeDelay);
    } else throw new Error('Invalid HTMLElement to clear.');
  }

  /**
   * Update notify count and badge.
   * @param {number} value
   */
  #updateCount(value) {
    this.#count = Math.max(0, value);
    this.#badge.setAttribute('data-value', String(this.#count));
    this.#badge.textContent =
      this.#count > this.#maxCount ? `${this.#maxCount}+` : String(this.#count);
  }

  /**
   * @param {Object} options
   * @param {HTMLElement} [options.center=document.getElementById('notifCenter')]
   * @param {HTMLElement} [options.badge=document.getElementById('notifBadge')]
   * @param {HTMLElement} [options.button=document.querySelector('.notify-bell')]
   * @param {HTMLElement} [options.overlay=document.querySelector('.notify-overlay')]
   */
  constructor(options = {}) {
    const {
      center = document.getElementById('notifCenter'),
      badge = document.getElementById('notifBadge'),
      button = document.querySelector('.notify-bell'),
      overlay = document.querySelector('.notify-overlay'),
    } = options;

    // Element existence and type validation
    if (!(center instanceof HTMLElement))
      throw new Error(`NotificationCenter: "center" must be an HTMLElement. Got: ${center}`);
    if (!(overlay instanceof HTMLElement))
      throw new Error(`NotificationCenter: "overlay" must be an HTMLElement. Got: ${overlay}`);
    if (!(badge instanceof HTMLElement))
      throw new Error(`NotificationCenter: "badge" must be an HTMLElement. Got: ${badge}`);
    if (!(button instanceof HTMLElement))
      throw new Error(`NotificationCenter: "button" must be an HTMLElement. Got: ${button}`);

    const clearAllBtn = center?.querySelector('.clear-all');
    const list = center?.querySelector('.list') ?? null;
    if (!(list instanceof HTMLElement))
      throw new Error(
        `NotificationCenter: ".list" inside center must be an HTMLElement. Got: ${list}`,
      );

    this.#center = center;
    this.#list = list;
    this.#badge = badge;
    this.#button = button;
    this.#overlay = overlay;

    this.#button.addEventListener('click', () => this.toggle());
    this.#center.querySelector('.close')?.addEventListener('click', () => this.close());
    if (clearAllBtn) clearAllBtn.addEventListener('click', () => this.clear());
    this.#overlay.addEventListener('click', (e) => {
      if (e.target === this.#overlay) this.close();
    });
  }

  /**
   * Enable or disable automatic mark-as-read on close.
   * @param {boolean} value
   */
  setMarkAllAsReadOnClose(value) {
    if (typeof value !== 'boolean')
      throw new TypeError(`Expected boolean for markAllAsReadOnClose, got ${typeof value}`);
    this.#markAllAsReadOnClose = value;
  }

  /**
   * Define how long the remove animation takes (in ms).
   * @param {number} ms
   */
  setRemoveDelay(ms) {
    if (typeof ms !== 'number') throw new Error(`NotificationCenter: "ms" must be an number.`);
    this.#removeDelay = ms;
  }

  /**
   * Get rendering mode ('text' or 'html') by index.
   * @param {number} index
   * @returns {'text' | 'html' | null}
   */
  getItemMode(index) {
    const item = this.getItem(index);
    return item ? this.#modes.get(item) : null;
  }

  /**
   * Get a notify element by index.
   * @param {number} index
   * @returns {HTMLElement}
   */
  getItem(index) {
    const element = this.#list.children.item(index);
    if (!(element instanceof HTMLElement))
      throw new Error(`NotificationCenter: "item" must be an HTMLElement. Got: ${element}`);
    return element;
  }

  /**
   * Check if a notify exists at the given index.
   * @param {number} index
   * @returns {boolean}
   */
  hasItem(index) {
    return index >= 0 && index < this.#list.children.length;
  }

  /**
   * Mark a notification index as read.
   * @param {number|HTMLElement} index
   */
  markAsRead(index) {
    const item = index instanceof HTMLElement ? index : this.getItem(index);
    if (item.classList.contains('unread')) {
      item.classList.remove('unread');
      this.#updateCount(this.#count - 1);
    }
  }

  /**
   * Add a new notify to the center.
   * @param {string|{title?: string, message: string, onClick?: (e: MouseEvent) => void}} message
   * @param {'text'|'html'} [mode='text'] - How to treat the message content.
   */
  add(message, mode = 'text') {
    const item = document.createElement('div');
    item.className = 'item unread';

    // Wrapper for content + title
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content';

    let titleText = null;
    let messageText = null;
    let onClick = null;

    if (typeof message === 'object' && message !== null) {
      titleText = message.title;
      messageText = message.message;
      onClick = message.onClick;
    } else {
      messageText = message;
    }

    // Optional title
    if (titleText) {
      const titleElem = document.createElement('div');
      titleElem.className = 'title';
      titleElem.textContent = titleText;
      contentWrapper.appendChild(titleElem);
    }

    // Main message
    const messageElem = document.createElement('div');
    messageElem.className = 'message';

    if (mode === 'html') {
      messageElem.innerHTML = messageText;
    } else {
      messageElem.textContent = messageText;
    }

    contentWrapper.appendChild(messageElem);

    // Action by clicking (if provided)
    if (typeof onClick === 'function') {
      item.classList.add('clickable');
      item.addEventListener('click', (e) => {
        // Prevents the close button from clicking
        if (e.target instanceof HTMLElement && !e.target.closest('.notify-close')) {
          onClick(e);
        }
      });
    }

    // Close button aligned at the end
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notify-close';
    closeBtn.setAttribute('type', 'button');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevents propagation for the main onClick
      this.#removeItem(item);
    });

    item.append(contentWrapper, closeBtn);
    this.#list.prepend(item);
    this.#modes.set(item, mode);
    this.#updateCount(this.#count + 1);
  }

  /**
   * Remove a notify by index.
   * @param {number} index
   */
  remove(index) {
    const item = this.getItem(index);
    this.#removeItem(item);
  }

  /**
   * Clear all notifications safely.
   */
  clear() {
    let needAgain = true;
    while (needAgain) {
      needAgain = false;
      const items = Array.from(this.#list.children);
      for (const item of items) {
        if (item instanceof HTMLElement && !item.classList.contains('removing')) {
          this.#removeItem(item);
          needAgain = true;
        }
      }
    }
  }

  /**
   * Open the notify center.
   */
  open() {
    this.#overlay.classList.remove('hidden');
    this.#center.classList.add('open');
  }

  /**
   * Close the notify center.
   */
  close() {
    this.#overlay.classList.add('hidden');
    this.#center.classList.remove('open');
    if (this.#markAllAsReadOnClose) {
      const items = this.#list.querySelectorAll('.item.unread');
      for (const item of items) {
        if (item instanceof HTMLElement) this.markAsRead(item);
      }
    }
  }

  /**
   * Toggle open/close state.
   */
  toggle() {
    if (this.#center.classList.contains('open')) this.close();
    else this.open();
  }

  /**
   * Recalculate the number of notifications based on the actual DOM list.
   */
  recount() {
    const count = this.#list.querySelectorAll('.item.unread').length;
    this.#updateCount(count);
  }

  /**
   * Get current count.
   * @returns {number}
   */
  get count() {
    return this.#count;
  }
}

export default TinyNotifyCenter;
