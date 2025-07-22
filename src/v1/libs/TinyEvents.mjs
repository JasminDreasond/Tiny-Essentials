/**
 * A generic event listener callback function.
 *
 * @callback handler
 * @param {any} payload - The data payload passed when the event is triggered.
 * @returns {void}
 */

/**
 * TinyEvents provides a minimalistic event emitter system similar to Node.js's EventEmitter,
 * enabling components to subscribe to, emit, and manage events and their listeners.
 *
 * Features include:
 * - Adding/removing event listeners (`on`, `off`, `offAll`, `offAllTypes`)
 * - One-time listeners (`once`)
 * - Emitting events (`emit`)
 * - Listener inspection and limits (`listenerCount`, `listeners`, `eventNames`)
 * - Maximum listener control (`setMaxListeners`, `getMaxListeners`)
 *
 * This class is useful for lightweight, dependency-free publish/subscribe event handling
 * within modular JavaScript applications.
 *
 * @class
 */
class TinyEvents {
  /** @type {Map<string, handler[]>} */
  #listeners = new Map();

  /** @type {number} */
  #maxListeners = 10;

  /**
   * Adds a event listener.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - Callback function to be called when event fires.
   */
  on(event, handler) {
    if (typeof event !== 'string')
      throw new TypeError('on(event, handler): event name must be a string');
    if (typeof handler !== 'function')
      throw new TypeError('on(event, handler): handler must be a function');

    let eventData = this.#listeners.get(event);
    if (!Array.isArray(eventData)) {
      eventData = [];
      this.#listeners.set(event, eventData);
    }
    eventData.push(handler);
    // Warn if listener count exceeds the max allowed
    const max = this.#maxListeners;
    if (max > 0 && eventData.length > max) {
      console.warn(
        `Possible memory leak detected. ${eventData.length} "${event}" listeners added. ` +
          `Use setMaxListeners() to increase limit.`,
      );
    }
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - The callback function to run on event.
   */
  once(event, handler) {
    if (typeof event !== 'string') throw new TypeError('The event name must be a string.');
    if (typeof handler !== 'function')
      throw new TypeError('once(event, handler): handler must be a function');

    /** @type {handler} */
    const wrapped = (e) => {
      this.off(event, wrapped);
      if (typeof handler === 'function') handler(e);
    };
    this.on(event, wrapped);
  }

  /**
   * Removes a previously registered event listener.
   *
   * @param {string} event - The name of the event to remove the handler from.
   * @param {handler} handler - The specific callback function to remove.
   */
  off(event, handler) {
    if (typeof event !== 'string')
      throw new TypeError('off(event, handler): event name must be a string');
    if (typeof handler !== 'function')
      throw new TypeError('off(event, handler): handler must be a function');

    const listeners = this.#listeners.get(event);
    if (!Array.isArray(listeners)) return;

    const index = listeners.indexOf(handler);
    if (index !== -1) listeners.splice(index, 1);

    // Optionally clean up empty arrays (optional)
    if (listeners.length === 0) this.#listeners.delete(event);
  }

  /**
   * Removes all event listeners of a specific type from the element.
   *
   * @param {string} event - The event type to remove (e.g. 'onScrollBoundary').
   */
  offAll(event) {
    if (typeof event !== 'string') throw new TypeError('The event name must be a string.');
    this.#listeners.delete(event);
  }

  /**
   * Removes all event listeners of all types from the element.
   */
  offAllTypes() {
    this.#listeners.clear();
  }

  /**
   * Returns the number of listeners for a given event.
   *
   * @param {string} event - The name of the event.
   * @returns {number} Number of listeners for the event.
   */
  listenerCount(event) {
    if (typeof event !== 'string')
      throw new TypeError('listenerCount(event): event name must be a string');

    const listeners = this.#listeners.get(event);
    return Array.isArray(listeners) ? listeners.length : 0;
  }

  /**
   * Returns a copy of the array of listeners for the specified event.
   *
   * @param {string} event - The name of the event.
   * @returns {handler[]} Array of listener functions.
   */
  listeners(event) {
    if (typeof event !== 'string')
      throw new TypeError('listeners(event): event name must be a string');

    const listeners = this.#listeners.get(event);
    return Array.isArray(listeners) ? [...listeners] : [];
  }

  /**
   * Returns an array of event names for which there are registered listeners.
   *
   * @returns {string[]} Array of registered event names.
   */
  eventNames() {
    return [...this.#listeners.keys()];
  }

  /**
   * Emits an event, triggering all registered handlers for that event.
   *
   * @param {string} event - The event name to emit.
   * @param {any} [payload] - Optional data to pass to each handler.
   * @returns {boolean} True if any listeners were called, false otherwise.
   */
  emit(event, payload) {
    if (typeof event !== 'string')
      throw new TypeError('emit(event, data): event name must be a string');

    const listeners = this.#listeners.get(event);
    if (!Array.isArray(listeners) || listeners.length === 0) return false;

    // Call all listeners with the provided data
    listeners.forEach((fn) => fn(payload));
    return true;
  }

  /**
   * Sets the maximum number of listeners per event before a warning is shown.
   *
   * @param {number} n - The maximum number of listeners.
   */
  setMaxListeners(n) {
    if (!Number.isInteger(n) || n < 0)
      throw new TypeError('setMaxListeners(n): n must be a non-negative integer');
    this.#maxListeners = n;
  }

  /**
   * Gets the maximum number of listeners allowed per event.
   *
   * @returns {number} The maximum number of listeners.
   */
  getMaxListeners() {
    return this.#maxListeners;
  }
}

export default TinyEvents;
