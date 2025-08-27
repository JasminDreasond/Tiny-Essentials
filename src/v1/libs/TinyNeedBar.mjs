/**
 * @typedef {Object} TickResult
 * @property {number} prevValue - Infinite value before applying decay.
 * @property {number} removedTotal - Total amount removed this tick.
 * @property {number} removedPercent - Percentage of max removed this tick.
 * @property {number} currentPercent - Current percentage relative to max.
 * @property {number} remainingValue - Current clamped value (≥ 0).
 * @property {number} infiniteRemaining - Current infinite value (can be negative).
 */

/**
 * Represents a decay factor applied to the need bar.
 *
 * - `amount`: base value reduced per tick.
 * - `multiplier`: multiplier applied to the amount.
 *
 * @typedef {Object} BarFactor
 * @property {number} amount - Base reduction value per tick.
 * @property {number} multiplier - Multiplier applied to the amount.
 */

/**
 * Represents the serialized state of a TinyNeedBar instance.
 *
 * This object is typically produced by {@link TinyNeedBar#toJSON} and
 * can be used to recreate an instance via {@link TinyNeedBar.fromJSON}.
 *
 * @typedef {Object} SerializedData
 * @property {number} maxValue - Maximum value of the bar at the moment of serialization.
 * @property {number} currentValue - Current clamped value (never below 0).
 * @property {number} infiniteValue - Infinite value (can go negative).
 * @property {Record<string, BarFactor>} factors - Active decay factors indexed by their keys.
 */

/**
 * A utility class to simulate a "need bar" system.
 *
 * The bar decreases over time according to defined factors (each with an amount and multiplier).
 * - The **main factor** controls the base decay per tick.
 * - Additional factors can be added dynamically.
 *
 * The system tracks two values:
 * - `currentValue` → cannot go below zero.
 * - `infiniteValue` → can decrease infinitely into negative numbers.
 */
class TinyNeedBar {
  /**
   * Stores all factors that influence decay.
   * Each entry contains an amount and a multiplier.
   * @type {Map<string, BarFactor>}
   */
  #factors = new Map();

  /** Maximum value of the bar. @type {number} */
  #maxValue;

  /** Current clamped value of the bar (never below 0). @type {number} */
  #currentValue;

  /** Current "infinite" value of the bar (can go negative). @type {number} */
  #infiniteValue;

  /**
   * Returns a snapshot of all currently active factors.
   * Each factor is returned as a plain object to prevent direct mutation of the internal map.
   *
   * @returns {Record<string, BarFactor>} A record of all factors indexed by their key.
   */
  get factors() {
    /** @type {Record<string, BarFactor>} */
    const factors = {};
    for (let [name, factor] of this.#factors.entries()) {
      factors[name] = { ...factor };
    }
    return factors;
  }

