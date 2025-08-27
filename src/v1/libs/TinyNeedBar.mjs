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
   * @type {Map<string, {amount: number, multiplier: number}>}
   */
  #factors = new Map();

  /** Maximum value of the bar. @type {number} */
  #maxValue;

  /** Current clamped value of the bar (never below 0). @type {number} */
  #currentValue;

  /** Current "infinite" value of the bar (can go negative). @type {number} */
  #infiniteValue;

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
    const currentPercent = (this.#currentValue / this.#maxValue) * 100;

    return {
      prevValue,
      removedTotal,
      removedPercent,
      currentPercent,
      remainingValue: this.#currentValue,
      infiniteRemaining: this.#infiniteValue,
    };
  }
}

export default TinyNeedBar;
