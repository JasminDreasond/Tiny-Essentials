/**
 * Stores polling intervals associated with window references.
 * Used to detect when the window is closed.
 *
 * @type {WeakMap<Window|WindowProxy, NodeJS.Timeout>}
 */
const pollClosedInterval = new WeakMap();

/**
 * TinyNewWinEvents provides structured communication between a main window
 * and a child window (created using window.open) using postMessage.
 *
 * It supports routing, queuing messages until handshake is ready,
 * connection status checks, and close detection.
 *
 * @class
 */
class TinyNewWinEvents {
  /** @type {Window|WindowProxy|null} Reference to the opened or parent window */
  #windowRef;

  /** @type {string} Expected origin for postMessage communication */
  #targetOrigin;

  /** @type {Map<string, Set<Function>>} Registered route handlers for message events */
  #routeHandlers = new Map();

  /** @type {{ route: string, payload: any }[]} Queue of messages emitted before connection is ready */
  #pendingQueue = [];

  /** @type {boolean} True if handshake between windows is complete */
  #ready = false;

  /** @type {boolean} True if this instance is the main window (host) */
  #isHost = false;

  /** @type {NodeJS.Timeout|null} Interval for polling child window closure */
  #pollClosedInterval = null;

  /** @type {Set<() => void>} Callbacks triggered when window is closed */
  #onCloseCallbacks = new Set();

  /** @type {string} Internal message type for handshake */
  #readyEventName = '__TNE_READY__';

  /** @type {string} Internal message type for routed communication */
  #routeEventName = '__TNE_ROUTE__';

  /**
   * Initializes a TinyNewWinEvents instance for communication.
   *
   * @param {Object} [settings={}] Configuration object
   * @param {string} [settings.targetOrigin] Origin to enforce in postMessage
   * @param {string|WindowProxy} [settings.url] URL string to open, or a reference to an existing window
   * @param {string} [settings.name] Window name (required if opening a new window)
   * @param {string} [settings.features=''] Features string for window.open
   */
  constructor({ targetOrigin, url, name, features } = {}) {
    if (name === '_blank') throw new Error('Window name "_blank" is not allowed.');

    // Open Page
    if (typeof url === 'undefined') this.#windowRef = window.opener;
    // Main Page
    else {
      this.#windowRef = typeof url === 'string' ? window.open(url, name, features) : url;
      this.#isHost = true;
    }

    if (!this.#windowRef || pollClosedInterval.has(this.#windowRef))
      throw new Error('Invalid or duplicate window reference.');
    this.#targetOrigin = targetOrigin ?? window.location.origin;
    this._handleMessage = this.#handleMessage.bind(this);
    window.addEventListener('message', this._handleMessage, false);

    // Sends handshake if it is host (main window)
    if (!this.#isHost) {
      this.#postRaw(this.#readyEventName, null);
      this.#startCloseWatcher();
    }
  }

  /**
   * Returns the internal window reference.
   *
   * @returns {Window|WindowProxy|null}
   */
  getWin() {
    return this.#windowRef;
  }

  /**
   * Internal message handler.
   *
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

  /**
   * Sends all pending messages queued before handshake completion.
   *
   * @returns {void}
   */
  #flushQueue() {
    while (this.#pendingQueue.length) {
      const { route, payload } = this.#pendingQueue.shift();
      this.emit(route, payload);
    }
  }

  /**
   * Sends a raw postMessage with given type and payload.
   *
   * @param {string} type Internal message type
   * @param {any} payload Data to send
   * @param {string} [route=''] Optional route name
   * @returns {void}
   */
  #postRaw(type, payload, route = '') {
    if (this.#windowRef && this.#windowRef.closed) return;
    this.#windowRef?.postMessage({ type, route, payload }, this.#targetOrigin);
  }

  /**
   * Closes the child window (only allowed from the host).
   *
   * @returns {void}
   */
  close() {
    if (!this.#isHost) throw new Error('Only host can close the window.');
    if (this.#windowRef && !this.#windowRef.closed) this.#windowRef.close();
  }

  /**
   * Emits a message to the other window on a specific route.
   * If the handshake is not yet complete, the message is queued.
   * Throws an error if the instance has already been destroyed.
   *
   * @param {string} route - Route name used to identify the message handler.
   * @param {any} payload - Data to send along with the message.
   * @throws {Error} If the instance is already destroyed.
   * @returns {void}
   */
  emit(route, payload) {
    if (typeof route !== 'string') throw new TypeError('Event name must be a string.');
    if (this.isDestroyed()) throw new Error('Cannot emit: instance has been destroyed.');
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

  /**
   * Checks if the connection is active and the window is still open.
   *
   * @returns {boolean}
   */
  isConnected() {
    return this.#ready && this.#windowRef && !this.#windowRef.closed ? true : false;
  }

  /**
   * Returns the current window reference.
   *
   * @returns {Window|null}
   */
  getWinRef() {
    return this.#windowRef;
  }

  /**
   * Starts polling to detect when the window is closed.
   *
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

  /**
   * Checks if the communication instance has been destroyed.
   *
   * @returns {boolean}
   */
  isDestroyed() {
    return !this.#windowRef;
  }

  /**
   * Destroys the communication instance, cleaning up all resources and listeners.
   *
   * @returns {void}
   */
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
}

export default TinyNewWinEvents;
