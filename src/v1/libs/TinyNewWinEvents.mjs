import TinyEvents from './TinyEvents.mjs';

/**
 * Stores polling intervals associated with window references.
 * Used to detect when the window is closed.
 *
 * @type {WeakMap<Window, NodeJS.Timeout>}
 */
const pollClosedInterval = new WeakMap();

/**
 * @callback handler
 * A function to handle incoming event payloads.
 * @param {any} payload - The data sent by the emitter.
 * @param {MessageEvent<any>} event - Metadata about the message.
 */

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
  #events = new TinyEvents();

  /**
   * Enables or disables throwing an error when the maximum number of listeners is exceeded.
   *
   * @param {boolean} shouldThrow - If true, an error will be thrown when the max is exceeded.
   */
  setThrowOnMaxListeners(shouldThrow) {
    return this.#events.setThrowOnMaxListeners(shouldThrow);
  }

  /**
   * Checks whether an error will be thrown when the max listener limit is exceeded.
   *
   * @returns {boolean} True if an error will be thrown, false if only a warning is shown.
   */
  getThrowOnMaxListeners() {
    return this.#events.getThrowOnMaxListeners();
  }

  /////////////////////////////////////////////////////////////

  /**
   * Adds a listener to the beginning of the listeners array for the specified event.
   *
   * @param {string|string[]} event - Event name.
   * @param {handler} handler - The callback function.
   */
  prependListener(event, handler) {
    return this.#events.prependListener(event, handler);
  }

  /**
   * Adds a one-time listener to the beginning of the listeners array for the specified event.
   *
   * @param {string|string[]} event - Event name.
   * @param {handler} handler - The callback function.
   * @returns {handler[]} - The wrapped handler used internally.
   */
  prependListenerOnce(event, handler) {
    return this.#events.prependListenerOnce(event, handler);
  }

  //////////////////////////////////////////////////////////////////////

  /**
   * Adds a event listener.
   *
   * @param {string|string[]} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - Callback function to be called when event fires.
   */
  appendListener(event, handler) {
    return this.#events.appendListener(event, handler);
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string|string[]} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - The callback function to run on event.
   * @returns {handler[]} - The wrapped version of the handler.
   */
  appendListenerOnce(event, handler) {
    return this.#events.appendListenerOnce(event, handler);
  }

  /**
   * Adds a event listener.
   *
   * @param {string|string[]} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - Callback function to be called when event fires.
   */
  on(event, handler) {
    return this.#events.on(event, handler);
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string|string[]} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - The callback function to run on event.
   * @returns {handler[]} - The wrapped version of the handler.
   */
  once(event, handler) {
    return this.#events.once(event, handler);
  }

  ////////////////////////////////////////////////////////////////////

  /**
   * Removes a previously registered event listener.
   *
   * @param {string|string[]} event - The name of the event to remove the handler from.
   * @param {handler} handler - The specific callback function to remove.
   */
  off(event, handler) {
    return this.#events.off(event, handler);
  }

  /**
   * Removes all event listeners of a specific type from the element.
   *
   * @param {string|string[]} event - The event type to remove (e.g. 'onScrollBoundary').
   */
  offAll(event) {
    return this.#events.offAll(event);
  }

  /**
   * Removes all event listeners of all types from the element.
   */
  offAllTypes() {
    return this.#events.offAllTypes();
  }

  ////////////////////////////////////////////////////////////

  /**
   * Returns the number of listeners for a given event.
   *
   * @param {string} event - The name of the event.
   * @returns {number} Number of listeners for the event.
   */
  listenerCount(event) {
    return this.#events.listenerCount(event);
  }

  /**
   * Returns a copy of the array of listeners for the specified event.
   *
   * @param {string} event - The name of the event.
   * @returns {handler[]} Array of listener functions.
   */
  listeners(event) {
    return this.#events.listeners(event);
  }

  /**
   * Returns a copy of the array of listeners for the specified event.
   *
   * @param {string} event - The name of the event.
   * @returns {handler[]} Array of listener functions.
   */
  onceListeners(event) {
    return this.#events.onceListeners(event);
  }

  /**
   * Returns a copy of the internal listeners array for the specified event,
   * including wrapper functions like those used by `.once()`.
   * @param {string | symbol} event - The event name.
   * @returns {handler[]} An array of raw listener functions.
   */
  allListeners(event) {
    return this.#events.allListeners(event);
  }

  /**
   * Returns an array of event names for which there are registered listeners.
   *
   * @returns {string[]} Array of registered event names.
   */
  eventNames() {
    return this.#events.eventNames();
  }

  //////////////////////////////////////////////////////

  /**
   * Sets the maximum number of listeners per event before a warning is shown.
   *
   * @param {number} n - The maximum number of listeners.
   */
  setMaxListeners(n) {
    return this.#events.setMaxListeners(n);
  }

  /**
   * Gets the maximum number of listeners allowed per event.
   *
   * @returns {number} The maximum number of listeners.
   */
  getMaxListeners() {
    return this.#events.getMaxListeners();
  }

  ///////////////////////////////////////////////////

  /** @type {Window|null} Reference to the opened or parent window */
  #windowRef;

  /** @type {string} Expected origin for postMessage communication */
  #targetOrigin;

  /** @type {{ route: string, payload: any }[]} Queue of messages emitted before connection is ready */
  #pendingQueue = [];

  /** @type {boolean} True if handshake between windows is complete */
  #ready = false;

  /** @type {boolean} True if this instance is the main window (host) */
  #isHost = false;

  /** @type {NodeJS.Timeout|null} Interval for polling child window closure */
  #pollClosedInterval = null;

  /** @type {string} Internal message type for handshake */
  #readyEventName = '__TNE_READY__';

  /** @type {string} Internal message type for routed communication */
  #routeEventName = '__TNE_ROUTE__';

  /**
   * Gets the internal handshake event name.
   * @returns {string}
   */
  get readyEventName() {
    return this.#readyEventName;
  }

  /**
   * Sets the internal handshake event name.
   * @param {string} name
   * @throws {TypeError} If the value is not a string.
   */
  set readyEventName(name) {
    if (typeof name !== 'string')
      throw new TypeError('TinyNewWinEvents: readyEventName must be a string.');
    this.#readyEventName = name;
  }

  /**
   * Gets the internal route event name.
   * @returns {string}
   */
  get routeEventName() {
    return this.#routeEventName;
  }

  /**
   * Sets the internal route event name.
   * @param {string} name
   * @throws {TypeError} If the value is not a string.
   */
  set routeEventName(name) {
    if (typeof name !== 'string')
      throw new TypeError('TinyNewWinEvents: routeEventName must be a string.');
    this.#routeEventName = name;
  }

  /**
   * Initializes a TinyNewWinEvents instance for communication.
   *
   * @param {Object} [settings={}] Configuration object.
   * @param {string} [settings.targetOrigin] Origin to enforce in postMessage.
   * @param {string} [settings.url] URL string to open.
   * @param {string} [settings.name] Window name (required if opening a new window).
   * @param {string} [settings.features] Features string for `window.open`.
   *
   * @throws {Error} If `name` is "_blank", which is not allowed.
   * @throws {TypeError} If `targetOrigin`, `url`, or `features` are not strings (when provided).
   * @throws {Error} If the window reference is invalid or already being tracked.
   */
  constructor({ targetOrigin, url, name, features } = {}) {
    if (typeof name === 'string' && name === '_blank')
      throw new Error(
        'TinyNewWinEvents: The window name "_blank" is not supported. Please use a custom name to allow tracking.',
      );
    if (typeof targetOrigin !== 'undefined' && typeof targetOrigin !== 'string')
      throw new TypeError('TinyNewWinEvents: The "targetOrigin" option must be a string.');
    if (typeof url !== 'undefined' && typeof url !== 'string')
      throw new TypeError('TinyNewWinEvents: The "url" option must be a string.');
    if (typeof features !== 'undefined' && typeof features !== 'string')
      throw new TypeError('TinyNewWinEvents: The "features" option must be a string if provided.');

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
   * @returns {Window|null}
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

    if (type === this.#routeEventName) this.#events.emit(route, payload, event);
  }

  /**
   * Sends all pending messages queued before handshake completion.
   *
   * @returns {void}
   */
  #flushQueue() {
    while (this.#pendingQueue.length) {
      const data = this.#pendingQueue.shift();
      if (data) {
        const { route, payload } = data;
        this.emit(route, payload);
      }
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
   * Checks if the connection is active and the window is still open.
   *
   * @returns {boolean}
   */
  isConnected() {
    return this.#ready && this.#windowRef && !this.#windowRef.closed ? true : false;
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
        this.#events.emit('WINDOW_REF_CLOSED');
        this.destroy();
      }
    }, 500);
    pollClosedInterval.set(this.#windowRef, this.#pollClosedInterval);
  }

  /**
   * Registers a callback for when the window is closed.
   *
   * @param {handler} callback Callback to run on close
   * @returns {void}
   */
  onClose(callback) {
    return this.#events.on('WINDOW_REF_CLOSED', callback);
  }

  /**
   * Unregisters a previously registered close callback.
   *
   * @param {handler} callback Callback to remove
   * @returns {void}
   */
  offClose(callback) {
    return this.#events.off('WINDOW_REF_CLOSED', callback);
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
    if (this.#pollClosedInterval) {
      clearInterval(this.#pollClosedInterval);
      this.#pollClosedInterval = null;
      pollClosedInterval.delete(this.#windowRef);
    }
    window.removeEventListener('message', this._handleMessage);
    this.#pendingQueue = [];
    this.#ready = false;
    this.#windowRef = null;
    this.#events.offAllTypes();
  }
}

export default TinyNewWinEvents;
