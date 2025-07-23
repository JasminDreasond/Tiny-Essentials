import { isJsonObject } from '../basics/objChecker.mjs';
import TinyEvents from './TinyEvents.mjs';

/** @type {Map<any, EncodeFn>} */
const customEncoders = new Map();

/** @type {Map<any, DecodeFn>} */
const customDecoders = new Map();

/**
 * A function that encodes a value into a serializable JSON-compatible format.
 *
 * @callback EncodeFn
 * @param {any} value - The value to encode.
 * @param {encodeSpecialJson} encodeSpecialJson - Recursive encoder helper.
 * @returns {any} The encoded value.
 */

/**
 * An object that defines how to check and decode a specific serialized type.
 *
 * @typedef {Object} DecodeFn
 * @property {(value: any) => any} check - Checks if the value matches the custom encoded structure.
 * @property {(value: any, decodeSpecialJson: decodeSpecialJson) => any} decode - Decodes the structure back into its original form.
 */

/**
 * Encodes extended JSON-compatible structures recursively.
 * @callback encodeSpecialJson
 * @param {any} value
 * @returns {any}
 */

/**
 * Decodes extended JSON-compatible structures recursively.
 * @callback decodeSpecialJson
 * @param {any} value
 * @returns {any}
 */

/**
 * Represents a value that can be safely stored and restored using JSON in `localStorage`,
 * including structures like arrays, plain objects, Map and Set.
 *
 * - `Record<string|number|symbol, any>` → plain object (e.g., `{ key: value }`)
 * - `any[]` → array of any JSON-serializable values
 * - `Map<string|number|symbol, any>` → converted to `{ __map__: true, data: [[k, v], ...] }`
 * - `Set<any>` → converted to `{ __set__: true, data: [v1, v2, ...] }`
 *
 * These conversions allow complex structures to be restored after JSON serialization.
 *
 * @typedef {(Record<string|number|symbol, any> | any[] | Map<string|number|symbol, any> | Set<any>)} LocalStorageJsonValue
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

  /**
   * Registers a new JSON-serializable type with its encoder and decoder.
   *
   * @param {any} type - The type or primitive type name (e.g. `"bigint"`, `"symbol"`, etc).
   * @param {EncodeFn} encodeFn - The function that encodes the value.
   * @param {DecodeFn} decodeFn - An object with `check` and `decode` methods for restoring the value.
   */
  static registerJsonType(type, encodeFn, decodeFn) {
    customEncoders.set(type, encodeFn);
    customDecoders.set(type, decodeFn);
  }

  /**
   * Removes a previously registered custom type from the encoding/decoding system.
   *
   * @param {string} type - The primitive name or constructor reference used in registration.
   */
  static deleteJsonType(type) {
    customEncoders.delete(type);
    customDecoders.delete(type);
  }

  //////////////////////////////////////////////////////

  /**
   * Recursively serializes a value to a JSON-compatible format.
   *
   * This includes custom types (via `registerJsonType`), plus support for:
   * - `undefined` → `{ __undefined__: true }`
   * - `null` → `{ __null__: true }`
   *
   * @type {encodeSpecialJson}
   */
  static encodeSpecialJson(value) {
    if (typeof value === 'undefined') return { __undefined__: true };
    if (value === null) return { __null__: true };
    for (const [type, encoder] of customEncoders.entries()) {
      if ((typeof type !== 'string' && value instanceof type) || typeof value === type) {
        return encoder(value, TinyLocalStorage.encodeSpecialJson);
      }
    }

    if (Array.isArray(value)) {
      return value.map(TinyLocalStorage.encodeSpecialJson);
    }

    if (isJsonObject(value)) {
      const encoded = {};
      for (const key in value) {
        // @ts-ignore
        encoded[key] = TinyLocalStorage.encodeSpecialJson(value[key]);
      }
      return encoded;
    }

    return value;
  }

  /**
   * Recursively deserializes a JSON-compatible value into its original structure.
   *
   * Automatically handles:
   * - `__undefined__` → `undefined`
   * - `__null__` → `null`
   * - Any type registered via `registerJsonType`
   *
   * @type {decodeSpecialJson}
   */
  static decodeSpecialJson(value) {
    if (!isJsonObject(value) || value.__undefined__) return undefined;
    if (value.__null__) return null;

    if (Array.isArray(value)) {
      return value.map(TinyLocalStorage.decodeSpecialJson);
    }

    if (isJsonObject(value)) {
      for (const [type, decoder] of customDecoders.entries()) {
        if (decoder.check && decoder.check(value)) {
          return decoder.decode(value, TinyLocalStorage.decodeSpecialJson);
        }
      }

      const decoded = {};
      for (const key in value) {
        // @ts-ignore
        decoded[key] = TinyLocalStorage.decodeSpecialJson(value[key]);
      }
      return decoded;
    }

    return value;
  }

  //////////////////////////////////////////////////////

  /** @type {Storage} */
  #localStorage = window.localStorage;

  /** @type {(ev: StorageEvent) => any} */
  #storageEvent = (ev) => this.emit('storage', ev);

  /**
   * Initializes the TinyLocalStorage instance and sets up cross-tab sync.
   *
   * Adds listener for the native `storage` event to support tab synchronization.
   */
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
   * Automatically serializes nested instances.
   *
   * @param {string} name - The key under which to store the data.
   * @param {*} data - The data to be serialized.
   * @returns {*}
   */
  #setJson(name, data) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');
    return TinyLocalStorage.encodeSpecialJson(data);
  }

  /**
   * Stores a JSON-compatible value in `localStorage`.
   *
   * Automatically serializes nested `Map` and `Set` instances.
   *
   * @param {string} name - The key under which to store the data.
   * @param {LocalStorageJsonValue} data - The data to be serialized and stored.
   */
  setJson(name, data) {
    if (
      !isJsonObject(data) &&
      !Array.isArray(data) &&
      !(data instanceof Map) &&
      !(data instanceof Set)
    ) {
      throw new Error('The storage value is not a valid JSON-compatible structure.');
    }
    const encoded = this.#setJson(name, data);
    this.emit('setJson', name, data);
    this.#localStorage.setItem(name, JSON.stringify(encoded));
  }

  /**
   * Retrieves a value from `localStorage`.
   *
   * Automatically restores nested instances.
   *
   * @param {string} name - The key to retrieve.
   * @param {'array'|'obj'|'map'|'set'|'null'} [defaultData] - Default fallback format if value is invalid.
   * @returns {{ decoded: any, fallback: any }} The parsed object or fallback.
   */
  #getJson(name, defaultData) {
    if (typeof name !== 'string' || !name.length)
      throw new Error('Key must be a non-empty string.');

    const raw = this.#localStorage.getItem(name);
    const fallbackTypes = {
      obj: () => ({}),
      array: () => [],
      map: () => new Map(),
      set: () => new Set(),
    };

    const fallback =
      // @ts-ignore
      typeof fallbackTypes[defaultData] === 'function' ? fallbackTypes[defaultData]() : null;

    let parsed;

    try {
      // @ts-ignore
      parsed = JSON.parse(raw);
    } catch {
      // @ts-ignore
      return fallback;
    }

    return { decoded: TinyLocalStorage.decodeSpecialJson(parsed), fallback };
  }

  /**
   * Retrieves and parses a JSON value from `localStorage`.
   *
   * Automatically restores nested `Map` and `Set` instances.
   *
   * @param {string} name - The key to retrieve.
   * @param {'array'|'obj'|'map'|'set'|'null'} [defaultData] - Default fallback format if value is invalid.
   * @returns {LocalStorageJsonValue|null} The parsed object or fallback.
   */
  getJson(name, defaultData) {
    const { decoded, fallback } = this.#getJson(name, defaultData);
    if (
      decoded instanceof Map ||
      decoded instanceof Set ||
      Array.isArray(decoded) ||
      isJsonObject(decoded)
    )
      return decoded;
    return fallback;
  }

  /**
   * Stores a Date in localStorage.
   * @param {string} name
   * @param {Date} data
   */
  setDate(name, data) {
    if (!(data instanceof Date)) throw new Error('Value must be a Date.');
    const encoded = this.#setJson(name, data);
    this.#localStorage.setItem(name, JSON.stringify(encoded));
    this.emit('setDate', name, data);
  }

  /**
   * Retrieves a Date from localStorage.
   * @param {string} name
   * @returns {Date|null}
   */
  getDate(name) {
    const value = this.#getJson(name).decoded;
    return value instanceof Date ? value : null;
  }

  /**
   * Stores a RegExp in localStorage.
   * @param {string} name
   * @param {RegExp} data
   */
  setRegExp(name, data) {
    if (!(data instanceof RegExp)) throw new Error('Value must be a RegExp.');
    const encoded = this.#setJson(name, data);
    this.#localStorage.setItem(name, JSON.stringify(encoded));
    this.emit('setRegExp', name, data);
  }

  /**
   * Retrieves a RegExp from localStorage.
   * @param {string} name
   * @returns {RegExp|null}
   */
  getRegExp(name) {
    const value = this.#getJson(name).decoded;
    return value instanceof RegExp ? value : null;
  }

  /**
   * Stores a BigInt in localStorage.
   * @param {string} name
   * @param {bigint} data
   */
  setBigInt(name, data) {
    if (typeof data !== 'bigint') throw new Error('Value must be a BigInt.');
    const encoded = this.#setJson(name, data);
    this.#localStorage.setItem(name, JSON.stringify(encoded));
    this.emit('setBigInt', name, data);
  }

  /**
   * Retrieves a BigInt from localStorage.
   * @param {string} name
   * @returns {bigint|null}
   */
  getBigInt(name) {
    const value = this.#getJson(name).decoded;
    return typeof value === 'bigint' ? value : null;
  }

  /**
   * Stores a Symbol in localStorage.
   * Only global symbols (`Symbol.for`) will preserve the key.
   * @param {string} name
   * @param {symbol} data
   */
  setSymbol(name, data) {
    if (typeof data !== 'symbol') throw new Error('Value must be a Symbol.');
    const encoded = this.#setJson(name, data);
    this.#localStorage.setItem(name, JSON.stringify(encoded));
    this.emit('setSymbol', name, data);
  }

  /**
   * Retrieves a Symbol from localStorage.
   * @param {string} name
   * @returns {symbol|null}
   */
  getSymbol(name) {
    const value = this.#getJson(name).decoded;
    return typeof value === 'symbol' ? value : null;
  }

  /**
   * Retrieves a value from `localStorage`.
   *
   * @param {string} name - The key to retrieve.
   * @returns {any} The stored value or null if not found.
   */
  getValue(name) {
    return this.#getJson(name).decoded ?? null;
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
    this.#events.offAllTypes();
  }
}

