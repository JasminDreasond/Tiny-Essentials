import { isJsonObject } from '../basics/objChecker.mjs';
import TinyEvents from './TinyEvents.mjs';

/**
 * @typedef {Record<string|number|symbol, any>|any[]|Map<string|number|symbol, any>|Set<any>} LocalStorageJsonValue
 */

class TinyLocalStorage {
  /** @typedef {import('./TinyEvents.mjs').handler} handler */

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
   * @param {string} event - Event name.
   * @param {handler} handler - The callback function.
   */
  prepend(event, handler) {
    return this.#events.prepend(event, handler);
  }

  /**
   * Adds a one-time listener to the beginning of the listeners array for the specified event.
   *
   * @param {string} event - Event name.
   * @param {handler} handler - The callback function.
   * @returns {handler} - The wrapped handler used internally.
   */
  prependOnce(event, handler) {
    return this.#events.prependOnce(event, handler);
  }

  //////////////////////////////////////////////////////////////////////

  /**
   * Adds a event listener.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - Callback function to be called when event fires.
   */
  append(event, handler) {
    return this.#events.append(event, handler);
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - The callback function to run on event.
   * @returns {handler} - The wrapped version of the handler.
   */
  appendOnce(event, handler) {
    return this.#events.appendOnce(event, handler);
  }

  /**
   * Adds a event listener.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - Callback function to be called when event fires.
   */
  on(event, handler) {
    return this.#events.on(event, handler);
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - The callback function to run on event.
   * @returns {handler} - The wrapped version of the handler.
   */
  once(event, handler) {
    return this.#events.once(event, handler);
  }

  ////////////////////////////////////////////////////////////////////

  /**
   * Removes a previously registered event listener.
   *
   * @param {string} event - The name of the event to remove the handler from.
   * @param {handler} handler - The specific callback function to remove.
   */
  off(event, handler) {
    return this.#events.off(event, handler);
  }

  /**
   * Removes all event listeners of a specific type from the element.
   *
   * @param {string} event - The event type to remove (e.g. 'onScrollBoundary').
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
   * Emits an event, triggering all registered handlers for that event.
   *
   * @param {string} event - The event name to emit.
   * @param {...any} payload - Optional data to pass to each handler.
   * @returns {boolean} True if any listeners were called, false otherwise.
   */
  emit(event, ...payload) {
    return this.#events.emit(event, ...payload);
  }

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

  /** @type {Storage} */
  #localStorage = window.localStorage;

  /** @type {(ev: StorageEvent) => any} */
  #storageEvent = (ev) => this.emit('storage', ev);

  constructor() {
    window.addEventListener('storage', this.#storageEvent);
  }

  /**
   * Defines a custom storage interface (e.g. `sessionStorage`).
   *
   * @param {Storage} localstorage - A valid Storage object (localStorage or sessionStorage).
   */
  setLocalStorage(localstorage) {
    if (!(localstorage instanceof Storage))
      throw new Error('Argument must be a valid instance of Storage.');
    this.#localStorage = localstorage;
  }

  /**
   * Checks if `localStorage` is supported by the current environment.
   *
   * @returns {boolean} True if `localStorage` exists, false otherwise.
   */
  localStorageExists() {
    return this.#localStorage instanceof Storage;
  }

  /**
   * Stores a JSON-compatible value in `localStorage`.
   *
   * If the value is a `Map` or `Set`, it will be converted to an object with a marker before serialization.
   *
   * @param {string} name - The key under which to store the data.
   * @param {LocalStorageJsonValue} data - The data to be serialized and stored.
   */
  setJson(name, data) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');

    let valueToStore = data;

    if (data instanceof Map) {
      valueToStore = {
        __map__: true,
        data: Array.from(data.entries()),
      };
    } else if (data instanceof Set) {
      valueToStore = {
        __set__: true,
        data: Array.from(data),
      };
    } else if (!isJsonObject(data) && !Array.isArray(data)) {
      throw new Error('The storage value is not a valid JSON-compatible structure.');
    }

    this.emit('setJson', name, data);
    this.#localStorage.setItem(name, JSON.stringify(valueToStore));
  }

  /**
   * Retrieves and parses a JSON value from `localStorage`.
   *
   * Automatically restores `Map` or `Set` if stored with special markers.
   *
   * @param {string} name - The key to retrieve.
   * @param {'array'|'obj'|'map'|'null'} [defaultData] - Default fallback format if value is invalid.
   * @returns {LocalStorageJsonValue|null} The parsed object or fallback.
   */
  getJson(name, defaultData) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');

    const raw = this.#localStorage.getItem(name);
    const fallback =
      defaultData === 'obj'
        ? {}
        : defaultData === 'array'
          ? []
          : defaultData === 'map'
            ? new Map()
            : null;

    let parsed;

    try {
      // @ts-ignore
      parsed = JSON.parse(raw);
    } catch {
      // @ts-ignore
      return fallback;
    }

    if (parsed && typeof parsed === 'object') {
      if (parsed.__map__ === true && Array.isArray(parsed.data)) {
        return new Map(parsed.data);
      }
      if (parsed.__set__ === true && Array.isArray(parsed.data)) {
        return new Set(parsed.data);
      }
    }

    if (Array.isArray(parsed) || isJsonObject(parsed)) {
      return parsed;
    }

    return fallback;
  }

  /**
   * Stores a raw string value in `localStorage`.
   *
   * @param {string} name - The key to use.
   * @param {any} data - The data to store.
   */
  setItem(name, data) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');
    this.emit('setItem', name, data);
    return this.#localStorage.setItem(name, data);
  }

