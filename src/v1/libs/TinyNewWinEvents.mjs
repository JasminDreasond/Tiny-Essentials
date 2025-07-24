/** @type {WeakMap<Window|WindowProxy, NodeJS.Timeout>} */
const pollClosedInterval = new WeakMap();

/**
 * @class
 */
class TinyNewWinEvents {
  /** @type {Window|WindowProxy|null} */
  #windowRef;

  /** @type {string} */
  #targetOrigin;

  /** @type {Map<string, Set<Function>>} */
  #routeHandlers = new Map();

  /** @type {{ route: string, payload: any }[]} */
  #pendingQueue = [];

  /** @type {boolean} */
  #ready = false;

  /** @type {boolean} */
  #isHost = false;

  /** @type {NodeJS.Timeout|null} */
  #pollClosedInterval = null;

  /** @type {Set<() => void>} */
  #onCloseCallbacks = new Set();

  #readyEventName = '__TNE_READY__';
  #routeEventName = '__TNE_ROUTE__';

  /**
   * @param {Object} [settings={}]
   * @param {string} [settings.targetOrigin]
   * @param {string|WindowProxy} [settings.url]
   * @param {string} [settings.name]
   * @param {string} [settings.features='']
   */
  constructor({ targetOrigin, url, name, features } = {}) {
    if (name === '_blank') throw new Error('');

    // Open Page
    if (typeof url === 'undefined') this.#windowRef = window.opener;
    // Main Page
    else {
      this.#windowRef = typeof url === 'string' ? window.open(url, name, features) : url;
      this.#isHost = true;
    }

    if (!this.#windowRef || pollClosedInterval.has(this.#windowRef)) throw new Error('');
    this.#targetOrigin = targetOrigin ?? window.location.origin;
    this._handleMessage = this.#handleMessage.bind(this);
    window.addEventListener('message', this._handleMessage, false);

    // Sends handshake if it is host (main window)
    if (!this.#isHost) {
      this.#postRaw(this.#readyEventName, null);
      this.#startCloseWatcher();
    }
  }

  getWin() {
    return this.#windowRef;
  }

  /**
   * @param {MessageEvent} event
   * @returns {void}
   */
  #handleMessage(event) {
    if (!event.source || (this.#windowRef && event.source !== this.#windowRef)) return;
    const { type, route, payload } = event.data || {};

    if (type === this.#readyEventName) {
      this.#ready = true;
      this.#flushQueue();
      this.#startCloseWatcher(); // start watcher after handshake (for child window)
      if (this.#isHost) this.#postRaw(this.#readyEventName, null);
      return;
    }

    if (type === this.#routeEventName && this.#routeHandlers.has(route)) {
      for (const cb of this.#routeHandlers.get(route)) {
        cb(payload, event);
      }
    }
  }

  /** @returns {void} */
  #flushQueue() {
    while (this.#pendingQueue.length) {
      const { route, payload } = this.#pendingQueue.shift();
      this.emit(route, payload);
    }
  }

  /**
   * @param {string} type
   * @param {any} payload
   * @param {string} [route='']
   * @returns {void}
   */
  #postRaw(type, payload, route = '') {
    if (this.#windowRef && this.#windowRef.closed) return;
    this.#windowRef?.postMessage({ type, route, payload }, this.#targetOrigin);
  }

  close() {
    if (!this.#isHost) throw new Error('');
    if (this.#windowRef && !this.#windowRef.closed) this.#windowRef.close();
  }

  /**
   * @param {string} route
   * @param {any} payload
   * @returns {void}
   */
  emit(route, payload) {
    if (!this.#ready) {
      this.#pendingQueue.push({ route, payload });
      return;
    }
    this.#postRaw(this.#routeEventName, payload, route);
  }

  /**
   * @param {string} route
   * @param {(payload: any, event: MessageEvent) => void} callback
   * @returns {void}
   */
  on(route, callback) {
    if (!this.#routeHandlers.has(route)) {
      this.#routeHandlers.set(route, new Set());
    }
    this.#routeHandlers.get(route).add(callback);
  }

  /**
   * @param {string} route
   * @param {(payload: any, event: MessageEvent) => void} callback
   * @returns {void}
   */
  off(route, callback) {
    if (this.#routeHandlers.has(route)) {
      this.#routeHandlers.get(route).delete(callback);
      if (this.#routeHandlers.get(route).size === 0) {
        this.#routeHandlers.delete(route);
      }
    }
  }

  /** @returns {void} */
  destroy() {
    if (!this.#windowRef) return;
    window.removeEventListener('message', this._handleMessage);
    this.#routeHandlers.clear();
    this.#pendingQueue = [];
    this.#ready = false;
    if (this.#pollClosedInterval) {
      clearInterval(this.#pollClosedInterval);
      this.#pollClosedInterval = null;
      pollClosedInterval.delete(this.#windowRef);
    }
    this.#windowRef = null;
    this.#onCloseCallbacks.clear();
  }

  /** @returns {boolean} */
  isConnected() {
    return this.#ready && this.#windowRef && !this.#windowRef.closed ? true : false;
  }

  /** @returns {Window|null} */
  getWindowRef() {
    return this.#windowRef;
  }

  /**
   * @returns {void}
   */
  #startCloseWatcher() {
    if (!this.#windowRef || this.#pollClosedInterval) return;
    this.#pollClosedInterval = setInterval(() => {
      if (this.#windowRef?.closed) {
        for (const cb of this.#onCloseCallbacks) cb();
        this.destroy();
      }
    }, 500);
    pollClosedInterval.set(this.#windowRef, this.#pollClosedInterval);
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  onClose(callback) {
    this.#onCloseCallbacks.add(callback);
  }

  /**
   * @param {() => void} callback
   * @returns {void}
   */
  offClose(callback) {
    this.#onCloseCallbacks.delete(callback);
  }
}

export default TinyNewWinEvents;