// First registers

// Map
TinyLocalStorage.registerJsonType(
  Map,
  (value, encodeSpecialJson) => ({
    __map__: true,
    data: Array.from(value.entries()).map(([k, v]) => [k, encodeSpecialJson(v)]),
  }),
  {
    check: (value) => value.__map__,
    /** @param {{ data: any[] }} value */
    decode: (value, decodeSpecialJson) =>
      new Map(value.data.map(([k, v]) => [k, decodeSpecialJson(v)])),
  },
);

// Set
TinyLocalStorage.registerJsonType(
  Set,
  (value, encodeSpecialJson) => ({
    __set__: true,
    data: Array.from(value).map(encodeSpecialJson),
  }),
  {
    check: (value) => value.__set__,
    decode: (value, decodeSpecialJson) => new Set(value.data.map(decodeSpecialJson)),
  },
);

// Date
TinyLocalStorage.registerJsonType(
  Date,
  (value) => ({
    __date__: true,
    value: value.toISOString(),
  }),
  {
    check: (value) => value.__date__,
    decode: (value) => new Date(value.value),
  },
);

// Regex
TinyLocalStorage.registerJsonType(
  RegExp,
  (value) => ({
    __regexp__: true,
    source: value.source,
    flags: value.flags,
  }),
  {
    check: (value) => value.__regexp__,
    decode: (value) => new RegExp(value.source, value.flags),
  },
);

// Big Int
TinyLocalStorage.registerJsonType(
  'bigint',
  (value) => ({
    __bigint__: true,
    value: value.toString(),
  }),
  {
    check: (value) => value.__bigint__,
    decode: (value) => BigInt(value.value),
  },
);

// Symbol
TinyLocalStorage.registerJsonType(
  'symbol',
  (value) => ({
    __symbol__: true,
    key: Symbol.keyFor(value) ?? value.description ?? null,
  }),
  {
    check: (value) => value.__symbol__,
    decode: (value) => {
      const key = value.key;
      return key != null ? Symbol.for(key) : Symbol();
    },
  },
);

export default TinyLocalStorage;
