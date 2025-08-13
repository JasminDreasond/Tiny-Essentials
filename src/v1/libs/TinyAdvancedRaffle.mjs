import TinyEvents from './TinyEvents.mjs';

/**
 * Defines the available normalization strategies for probability weight calculations.
 * @typedef {'relative' | 'softmax'} Normalization
 */

/**
 * Generates a pseudo-random number between 0 (inclusive) and 1 (exclusive).
 * @callback RngGenerator
 * @returns {number} - A floating-point number in the range [0, 1).
 */

/**
 * Represents the core data structure for an item in the raffle system.
 * @template {Set<string>|string[]} TGroups
 * @typedef {Object} ItemDataTemplate
 * @property {string} id - Unique identifier for the item.
 * @property {string} label - Human-readable name for the item.
 * @property {number} baseWeight - The base probability weight before modifiers.
 * @property {TGroups} groups - The groups the item belongs to (Set<string> or string[]).
 * @property {boolean} locked - Whether the item is currently locked (excluded from draws).
 * @property {ItemMetadata} meta - Arbitrary metadata associated with the item.
 */

/**
 * Represents the serialized state of the raffle system for export or persistence.
 * @typedef {Object} ExportedJson
 * @property {ItemDataGetter[]} items - Array of item objects in their exported form.
 * @property {[string, Pity][]} pity - Array of tuples where the first element is the item ID and the second is its associated Pity system state.
 * @property {string[]} exclusions - List of item IDs excluded from the draw.
 * @property {Normalization} normalization - The normalization mode used in weight calculations.
 * @property {number|null} seed - The RNG seed used for reproducibility, or null if no seed is set.
 */

/**
 * A concrete version of ItemDataTemplate where groups is Set<string>.
 * @typedef {ItemDataTemplate<Set<string>>} ItemData
 */

/**
 * A concrete version of ItemDataTemplate where groups is string[].
 * @typedef {ItemDataTemplate<string[]>} ItemDataGetter
 */

/**
 * Arbitrary key-value metadata container for additional item information.
 * Keys can be strings, numbers, or symbols.
 * @typedef {Record<string|number|symbol, any>} ItemMetadata
 */

/**
 * Context object passed to weight modification functions during draw calculations.
 * @typedef {Object} ComputeEffectiveWeightsContext
 * @property {ItemMetadata} [metadata] - Metadata of the current raffle state or item.
 * @property {DrawOne[]} [previousDraws] - History of previously drawn items.
 */

/**
 * Maps each item ID to its computed effective weight.
 * @typedef {Map<string, number>} Weights
 */

/**
 * Pity system configuration and current state.
 * @typedef {Object} Pity
 * @property {number} threshold - Number of draws without a win before pity starts applying.
 * @property {number} increment - Additional weight applied per pity step.
 * @property {number} cap - Maximum total pity weight allowed.
 * @property {number} counter - Current number of consecutive draws without a win.
 * @property {number} currentAdd - Current pity weight being applied.
 */

/**
 * Serializable snapshot of the raffle state for persistence or rollback.
 * @typedef {Object} SnapshotState
 * @property {[string, ItemData][]} items - All registered items and their data.
 * @property {[string, Pity][]} pity - All pity configurations and states.
 * @property {string} tempMods - Serialized temporary weight modifiers.
 * @property {string} exclusions - List of excluded item IDs.
 */

/**
 * Function used to modify or override computed weights before a draw.
 * @callback WeightsCallback
 * @param {Weights} weights - Current computed item weights.
 * @param {ComputeEffectiveWeightsContext} context - Additional context data for calculation.
 * @returns {Weights|null} - Modified weights map, or null to skip modification.
 */

/**
 * Represents the result of a single draw.
 * @typedef {Object} DrawOne
 * @property {string} id - Item ID.
 * @property {string} label - Human-readable label of the drawn item.
 * @property {ItemMetadata} meta - Arbitrary metadata of the drawn item.
 * @property {number} prob - Final probability of the item at draw time.
 */

/**
 * Generic event handler function for message or signal reception.
 * @callback handler
 * @param {any} payload - The data sent by the emitter.
 * @param {any} event - Metadata about the emitted event.
 */

class TinyAdvancedRaffle {
  #events = new TinyEvents();

