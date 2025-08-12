import TinyEvents from './TinyEvents.mjs';

/**
 * @callback RngGenerator
 * @returns {number}
 */

/**
 * @typedef {Object} ItemData
 * @property {string} id
 * @property {string} label
 * @property {number} baseWeight
 * @property {Set<string>} groups
 * @property {boolean} locked
 * @property {ItemMetadata} meta
 */

/**
 * @typedef {Record<string|number|symbol, *>} ItemMetadata
 */

/**
 * @typedef {Object} ComputeEffectiveWeightsContext
 * @param {ItemMetadata} [content.metadata]
 * @param {DrawOne} [content.previousDraws]
 */

/**
 * @typedef {Map<string, number>} Weights
 */

/**
 * @typedef {Object} Pity
 * @property {number} threshold
 * @property {number} increment
 * @property {number} cap
 * @property {number} counter
 * @property {number} currentAdd
 */

/**
 * @typedef {Object} SnapshotState
 * @property {[string, ItemData][]} items
 * @property {[string, Pity]} pity
 * @property {string} tempMods
 * @property {string} exclusions
 */

/**
 * @callback WeightsCallback
 * @param {Weights} weights
 * @param {ComputeEffectiveWeightsContext} context
 * @returns {Weights|null}
 */

/** @typedef {{ id: string, label: string, meta: ItemMetadata, prob: number }} DrawOne */