  /**
   * Retrieves a raw string value from `localStorage`.
   *
   * @param {string} name - The key to retrieve.
   * @returns {string|null} The stored value or null if not found.
   */
  getItem(name) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');
    return this.#localStorage.getItem(name);
  }

  /**
   * Stores a string in `localStorage`, ensuring the data is a valid string.
   *
   * @param {string} name - The key to store the string under.
   * @param {string} data - The string to store.
   */
  setString(name, data) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');
    if (typeof data !== 'string') throw new Error('Value must be a string.');

    this.emit('setString', name, data);
    return this.#localStorage.setItem(name, data);
  }

  /**
   * Retrieves a string value from `localStorage`.
   *
   * @param {string} name - The key to retrieve.
   * @returns {string|null} The string if valid, or null.
   */
  getString(name) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');
    let value = this.#localStorage.getItem(name);
    if (typeof value === 'string') return value;
    return null;
  }

  /**
   * Stores a number value in `localStorage`.
   *
   * @param {string} name - The key to use.
   * @param {number} data - The number to store.
   */
  setNumber(name, data) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');
    if (typeof data !== 'number') throw new Error('Value must be a number.');
    this.emit('setNumber', name, data);
    return this.#localStorage.setItem(name, String(data));
  }

  /**
   * Retrieves a number from `localStorage`.
   *
   * @param {string} name - The key to retrieve.
   * @returns {number|null} The number or null if invalid.
   */
  getNumber(name) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');

    /** @type {number|string|null} */
    let number = this.#localStorage.getItem(name);
    if (typeof number === 'number') return number;
    if (typeof number === 'string' && number.length > 0) {
      number = parseFloat(number);
      if (!Number.isNaN(number)) return number;
    }
    return null;
  }

  /**
   * Stores a boolean value in `localStorage`.
   *
   * @param {string} name - The key to use.
   * @param {boolean} data - The boolean value to store.
   */
  setBool(name, data) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');
    if (typeof data !== 'boolean') throw new Error('Value must be a boolean.');
    this.emit('setBool', name, data);
    return this.#localStorage.setItem(name, String(data));
  }

  /**
   * Retrieves a boolean value from `localStorage`.
   *
   * @param {string} name - The key to retrieve.
   * @returns {boolean|null} The boolean or null if invalid.
   */
  getBool(name) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');

    const value = this.#localStorage.getItem(name);
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }

    return null;
  }

  /**
   * Removes a value from `localStorage`.
   *
   * @param {string} name - The key to remove.
   */
  removeItem(name) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');

    this.emit('removeItem', name);
    return this.#localStorage.removeItem(name);
  }

  /**
   * Clears all data from `localStorage`.
   */
  clearLocalStorage() {
    this.#localStorage.clear();
  }

  /**
   * Destroys the storage instance by removing the storage event listener.
   */
  destroy() {
    window.removeEventListener('storage', this.#storageEvent);
  }
}

export default TinyLocalStorage;