  /**
   * Emits an event, triggering all registered handlers for that event.
   *
   * @param {string} event - The event name to emit.
   * @param {...any} payload - Optional data to pass to each handler.
   * @returns {boolean} True if any listeners were called, false otherwise.
   */
  #emit(event, ...payload) {
    return this.#events.emit(event, ...payload);
  }

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
  prependListener(event, handler) {
    return this.#events.prependListener(event, handler);
  }

  /**
   * Adds a one-time listener to the beginning of the listeners array for the specified event.
   *
   * @param {string} event - Event name.
   * @param {handler} handler - The callback function.
   * @returns {handler} - The wrapped handler used internally.
   */
  prependListenerOnce(event, handler) {
    return this.#events.prependListenerOnce(event, handler);
  }

  //////////////////////////////////////////////////////////////////////

  /**
   * Adds a event listener.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - Callback function to be called when event fires.
   */
  appendListener(event, handler) {
    return this.#events.appendListener(event, handler);
  }

  /**
   * Registers an event listener that runs only once, then is removed.
   *
   * @param {string} event - Event name, such as 'onScrollBoundary' or 'onAutoScroll'.
   * @param {handler} handler - The callback function to run on event.
   * @returns {handler} - The wrapped version of the handler.
   */
  appendListenerOnce(event, handler) {
    return this.#events.appendListenerOnce(event, handler);
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
   * Normalization method used to adjust item weights before performing the draw.
   * Can define how the probabilities are scaled or balanced.
   * @type {Normalization}
   */
  #normalization;

  /**
   * Seed value used for deterministic random number generation.
   * If null, results will be non-deterministic.
   * @type {number|null}
   */
  #seed;

  /**
   * Persistent weight modifiers that are applied to every draw.
   * Each modifier is a callback function that adjusts item weights.
   * @type {WeightsCallback[]}
   */
  #globalModifiers = [];

  /**
   * Temporary weight modifiers that are cleared after use or after a defined number of draws.
   * Each entry contains a modifier function and a remaining usage counter.
   * @type {{ fn: WeightsCallback, uses: number }[]}
   */
  #temporaryModifiers = [];

  /**
   * Conditional rules that dynamically modify item weights based on current state.
   * @type {WeightsCallback[]}
   */
  #conditionalRules = [];

  /**
   * "Pity" systems — mechanisms that guarantee or increase the probability of certain items
   * after a number of unsuccessful draws.
   * Keyed by `itemId`.
   * @type {Map<string, Pity>}
   */
  #pitySystems = new Map();

  /**
   * Items excluded from being selected in the raffle.
   * Contains a set of item IDs.
   * @type {Set<string>}
   */
  #exclusions = new Set();

  /**
   * Groups of items, where each group has a name and contains a set of item IDs.
   * @type {Map<string, Set<string>>}
   */
  #groups = new Map();

  /**
   * Random number generator instance used for draw calculations.
   * @type {RngGenerator}
   */
  #rng;

  /**
   * All registered raffle items and their respective data.
   * Keyed by `itemId`.
   * @type {Map<string, ItemData>}
   */
  #items = new Map();

  /* -------------------- GETTERS & SETTERS -------------------- */

  /**
   * Returns the total number of registered items in the raffle.
   * @returns {number} Total count of items.
   */
  get size() {
    return this.#items.size;
  }

  /**
   * Gets the current probability normalization strategy.
   * @returns {Normalization} Current normalization mode.
   */
  get normalization() {
    return this.#normalization;
  }

  /**
   * Sets the probability normalization strategy.
   * @param {Normalization} value - Accepted values: `'relative'` or `'softmax'`.
   * @throws {TypeError} If value is not a non-empty string.
   */
  set normalization(value) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new TypeError(
        "normalization must be a non-empty string (e.g., 'relative', 'softmax').",
      );
    }
    this.#normalization = value;
  }

  /**
   * Gets the current RNG seed value, if any.
   * @returns {number|null} Current seed or `null` if RNG is not seeded.
   */
  get seed() {
    return this.#seed;
  }

  /**
   * Sets the RNG seed for deterministic randomization.
   * @param {number|null} value - Finite number or `null` to disable seeding.
   * @throws {TypeError} If not `null` or a finite number.
   */
  set seed(value) {
    if (value !== null && (typeof value !== 'number' || !Number.isFinite(value)))
      throw new TypeError('seed must be a finite number or null.');
    this.#seed = value;
    if (value !== null) this.#rng = this._makeSeededRng(value);
  }

  /**
   * Gets all global weight modifier callbacks.
   * @returns {WeightsCallback[]} Array of registered global modifier functions.
   */
  get globalModifiers() {
    return [...this.#globalModifiers];
  }

  /**
   * Replaces all global weight modifier callbacks.
   * @param {WeightsCallback[]} value - Array of modifier functions.
   * @throws {TypeError} If not an array of functions.
   */
  set globalModifiers(value) {
    if (!Array.isArray(value) || !value.every((fn) => typeof fn === 'function'))
      throw new TypeError('globalModifiers must be an array of functions (WeightsCallback).');
    this.#globalModifiers = value;
  }

  /**
   * Gets all temporary modifiers with usage counters.
   * @returns {{ fn: WeightsCallback, uses: number }[]} Array of temporary modifier entries.
   */
  get temporaryModifiers() {
    return [...this.#temporaryModifiers];
  }

  /**
   * Replaces all temporary modifiers.
   * @param {{ fn: WeightsCallback, uses: number }[]} value - Each object must have a function and a positive integer usage count.
   * @throws {TypeError} If structure is invalid.
   */
  set temporaryModifiers(value) {
    if (
      !Array.isArray(value) ||
      !value.every(
        (obj) => obj && typeof obj.fn === 'function' && Number.isInteger(obj.uses) && obj.uses > 0,
      )
    )
      throw new TypeError(
        'temporaryModifiers must be an array of objects { fn: function, uses: positive integer }.',
      );
    this.#temporaryModifiers = value;
  }

  /**
   * Gets all conditional rule callbacks.
   * @returns {WeightsCallback[]} Array of conditional rule functions.
   */
  get conditionalRules() {
    return [...this.#conditionalRules];
  }

  /**
   * Replaces all conditional rule callbacks.
   * @param {WeightsCallback[]} value - Array of functions.
   * @throws {TypeError} If not an array of functions.
   */
  set conditionalRules(value) {
    if (!Array.isArray(value) || !value.every((fn) => typeof fn === 'function'))
      throw new TypeError('conditionalRules must be an array of functions (WeightsCallback).');
    this.#conditionalRules = value;
  }

  /**
   * Gets a shallow copy of all configured pity systems.
   * @returns {Record<string, Pity>} Object keyed by system name.
   */
  get pitySystems() {
    return Object.fromEntries(this.#pitySystems);
  }

  /**
   * Replaces all pity systems.
   * @param {Map<string, Pity>} value - Map of pity systems with numeric fields.
   * @throws {TypeError} If structure is invalid.
   */
  set pitySystems(value) {
    if (
      !(value instanceof Map) ||
      ![...value.values()].every(
        (p) =>
          p &&
          typeof p.threshold === 'number' &&
          typeof p.increment === 'number' &&
          typeof p.cap === 'number' &&
          typeof p.counter === 'number' &&
          typeof p.currentAdd === 'number',
      )
    )
      throw new TypeError('pitySystems must be a Map<string, Pity> with all numeric fields.');
    this.#pitySystems = value;
  }

  /**
   * Gets a copy of all exclusion IDs.
   * @returns {string[]} Array of item IDs excluded from draws.
   */
  get exclusions() {
    return Array.from(this.#exclusions);
  }

  /**
   * Replaces all exclusion IDs.
   * @param {Set<string>} value - Set of excluded item IDs.
   * @throws {TypeError} If not a Set of strings.
   */
  set exclusions(value) {
    if (!(value instanceof Set) || ![...value].every((v) => typeof v === 'string'))
      throw new TypeError('exclusions must be a Set<string>.');
    this.#exclusions = value;
  }

  /**
   * Gets all group definitions.
   * @returns {Record<string, string[]>} Object where each key is a group name and value is an array of item IDs.
   */
  get groups() {
    /** @type {Record<string, string[]>} */
    const groups = {};
    this.#groups.forEach((value, key) => (groups[key] = Array.from(value)));
    return groups;
  }

  /**
   * Replaces all group definitions.
   * @param {Map<string, Set<string>>} value - Map of group names to item ID sets.
   * @throws {TypeError} If not a valid Map<string, Set<string>>.
   */
  set groups(value) {
    if (
      !(value instanceof Map) ||
      ![...value.values()].every(
        (v) => v instanceof Set && [...v].every((i) => typeof i === 'string'),
      )
    )
      throw new TypeError('groups must be a Map<string, Set<string>>.');
    this.#groups = value;
  }

  /**
   * Gets the current RNG function.
   * @returns {RngGenerator} Function returning a floating-point number in [0, 1).
   */
  get rng() {
    return this.#rng;
  }

  /**
   * Sets the RNG function.
   * @param {RngGenerator} value - Function returning a number between 0 and 1.
   * @throws {TypeError} If not a valid function.
   */
  set rng(value) {
    if (typeof value !== 'function' || typeof value() !== 'number')
      throw new TypeError('rng must be a function returning a number (RngGenerator).');
    this.#rng = value;
  }

  /**
   * Gets all item definitions with group names expanded to arrays.
   * @returns {Record<string, ItemDataGetter>} Object keyed by item ID.
   */
  get items() {
    /** @type {Record<string, ItemDataGetter>} */
    const items = {};
    this.#items.forEach((value, key) => {
      items[key] = { ...value, groups: Array.from(value.groups) };
    });
    return items;
  }

  /**
   * Replaces all items.
   * @param {Map<string, ItemData>} value - Map of item IDs to definitions.
   * @throws {TypeError} If structure is invalid.
   */
  set items(value) {
    if (
      !(value instanceof Map) ||
      ![...value.values()].every(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.label === 'string' &&
          typeof item.baseWeight === 'number' &&
          item.groups instanceof Set &&
          typeof item.locked === 'boolean' &&
          typeof item.meta === 'object',
      )
    )
      throw new TypeError('items must be a Map<string, ItemData> with valid item structures.');
    this.#items = value;
  }

  /**
   * Creates a new AdvancedRaffle instance.
   * @param {Object} [opts] - Optional configuration.
   * @param {RngGenerator|null} [opts.rng=null] - Custom RNG function. If null, an internal seeded RNG is used when a seed is provided.
   * @param {number|null} [opts.seed=null] - Optional seed for deterministic results.
   * @param {Normalization} [opts.normalization='relative'] - Probability normalization mode.
   */
  constructor(opts = {}) {
    const { rng = null, seed = null, normalization = 'relative' } = opts;
    this.#normalization = normalization;
    this.#seed = seed;
    if (typeof rng === 'function') this.#rng = rng;
    else if (this.#seed !== null) this.#rng = this._makeSeededRng(this.#seed);
    else this.#rng = Math.random;
    this.#seed = seed ?? null;
  }

  /* ===========================
     Public: Item management
     =========================== */

  /**
   * Add or update an item.
   * @param {string} id - Unique item identifier.
   * @param {Object} [opts={}] - Item configuration options.
   * @param {number} [opts.weight=1] - Base relative weight (must be >= 0).
   * @param {string} [opts.label] - Human-readable label for the item.
   * @param {ItemMetadata} [opts.meta={}] - Arbitrary metadata for the item.
   * @param {string[]|Set<string>} [opts.groups=[]] - Group names to attach.
   * @returns {ItemData}
   * @throws {TypeError} If any parameter has an invalid type.
   */
  addItem(id, opts = {}) {
    if (typeof id !== 'string' || !id.trim()) throw new TypeError('id must be a non-empty string');
    if (typeof opts !== 'object' || opts === null) throw new TypeError('opts must be an object');
    let { weight = 1, label = id, meta = {}, groups = [] } = opts;
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0)
      throw new TypeError('weight must be a non-negative number');
    if (typeof label !== 'string') throw new TypeError('label must be a string');
    if (typeof meta !== 'object' || meta === null) throw new TypeError('meta must be an object');

    // Allow both arrays and sets for groups
    if (!(Array.isArray(groups) || groups instanceof Set))
      throw new TypeError('groups must be an array or a Set of strings');
    groups = Array.isArray(groups) ? groups : [...groups];
    for (const g of groups) {
      if (typeof g !== 'string') {
        throw new TypeError('groups must contain only strings');
      }
    }

    const entry = {
      id,
      label,
      baseWeight: Math.max(0, Number(weight) || 0),
      meta: { ...meta },
      groups: new Set(groups),
      locked: false,
    };
    this.#items.set(id, entry);
    // Register in groups map
    for (const g of groups) this._ensureGroup(g).add(id);
    this.#emit('itemAdded', entry);
    return entry;
  }

  /**
   * Remove an item from the system.
   * @param {string} id - The unique item identifier to remove.
   * @returns {boolean} True if the item was removed, false if it did not exist.
   * @throws {TypeError} If id is not a string.
   */
  removeItem(id) {
    if (typeof id !== 'string' || !id.trim()) throw new TypeError('id must be a non-empty string');
    const it = this.#items.get(id);
    if (!it) return false;
    for (const g of it.groups) {
      const s = this.#groups.get(g);
      if (s) s.delete(id);
    }
    this.#items.delete(id);
    this.#emit('itemRemoved', id);
    return true;
  }

  /**
   * Set a new base weight for an item.
   * @param {string} id - The unique item identifier.
   * @param {number} weight - The new base weight (must be >= 0).
   * @throws {Error} If the item is not found.
   * @throws {TypeError} If weight is invalid.
   */
  setBaseWeight(id, weight) {
    if (typeof id !== 'string' || !id.trim()) throw new TypeError('id must be a non-empty string');
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0)
      throw new TypeError('weight must be a non-negative number');
    const it = this.#items.get(id);
    if (!it) throw new Error('Item not found');
    it.baseWeight = Math.max(0, Number(weight) || 0);
    this.#emit('weightChanged', { id, weight: it.baseWeight });
  }

  /**
   * Get an item by its ID.
   * @param {string} id - The unique item identifier.
   * @returns {ItemData|null} The item data, or null if not found.
   * @throws {TypeError} If id is not a string.
   */
  getItem(id) {
    if (typeof id !== 'string' || !id.trim()) throw new TypeError('id must be a non-empty string');
    return this.#items.get(id) ?? null;
  }

  /**
   * List all items as cloned objects.
   * @returns {ItemData[]} Array of cloned item objects.
   */
  listItems() {
    return Array.from(this.#items.values()).map((i) => ({ ...i }));
  }

  /**
   * Clear all items from the system.
   */
  clearList() {
    this.#items.clear();
  }

  /* ===========================
     Modifiers & Rules
     =========================== */

  /**
   * Add a persistent modifier callback.
   * The callback receives `(weightsMap, context)` and must return a Map of overrides/additions or modifications.
   * @param {WeightsCallback} fn - Modifier callback function.
   * @throws {TypeError} If `fn` is not a function.
   */
  addGlobalModifier(fn) {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    this.#globalModifiers.push(fn);
  }

  /**
   * Remove a persistent modifier callback.
   * @param {WeightsCallback} fn - Modifier callback to remove.
   * @throws {TypeError} If `fn` is not a function.
   */
  removeGlobalModifier(fn) {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    this.#globalModifiers = this.#globalModifiers.filter((x) => x !== fn);
  }

  /**
   * Add a temporary modifier applied to the next `uses` draws (default 1).
   * The modifier returns the same structure as a global modifier.
   * @param {WeightsCallback} fn - Temporary modifier callback.
   * @param {number} [uses=1] - Number of draws the modifier will be active for.
   * @throws {TypeError} If `fn` is not a function.
   * @throws {TypeError} If `uses` is not a number.
   */
  addTemporaryModifier(fn, uses = 1) {
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');
    if (typeof uses !== 'number' || Number.isNaN(uses))
      throw new TypeError('uses must be a number');
    this.#temporaryModifiers.push({ fn, uses: Math.max(1, Math.floor(uses)) });
  }

  /**
   * Add a conditional rule (applied each draw).
   * Receives context `{previousDraws, activeModifiers, metadata}`.
   * Should return a Map of `itemId => deltaWeight` (can be positive or negative).
   * @param {WeightsCallback} ruleFn - Conditional rule function.
   * @throws {TypeError} If `ruleFn` is not a function.
   */
  addConditionalRule(ruleFn) {
    if (typeof ruleFn !== 'function') throw new TypeError('ruleFn must be a function');
    this.#conditionalRules.push(ruleFn);
  }

  /* ===========================
     Pity systems
     =========================== */

  /**
   * Configure pity for an item.
   * If the item fails to appear for `threshold` draws, add `increment` to its base weight each draw until `cap` is reached.
   * @param {string} itemId - ID of the item to configure.
   * @param {Object} cfg - Pity configuration.
   * @param {number} cfg.threshold - Number of failed draws before applying pity.
   * @param {number} cfg.increment - Additional weight to add each draw after threshold.
   * @param {number} [cfg.cap=Infinity] - Maximum additional weight allowed.
   * @throws {Error} If the item does not exist.
   * @throws {TypeError} If parameters are invalid.
   */
  configurePity(itemId, cfg) {
    if (!this.#items.has(itemId)) throw new Error('Item not found');
    if (typeof cfg !== 'object' || cfg === null) throw new TypeError('cfg must be an object');
    const { threshold, increment, cap = Infinity } = cfg;
    if (typeof threshold !== 'number' || threshold <= 0)
      throw new TypeError('threshold must be a positive number');
    if (typeof increment !== 'number') throw new TypeError('increment must be a number');
    if (typeof cap !== 'number') throw new TypeError('cap must be a number');

    this.#pitySystems.set(itemId, {
      threshold: Math.max(1, threshold),
      increment: Number(increment) || 0,
      cap: Number(cap) || Infinity,
      counter: 0,
      currentAdd: 0,
    });
  }

  /**
   * Reset pity counters for a given item.
   * @param {string} itemId - ID of the item.
   * @throws {TypeError} If itemId is not a string.
   */
  resetPity(itemId) {
    if (typeof itemId !== 'string' || !itemId.trim())
      throw new TypeError('itemId must be a non-empty string');
    const p = this.#pitySystems.get(itemId);
    if (p) {
      p.counter = 0;
      p.currentAdd = 0;
    }
  }

  /**
   * Remove all pity configurations.
   */
  clearPities() {
    this.#pitySystems.clear();
  }

  /* ===========================
     Exclusions & groups
     =========================== */

  /**
   * Exclude an item from the raffle.
   * @param {string} itemId - ID of the item.
   * @throws {TypeError} If `itemId` is not a string.
   */
  excludeItem(itemId) {
    if (typeof itemId !== 'string') throw new TypeError('itemId must be a string');
    this.#exclusions.add(itemId);
  }

  /**
   * Re-include an item in the raffle.
   * @param {string} itemId - ID of the item.
   * @throws {TypeError} If `itemId` is not a string.
   */
  includeItem(itemId) {
    if (typeof itemId !== 'string') throw new TypeError('itemId must be a string');
    this.#exclusions.delete(itemId);
  }

  /**
   * Ensure a group exists, creating it if necessary.
   * @param {string} name - Group name.
   * @returns {Set<string>} The group set.
   * @throws {TypeError} If `name` is not a string.
   * @private
   */
  _ensureGroup(name) {
    if (typeof name !== 'string') throw new TypeError('name must be a string');
    let group = this.#groups.get(name);
    if (!group) {
      group = new Set();
      this.#groups.set(name, group);
    }
    return group;
  }

  /**
   * Add an item to a group.
   * @param {string} itemId - ID of the item.
   * @param {string} groupName - Name of the group.
   * @throws {Error} If the item does not exist.
   * @throws {TypeError} If parameters are not strings.
   */
  addToGroup(itemId, groupName) {
    if (typeof itemId !== 'string' || typeof groupName !== 'string')
      throw new TypeError('itemId and groupName must be strings');
    const it = this.#items.get(itemId);
    if (!it) throw new Error('Item missing');
    it.groups.add(groupName);
    this._ensureGroup(groupName).add(itemId);
  }

  /**
   * Remove an item from a group.
   * @param {string} itemId - ID of the item.
   * @param {string} groupName - Name of the group.
   * @throws {TypeError} If parameters are not strings.
   */
  removeFromGroup(itemId, groupName) {
    if (typeof itemId !== 'string' || typeof groupName !== 'string')
      throw new TypeError('itemId and groupName must be strings');
    const g = this.#groups.get(groupName);
    if (g) g.delete(itemId);
    const it = this.#items.get(itemId);
    if (it) it.groups.delete(groupName);
  }

  /* ===========================
     Draw core
     =========================== */

  /**
   * Compute effective weights after applying modifiers, rules, and pity adjustments.
   * Starts with base weights, then applies global, temporary, conditional modifiers,
   * pity increments, removes exclusions, and removes zero or negative weights.
   *
   * @param {ComputeEffectiveWeightsContext} [context={}] - Optional context with previous draws and metadata.
   * @returns {Map<string, number>} A Map of itemId to effective weight.
   * @throws {TypeError} If `context` is provided but is not an object.
   */
  computeEffectiveWeights(context = {}) {
    if (typeof context !== 'object' || context === null)
      throw new TypeError('context must be an object if provided');

    /**
     * Start from base weights
     * @type {Map<string, number>}
     */
    const weights = new Map();
    for (const [id, it] of this.#items) {
      weights.set(id, it.baseWeight);
    }

    // Apply global modifiers (they can return Map of id->delta or id->absolute)
    for (const mod of this.#globalModifiers) {
      const res = mod(weights, context);
      if (res instanceof Map) {
        for (const [id, delta] of res) {
          weights.set(id, Math.max(0, (weights.get(id) || 0) + delta));
        }
      }
    }

    // Apply temporary modifiers
    for (const tmp of this.#temporaryModifiers) {
      const res = tmp.fn(weights, context);
      if (res instanceof Map) {
        for (const [id, delta] of res) {
          weights.set(id, Math.max(0, (weights.get(id) || 0) + delta));
        }
      }
    }

    // Apply conditional rules
    for (const rule of this.#conditionalRules) {
      const res = rule(weights, context);
      if (res instanceof Map) {
        for (const [id, delta] of res) {
          weights.set(id, Math.max(0, (weights.get(id) || 0) + delta));
        }
      }
    }

    // Apply pity adjustments
    for (const [itemId, pity] of this.#pitySystems) {
      if (!weights.has(itemId)) continue;
      // if counter > threshold then add currentAdd
      if (pity.counter > pity.threshold) {
        // increase currentAdd each draw by increment but cap it
        pity.currentAdd = Math.min(pity.cap, pity.currentAdd + pity.increment);
        const weight = weights.get(itemId);
        if (weight) weights.set(itemId, weight + pity.currentAdd);
      }
    }

    // Remove excluded items
    for (const ex of this.#exclusions) weights.delete(ex);

    // Zero or negative weights are removed
    for (const [id, w] of Array.from(weights.entries())) {
      if (!(w > 0)) weights.delete(id);
    }

    return weights;
  }

  /**
   * Convert a map of weights into a probability distribution array,
   * normalized according to the current normalization method.
   * Returns array with each element containing id, weight, probability (p),
   * and cumulative probability (for sampling).
   *
   * @param {Map<string, number>} weights - Map of item IDs to their weights.
   * @returns {Array<{id: string, weight: number, p: number, cumulative: number}>} Distribution array.
   * @throws {TypeError} If `weights` is not a Map.
   */
  _weightsToDistribution(weights) {
    if (!(weights instanceof Map)) throw new TypeError('weights must be a Map<string, number>');
    const arr = Array.from(weights.entries()).map(([id, w]) => ({ id, weight: w }));
    if (arr.length === 0) return [];

    if (this.#normalization === 'softmax') {
      // simple softmax with temperature = 1
      const maxW = Math.max(...arr.map((a) => a.weight));
      const exps = arr.map((a) => Math.exp(a.weight - maxW));
      const sumExp = exps.reduce((s, x) => s + x, 0);
      let cum = 0;
      return arr.map((a, i) => {
        const p = exps[i] / sumExp;
        cum += p;
        return { id: a.id, weight: a.weight, p, cumulative: cum };
      });
    } else {
      // relative normalization
      const sum = arr.reduce((s, a) => s + a.weight, 0);
      let cum = 0;
      return arr.map((a) => {
        const p = a.weight / sum;
        cum += p;
        return { id: a.id, weight: a.weight, p, cumulative: cum };
      });
    }
  }

  /**
   * Draw a single item from the raffle using current configuration.
   * Uses previous draws and metadata to influence conditional rules and pity.
   *
   * @param {Object} [opts={}] - Optional draw options.
   * @param {DrawOne[]} [opts.previousDraws=[]] - History of previous draws.
   * @param {ItemMetadata} [opts.metadata={}] - Arbitrary metadata for conditional rules.
   * @returns {DrawOne|null} The drawn item object or null if no items available.
   * @throws {TypeError} If `opts` is not an object.
   */
  drawOne(opts = {}) {
    if (typeof opts !== 'object' || opts === null) throw new TypeError('opts must be an object');
    const context = {
      previousDraws: opts.previousDraws ?? [],
      metadata: opts.metadata ?? {},
      activeModifiers: [...this.#temporaryModifiers],
    };

    const weights = this.computeEffectiveWeights(context);
    const dist = this._weightsToDistribution(weights);
    if (!dist.length) return null;

    const r = this.#rng();
    // find first cumulative >= r
    const chosen = dist.find((d) => r <= d.cumulative) ?? dist[dist.length - 1];
    // Update pity counters
    for (const [itemId, pity] of this.#pitySystems) {
      if (itemId === chosen.id) {
        pity.counter = 0;
        pity.currentAdd = 0;
      } else {
        pity.counter++;
      }
    }

    // decrement temporary modifiers uses
    this._consumeTemporaryModifiers();

    const item = this.#items.get(chosen.id);
    if (!item) return null;
    const result = { id: item.id, label: item.label, meta: { ...item.meta }, prob: chosen.p };
    this.#emit('draw', result);
    return result;
  }

  /**
   * Internal helper to decrement usage counts of temporary modifiers,
   * removing them when their uses reach zero.
   * @private
   */
  _consumeTemporaryModifiers() {
    for (let i = this.#temporaryModifiers.length - 1; i >= 0; --i) {
      const t = this.#temporaryModifiers[i];
      t.uses -= 1;
      if (t.uses <= 0) this.#temporaryModifiers.splice(i, 1);
    }
  }

  /**
   * Draw multiple items from the raffle with configurable options.
   *
   * @param {number} count - Number of items to draw.
   * @param {Object} [opts={}] - Optional parameters.
   * @param {ItemMetadata} [opts.metadata={}] - Metadata passed to conditional rules.
   * @param {boolean} [opts.withReplacement=true] - Whether to allow the same item multiple times.
   * @param {boolean} [opts.ensureUnique=false] - If true, attempts to ensure unique results in multi-draws.
   * @param {DrawOne[]} [opts.previousDraws=[]] - Previous draw history for context.
   * @returns {DrawOne[]} List of drawn items.
   * @throws {TypeError} If `count` is not a positive integer.
   * @throws {TypeError} If `opts` is not an object.
   */
  drawMany(count = 1, opts = {}) {
    if (!Number.isInteger(count) || count <= 0)
      throw new TypeError('count must be a positive integer');
    if (typeof opts !== 'object' || opts === null) throw new TypeError('opts must be an object');

    const withReplacement = opts.withReplacement ?? true;
    const ensureUnique = opts.ensureUnique ?? false;
    const results = [];
    const prev = opts.previousDraws ?? [];

    // If we want to ensure uniqueness and withReplacement === false, simply perform draws removing chosen each time.
    // We'll do iterative draws updating exclusions if needed.
    if (!withReplacement && ensureUnique) {
      const tempExcluded = new Set();
      for (let i = 0; i < count; ++i) {
        // temporarily add exclusions from tempExcluded
        const savedEx = new Set(this.#exclusions);
        for (const ex of tempExcluded) this.#exclusions.add(ex);
        const r = this.drawOne({ previousDraws: prev, metadata: opts.metadata });
        // restore exclusions
        this.#exclusions = savedEx;
        if (!r) break;
        results.push(r);
        tempExcluded.add(r.id);
        prev.push(r);
      }
      return results;
    }

    // otherwise, perform draws possibly with changing pity & modifiers
    for (let i = 0; i < count; ++i) {
      const r = this.drawOne({ previousDraws: prev, metadata: opts.metadata });
      if (!r) break;
      results.push(r);
      prev.push(r);
      if (!withReplacement) {
        // temporarily exclude the chosen item only for this multi-draw
        this.excludeItem(r.id);
      }
    }

    // restore exclusions that were added by drawMany for no-replacement behavior
    if (!withReplacement) {
      for (const r of results) this.includeItem(r.id);
    }

    return results;
  }

  /* ===========================
     Simulation & utils
     =========================== */

  /**
   * Simulate `n` draws and return a frequency map of results.
   * The engine state (pity counters, temporary modifiers) is cloned and restored after simulation
   * so the current state is not affected.
   *
   * @param {number} n - Number of draws to simulate (must be positive integer).
   * @param {Object} [opts={}] - Optional draw options to pass to `drawOne`.
   * @returns {{ n: number; freq: Record<string, number>; }} An object with total draws and frequency per item id.
   * @throws {TypeError} If `n` is not a positive integer.
   * @throws {TypeError} If `opts` is provided but is not an object.
   */
  simulate(n = 1000, opts = {}) {
    if (!Number.isInteger(n) || n <= 0) throw new TypeError('n must be a positive integer');
    if (typeof opts !== 'object' || opts === null)
      throw new TypeError('opts must be an object if provided');

    // clone state necessary: pity counters and temporary modifiers may mutate, so we'll clone the full engine state
    const snapshot = this._snapshotState();
    /** @type {Map<string, number>} */
    const freq = new Map();
    for (let i = 0; i < n; ++i) {
      const r = this.drawOne(opts);
      if (!r) break;
      freq.set(r.id, (freq.get(r.id) || 0) + 1);
    }
    // restore
    this._restoreState(snapshot);
    const result = {
      n,
      freq: Object.fromEntries(freq),
    };
    return result;
  }

  /**
   * Take a snapshot of the internal mutable state (items, pity systems, temporary modifiers, exclusions).
   * Used internally for safe simulation and rollback.
   *
   * @returns {SnapshotState} Snapshot object representing current internal state.
   */
  _snapshotState() {
    return {
      items: JSON.parse(JSON.stringify(Array.from(this.#items.entries()))),
      pity: JSON.parse(JSON.stringify(Array.from(this.#pitySystems.entries()))),
      tempMods: JSON.stringify(this.#temporaryModifiers),
      exclusions: JSON.stringify(Array.from(this.#exclusions)),
    };
  }

  /**
   * Restore internal mutable state from a snapshot.
   *
   * @param {SnapshotState} snapshot - Snapshot object obtained from `_snapshotState`.
   * @throws {TypeError} If snapshot is not an object or missing required properties.
   */
  _restoreState(snapshot) {
    if (typeof snapshot !== 'object' || snapshot === null)
      throw new TypeError('snapshot must be a valid object');
    if (
      !('items' in snapshot) ||
      !('pity' in snapshot) ||
      !('tempMods' in snapshot) ||
      !('exclusions' in snapshot)
    )
      throw new TypeError('snapshot is missing required properties');
    this.items = new Map(JSON.parse(JSON.stringify(snapshot.items)));
    this.pitySystems = new Map(JSON.parse(JSON.stringify(snapshot.pity)));
    // rehydrate sets where necessary (simple approach)
    this.temporaryModifiers = JSON.parse(snapshot.tempMods);
    this.exclusions = new Set(JSON.parse(snapshot.exclusions));
  }

  /* ===========================
     Save / Load (JSON)
     =========================== */

  /**
   * Export the current configuration to a JSON-serializable object.
   * Contains all items, pity systems, exclusions, normalization mode, and seed.
   *
   * @returns {ExportedJson} Exported configuration object.
   */
  exportToJson() {
    const data = {
      items: Array.from(this.#items.values()).map((it) => ({
        id: it.id,
        label: it.label,
        baseWeight: it.baseWeight,
        meta: it.meta,
        groups: Array.from(it.groups),
        locked: false,
      })),
      pity: Array.from(this.#pitySystems.entries()),
      exclusions: Array.from(this.#exclusions),
      normalization: this.#normalization,
      seed: this.#seed,
    };
    return data;
  }

  /**
   * Load configuration from JSON object produced by `exportToJson`.
   * Clears current items and state before loading.
   *
   * @param {ExportedJson} data - Data to load from.
   * @throws {TypeError} If `data` is not an object or missing required properties.
   * @throws {TypeError} If `data.seed` is not a number, null, or undefined.
   */
  loadFromJson(data) {
    if (typeof data !== 'object' || data === null)
      throw new TypeError('data must be a non-null object');
    if (!Array.isArray(data.items) || !Array.isArray(data.pity) || !Array.isArray(data.exclusions))
      throw new TypeError('data must have items, pity, and exclusions arrays');
    if (typeof data.normalization !== 'string')
      throw new TypeError('data.normalization must be a string');
    if (data.seed !== undefined && data.seed !== null && typeof data.seed !== 'number')
      throw new TypeError('data.seed must be a number, null, or undefined');

    this.clearList();
    for (const it of data.items) {
      if (typeof it !== 'object' || it === null)
        throw new TypeError('Each item must be a non-null object');
      if (typeof it.id !== 'string' || !it.id.trim())
        throw new TypeError('Each item.id must be a non-empty string');
      if (typeof it.label !== 'string')
        throw new TypeError(`Item with id "${it.id}" has invalid label; must be string`);
      if (typeof it.baseWeight !== 'number' || !Number.isFinite(it.baseWeight) || it.baseWeight < 0)
        throw new TypeError(
          `Item with id "${it.id}" has invalid baseWeight; must be a finite non-negative number`,
        );
      if (it.groups !== undefined && !Array.isArray(it.groups))
        throw new TypeError(
          `Item with id "${it.id}" has invalid groups; must be an array of strings`,
        );
      if (it.groups && !it.groups.every((g) => typeof g === 'string'))
        throw new TypeError(`Item with id "${it.id}" has groups containing non-string values`);
      if (it.meta !== undefined && (typeof it.meta !== 'object' || it.meta === null))
        throw new TypeError(`Item with id "${it.id}" has invalid meta; must be an object`);

      this.#items.set(it.id, {
        id: it.id,
        label: it.label,
        baseWeight: it.baseWeight,
        meta: it.meta || {},
        groups: new Set(it.groups || []),
        locked: false,
      });
      for (const g of it.groups || []) this._ensureGroup(g).add(it.id);
    }
    this.pitySystems = new Map(data.pity || []);
    this.exclusions = new Set(data.exclusions || []);
    this.normalization = data.normalization;
    if (data.seed !== undefined) this.seed = data.seed;
  }

  /* ===========================
     RNG: seedable (mulberry32)
     =========================== */

  /**
   * Create a deterministic pseudo-random number generator (PRNG) seeded with `seed`.
   * Uses the mulberry32 algorithm.
   *
   * @param {number} seed - Seed value for PRNG (integer).
   * @returns {RngGenerator} A function that returns a pseudo-random number in [0, 1).
   * @throws {TypeError} If `seed` is not a finite number.
   */
  _makeSeededRng(seed) {
    if (typeof seed !== 'number' || !Number.isFinite(seed))
      throw new TypeError('seed must be a finite number');
    // mulberry32
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
}

export default TinyAdvancedRaffle;