/**
 * @callback handler
 * A function to handle incoming event payloads.
 * @param {any} payload - The data sent by the emitter.
 * @param {any} event - Metadata about the message.
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
   * @type {string}
   */
  #normalization;

  /**
   * @type {number|null}
   */
  #seed;

  /**
   * persistent modifiers applied each draw
   * @type {WeightsCallback[]}
   */
  #globalModifiers = [];

  /**
   * cleared after a draw (or after specified draws)
   * @type {{ fn: WeightsCallback, uses: number }[]}
   */
  #temporaryModifiers = [];

  /**
   * functions that modify weights based on state
   * @type {WeightsCallback[]}
   */
  #conditionalRules = [];

  /**
   * itemId => {threshold, increment, cap, counter}
   * @type {Map<string, Pity>}
   */
  #pitySystems = new Map();

  /**
   * @type {Set<string>}
   */
  #exclusions = new Set();

  /**
   * groupName => Set(itemId)
   * @type {Map<string, Set<string>>}
   */
  #groups = new Map();

  /**
   * @type {RngGenerator}
   */
  #rng;

  /**
   * @type {Map<string, ItemData>}
   */
  #items = new Map();

  /**
   * Create a new AdvancedRaffle engine.
   * @param {Object} [opts]
   * @param {RngGenerator|null} [opts.rng=null] - Optional RNG function. If null a deterministic seedable RNG is created when seed is provided.
   * @param {number|null} [opts.seed=null] - Optional seed to create an internal PRNG (mulberry32).
   * @param {string} [opts.normalization='relative'] - 'relative' (weights -> probabilities) or 'softmax' (temperature adjust).
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
   * @param {string} id
   * @param {Object} opts
   * @param {number} [opts.weight=1] - base relative weight
   * @param {string} [opts.label] - human label
   * @param {ItemMetadata} [opts.meta] - arbitrary metadata
   * @param {string[]} [opts.groups] - group names to attach
   */
  addItem(id, opts = {}) {
    const { weight = 1, label = id, meta = {}, groups = [] } = opts;
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
   * @param {string} id
   */
  removeItem(id) {
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
   * @param {string} id
   * @param {number} weight
   */
  setBaseWeight(id, weight) {
    const it = this.#items.get(id);
    if (!it) throw new Error('Item not found');
    it.baseWeight = Math.max(0, Number(weight) || 0);
    this.#emit('weightChanged', { id, weight: it.baseWeight });
  }

  /**
   * @param {string} id
   * @returns {ItemData|null}
   */
  getItem(id) {
    return this.#items.get(id) ?? null;
  }

  listItems() {
    return Array.from(this.#items.values()).map((i) => ({ ...i }));
  }

  /* ===========================
     Modifiers & Rules
     =========================== */

  /**
   * Add a persistent modifier callback.
   * The callback receives (weightsMap, context) and must return a Map of overrides/additions or modifications.
   * @param {WeightsCallback} fn
   */
  addGlobalModifier(fn) {
    this.#globalModifiers.push(fn);
    return fn;
  }

  /**
   * @param {WeightsCallback} fn
   */
  removeGlobalModifier(fn) {
    this.#globalModifiers = this.#globalModifiers.filter((x) => x !== fn);
  }

  /**
   * Add a temporary modifier applied to the next `uses` draws (default 1).
   * The modifier returns same as global modifier.
   * @param {WeightsCallback} fn
   * @param {number} [uses=1]
   */
  addTemporaryModifier(fn, uses = 1) {
    this.#temporaryModifiers.push({ fn, uses: Math.max(1, Math.floor(uses)) });
  }

  /**
   * Add a conditional rule (applied each draw); receives context {previousDraws, activeModifiers, metadata}.
   * Should return a Map of itemId => deltaWeight (can be positive or negative).
   * @param {WeightsCallback} ruleFn
   */
  addConditionalRule(ruleFn) {
    this.#conditionalRules.push(ruleFn);
  }

  /* ===========================
     Pity systems
     =========================== */

  /**
   * Configure pity for an item.
   * If item fails to appear for `threshold` draws, add `increment` to its base weight each draw until `cap` is reached.
   * @param {string} itemId
   * @param {Object} cfg
   * @param {number} cfg.threshold
   * @param {number} cfg.increment
   * @param {number} [cfg.cap=Infinity]
   */
  configurePity(itemId, cfg) {
    if (!this.#items.has(itemId)) throw new Error('Item not found');
    const { threshold, increment, cap = Infinity } = cfg;
    this.#pitySystems.set(itemId, {
      threshold: Math.max(1, threshold),
      increment: Number(increment) || 0,
      cap: Number(cap) || Infinity,
      counter: 0,
      currentAdd: 0,
    });
  }

  /**
   * @param {string} itemId
   */
  resetPity(itemId) {
    const p = this.#pitySystems.get(itemId);
    if (p) {
      p.counter = 0;
      p.currentAdd = 0;
    }
  }

  /* ===========================
     Exclusions & groups
     =========================== */

  /**
   * @param {string} itemId
   */
  excludeItem(itemId) {
    this.#exclusions.add(itemId);
  }

  /**
   * @param {string} itemId
   */
  includeItem(itemId) {
    this.#exclusions.delete(itemId);
  }

  /**
   * @param {string} name
   * @returns {Set<string>}
   */
  _ensureGroup(name) {
    let group = this.#groups.get(name);
    if (!group) {
      group = new Set();
      this.#groups.set(name, group);
    }
    return group;
  }

  /**
   * @param {string} itemId
   * @param {string} groupName
   */
  addToGroup(itemId, groupName) {
    const it = this.#items.get(itemId);
    if (!it) throw new Error('Item missing');
    it.groups.add(groupName);
    this._ensureGroup(groupName).add(itemId);
  }

  /**
   * @param {string} itemId
   * @param {string} groupName
   */
  removeFromGroup(itemId, groupName) {
    const g = this.#groups.get(groupName);
    if (g) g.delete(itemId);
    const it = this.#items.get(itemId);
    if (it) it.groups.delete(groupName);
  }

  /* ===========================
     Draw core
     =========================== */

  /**
   * Compute effective weights after applying modifiers, rules and pity.
   * Returns Map(itemId -> effectiveWeight)
   * context: {previousDraws, metadata}
   * @param {ComputeEffectiveWeightsContext} [context={}]
   * @returns {Map<string, number>}
   */
  computeEffectiveWeights(context = {}) {
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
      // if counter >= threshold then add currentAdd
      if (pity.counter >= pity.threshold) {
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
   * Convert weights -> probability distribution according to this.normalization
   * returns array [{id, weight, p, cumulative}]
   * @param {Map<string, number>} weights
   */
  _weightsToDistribution(weights) {
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
   * Draw a single item using current configuration.
   * @param {Object} [opts]
   * @param {DrawOne[]} [opts.previousDraws=[]] - history to pass to conditional rules / pity
   * @param {ItemMetadata} [opts.metadata={}] - arbitrary metadata passed to conditional rules
   * @returns {DrawOne|null} - {id, label, meta, prob} or null if no items
   */
  drawOne(opts = {}) {
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

  _consumeTemporaryModifiers() {
    for (let i = this.#temporaryModifiers.length - 1; i >= 0; --i) {
      const t = this.#temporaryModifiers[i];
      t.uses -= 1;
      if (t.uses <= 0) this.#temporaryModifiers.splice(i, 1);
    }
  }

  /**
   * Draw multiple items with various options.
   * @param {number} count
   * @param {Object} [opts]
   * @param {ItemMetadata} [opts.metadata={}]
   * @param {boolean} [opts.withReplacement=true]
   * @param {boolean} [opts.ensureUnique=false] - attempt to make results unique in a single multi-draw
   * @param {DrawOne[]} [opts.previousDraws=[]] - passed to compute rules/pity
   * @returns {DrawOne[]} list of results same as drawOne
   */
  drawMany(count = 1, opts = {}) {
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
   * Simulate N draws and return frequency map and extras
   * @param {number} n
   * @param {Object} [opts]
   */
  simulate(n = 1000, opts = {}) {
    // clone state necessary: pity counters and temporary modifiers may mutate, so we'll clone the full engine state
    const snapshot = this._snapshotState();
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
   * @returns {SnapshotState}
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
   * @param {SnapshotState} snapshot
   */
  _restoreState(snapshot) {
    this.#items = new Map(JSON.parse(JSON.stringify(snapshot.items)));
    this.#pitySystems = new Map(JSON.parse(JSON.stringify(snapshot.pity)));
    // rehydrate sets where necessary (simple approach)
    this.#temporaryModifiers = JSON.parse(snapshot.tempMods);
    this.#exclusions = new Set(JSON.parse(snapshot.exclusions));
  }

  /* ===========================
     Save / Load (JSON)
     =========================== */

  /**
   * Export configuration to JSON (items, pity, groups, exclusions, normalization).
   */
  exportToJson() {
    const data = {
      items: Array.from(this.#items.values()).map((it) => ({
        id: it.id,
        label: it.label,
        baseWeight: it.baseWeight,
        meta: it.meta,
        groups: Array.from(it.groups),
      })),
      pity: Array.from(this.#pitySystems.entries()),
      exclusions: Array.from(this.#exclusions),
      normalization: this.#normalization,
      seed: this.#seed,
    };
    return JSON.stringify(data);
  }

  /**
   * Load configuration from JSON produced by exportToJson
   * @param {string} json
   */
  loadFromJson(json) {
    const data = JSON.parse(json);
    this.#items.clear();
    for (const it of data.items) {
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
    this.#pitySystems = new Map(data.pity || []);
    this.#exclusions = new Set(data.exclusions || []);
    if (data.normalization) this.#normalization = data.normalization;

    if (typeof data.seed !== 'undefined' && typeof data.seed !== 'number' && data.seed !== null)
      throw new Error('');

    if (data.seed !== undefined) {
      this.#seed = data.seed;
      if (this.#seed !== null) this.#rng = this._makeSeededRng(this.#seed);
    }
  }

  /* ===========================
     RNG: seedable (mulberry32)
     =========================== */

  /**
   * @param {number} seed
   */
  _makeSeededRng(seed) {
    // mulberry32
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * @param {number|null} seed
   */
  setSeed(seed) {
    this.#seed = seed;
    if (seed !== null) this.#rng = this._makeSeededRng(seed);
  }

  /* ===========================
     Small helpers
     =========================== */

  getConfigSummary() {
    return {
      itemCount: this.#items.size,
      pityCount: this.#pitySystems.size,
      groups: Array.from(this.#groups.keys()),
      normalization: this.#normalization,
    };
  }
}

export default TinyAdvancedRaffle;
