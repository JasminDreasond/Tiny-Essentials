class TinyNeedBar {
  /**
   * @type {Map<string, {amount: number, multiplier: number}>}
   */
  #factors = new Map();

  /** @type {number} */
  #maxValue;

  /** @type {number} */
  #currentValue;

  /** @type {number} */
  #infiniteValue;

  /**
   * @param {number} maxValue
   * @param {number} baseDecay
   * @param {number} baseDecayMulti
   */
  constructor(maxValue = 100, baseDecay = 1, baseDecayMulti = 1) {
    this.#maxValue = maxValue;
    this.setFactor('main', baseDecay, baseDecayMulti);

    this.#currentValue = maxValue;
    this.#infiniteValue = maxValue;
  }

  /**
   * @param {string} key
   * @param {number} amount
   * @param {number} multiplier
   */
  setFactor(key, amount, multiplier = 1) {
    this.#factors.set(key, { amount, multiplier });
  }

  /**
   * @param {string} key
   */
  removeFactor(key) {
    this.#factors.delete(key);
  }

  /**
   * Executes one tick of decay
   * @returns {{
   *   prevValue: number,
   *   removedTotal: number,
   *   removedPercent: number,
   *   currentPercent: number,
   *   remainingValue: number,
   *   infiniteRemaining: number
   * }}
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