  /**
   * Returns the current percentage of the bar relative to the maximum value.
   *
   * @returns {number} Percentage from `0` to `100`.
   */
  get currentPercent() {
    return (this.#currentValue / this.#maxValue) * 100;
  }

  /**
   * Updates the maximum possible value of the bar.
   * Ensures `currentValue` never exceeds the new maximum.
   *
   * @param {number} value - New maximum value.
   */
  set maxValue(value) {
    this.#maxValue = value;
    this.#currentValue = Math.min(this.#currentValue, value);
  }

  /**
   * Returns the maximum possible value of the bar.
   *
   * @returns {number} The maximum value.
   */
  get maxValue() {
    return this.#maxValue;
  }

  /**
   * Returns the current clamped value of the bar.
   * This value will never be below `0`.
   *
   * @returns {number} Current value (≥ 0).
   */
  get currentValue() {
    return this.#currentValue;
  }

  /**
   * Updates the infinite value of the bar.
   * Automatically recalculates the `currentValue` (never below 0).
   *
   * @param {number} value - New infinite value.
   */
  set infiniteValue(value) {
    this.#infiniteValue = value;
    this.#currentValue = Math.max(0, value);
    this.#currentValue = Math.min(this.#currentValue, this.#maxValue);
  }

  /**
   * Returns the current infinite value of the bar.
   * Unlike `currentValue`, this one can go below zero.
   *
   * @returns {number} Current infinite value.
   */
  get infiniteValue() {
    return this.#infiniteValue;
  }

  /**
   * Creates a new need bar instance.
   *
   * @param {number} [maxValue=100] - Maximum value of the bar.
   * @param {number} [baseDecay=1] - Base amount reduced each tick.
   * @param {number} [baseDecayMulti=1] - Multiplier applied to the base decay.
   */
  constructor(maxValue = 100, baseDecay = 1, baseDecayMulti = 1) {
    this.#maxValue = maxValue;
    this.setFactor('main', baseDecay, baseDecayMulti);

    this.#currentValue = maxValue;
    this.#infiniteValue = maxValue;
  }

  /**
   * Retrieves a specific factor by its key.
   *
   * @param {string} key - The unique key of the factor.
   * @returns {BarFactor} The requested factor object.
   * @throws {Error} If the factor does not exist.
   */
  getFactor(key) {
    const result = this.#factors.get(key);
    if (!result) throw new Error(`Factor with key "${key}" not found.`);
    return { ...result };
  }

  /**
   * Checks if a specific factor exists by key.
   *
   * @param {string} key - The factor key to check.
   * @returns {boolean} `true` if the factor exists, otherwise `false`.
   */
  hasFactor(key) {
    return this.#factors.has(key);
  }

  /**
   * Defines or updates a decay factor.
   *
   * @param {string} key - Unique identifier for the factor.
   * @param {number} amount - Amount reduced per tick.
   * @param {number} [multiplier=1] - Multiplier applied to the amount.
   */
  setFactor(key, amount, multiplier = 1) {
    this.#factors.set(key, { amount, multiplier });
  }

  /**
   * Removes a decay factor by its key.
   *
   * @param {string} key - The factor key to remove.
   */
  removeFactor(key) {
    this.#factors.delete(key);
  }

  /**
   * Executes one tick of decay, applying all active factors.
   *
   * @returns {TickResult}
   */
  tick() {
    let removedTotal = 0;

    for (let [_, factor] of this.#factors.entries()) {
      removedTotal += factor.amount * factor.multiplier;
    }

    const prevValue = this.#infiniteValue;
    this.#infiniteValue -= removedTotal;
    this.#currentValue = Math.max(0, this.#currentValue - removedTotal);

    const removedPercent = (removedTotal / this.#maxValue) * 100;

    return {
      prevValue,
      removedTotal,
      removedPercent,
      currentPercent: this.currentPercent,
      remainingValue: this.#currentValue,
      infiniteRemaining: this.#infiniteValue,
    };
  }

  /**
   * Serializes the current state of the need bar.
   * @returns {SerializedData}
   */
  toJSON() {
    return {
      maxValue: this.#maxValue,
      currentValue: this.#currentValue,
      infiniteValue: this.#infiniteValue,
      factors: this.factors,
    };
  }

  /**
   * Restores a need bar from a serialized object.
   * @param {SerializedData} data
   * @returns {TinyNeedBar}
   */
  static fromJSON(data) {
    const bar = new TinyNeedBar(data.maxValue, 0, 0);
    bar.infiniteValue = data.infiniteValue;
    bar.#factors.clear();
    for (const [key, factor] of Object.entries(data.factors)) {
      bar.setFactor(key, factor.amount, factor.multiplier);
    }

    return bar;
  }

  /**
   * Creates a deep clone of this need bar.
   * @returns {TinyNeedBar}
   */
  clone() {
    return TinyNeedBar.fromJSON(this.toJSON());
  }

  /**
   * Clear the factors map, clearing all factor data.
   */
  clearFactors() {
    this.#factors.clear();
  }
}

export default TinyNeedBar;
