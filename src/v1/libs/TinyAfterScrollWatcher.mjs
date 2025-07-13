/**
 * @typedef {(() => void)} FnData - Function with no arguments and no return value
 */

/**
 * A function that handles a scroll event.
 * It receives a standard `Event` object when a scroll occurs.
 *
 * @typedef {(ev: Event) => void} OnScrollFunc
 */

/**
 * A scroll tracker that queues functions to be executed
 * after the user stops scrolling a specific element or the window.
 */
class TinyAfterScrollWatcher {
  /** @type {Element|Window} */
  #scrollTarget;

  /** @type {null|NodeJS.Timeout} */
  #lastScrollTime = null;

  /** @type {FnData[]} */
  #afterScrollQueue = [];

  /** @type {number} */
  #inactivityTime = 100;

  /** @type {Set<OnScrollFunc>} */
  #externalScrollListeners = new Set();

  /** @type {Set<FnData>} */
  #onStopListeners = new Set();

  /** @type {boolean} */
  #destroyed = false;

  /**
   * @param {Element|Window} scrollTarget - The element or window to track scrolling on
   * @param {number} [inactivityTime=100] - Time in milliseconds to wait after scroll ends before executing the queue
   * @throws {TypeError} If scrollTarget is not a valid Element or Window
   * @throws {TypeError} If inactivityTime is not a positive number
   */
  constructor(scrollTarget = window, inactivityTime = 100) {
    if (!(scrollTarget instanceof Element) && !(scrollTarget instanceof Window))
      throw new TypeError('scrollTarget must be an Element or the Window object.');
    this.#scrollTarget = scrollTarget;
    this._checkTimer = this._checkTimer.bind(this);

    this.#scrollTarget.addEventListener('scroll', this._checkTimer);
    this.#inactivityTime = inactivityTime;
  }

  _checkTimer = () => {
    if (this.#lastScrollTime) clearTimeout(this.#lastScrollTime);
    this.#lastScrollTime = setTimeout(() => {
      this.#lastScrollTime = null;
      this.#checkQueue();
    }, this.#inactivityTime);
  };

  /**
   * Gets the current inactivity time in milliseconds.
   * @returns {number}
   */
  get inactivityTime() {
    return this.#inactivityTime;
  }

  /**
   * Sets a new inactivity time.
   * Must be a positive number (in milliseconds).
   * @param {number} value
   * @throws {Error} If value is not a positive number
   */
  set inactivityTime(value) {
    if (typeof value !== 'number' || value <= 0 || !Number.isFinite(value))
      throw new Error('inactivityTime must be a positive number in milliseconds.');
    this.#inactivityTime = value;
  }

  /**
   * Continuously checks whether the user has stopped scrolling,
   * and if so, runs all queued functions.
   */
  #checkQueue() {
    if (this.#destroyed) return;
    // Runs all onStop first listeners
    for (const fn of this.#onStopListeners) {
      if (typeof fn === 'function') fn();
    }

    // Then execute the queue afterScrollQueue
    while (this.#afterScrollQueue.length) {
      const fn = this.#afterScrollQueue.pop();
      if (typeof fn === 'function') fn();
    }
  }

  /**
   * Adds a function to be executed after scroll has stopped.
   * The scroll is considered "stopped" after the configured inactivity time.
   *
   * @param {() => void} fn - A function to execute once scrolling has stopped.
   * @throws {TypeError} If the argument is not a function.
   */
  doAfterScroll(fn) {
    if (typeof fn !== 'function') throw new TypeError('Argument must be a function.');
    this.lastScrollTime = Date.now();
    this.#afterScrollQueue.push(fn);
  }

  /**
   * Registers a function to run once after scrolling has stopped,
   * before any afterScrollQueue functions.
   *
   * @param {FnData} fn - A function to execute after scroll stop.
   * @throws {TypeError} If the argument is not a function.
   */
  onStop(fn) {
    if (typeof fn !== 'function') throw new TypeError('Argument must be a function.');
    this.#onStopListeners.add(fn);
  }

  /**
   * Removes a previously registered onStop function.
   *
   * @param {FnData} fn - The function to remove.
   * @throws {TypeError} If the argument is not a function.
   */
  offStop(fn) {
    if (typeof fn !== 'function') throw new TypeError('Argument must be a function.');
    this.#onStopListeners.delete(fn);
  }

  /**
   * Registers an external scroll listener on the tracked element.
   *
   * @param {OnScrollFunc} fn - The scroll listener to add
   * @throws {TypeError} If the argument is not a function.
   */
  onScroll(fn) {
    if (typeof fn !== 'function') throw new TypeError('Argument must be a function.');
    this.#scrollTarget.addEventListener('scroll', fn);
    this.#externalScrollListeners.add(fn);
  }

  /**
   * Removes a previously registered scroll listener from the tracked element.
   *
   * @param {OnScrollFunc} fn - The scroll listener to remove
   * @throws {TypeError} If the argument is not a function.
   */
  offScroll(fn) {
    if (typeof fn !== 'function') throw new TypeError('Argument must be a function.');
    if (this.#externalScrollListeners.has(fn)) {
      this.#scrollTarget.removeEventListener('scroll', fn);
      this.#externalScrollListeners.delete(fn);
    }
  }

  /**
   * Destroys the watcher by removing internal listeners and clearing data.
   */
  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;

    this.#scrollTarget.removeEventListener('scroll', this._checkTimer);
    for (const fn of this.#externalScrollListeners)
      this.#scrollTarget.removeEventListener('scroll', fn);

    this.#externalScrollListeners.clear();
    this.#onStopListeners.clear();
  }
}

export default TinyAfterScrollWatcher;
