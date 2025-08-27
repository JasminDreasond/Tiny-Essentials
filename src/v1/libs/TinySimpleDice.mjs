/**
 * TinySimpleDice
 *
 * A lightweight, flexible dice rolling utility for generating random numbers.
 * You can configure the dice to allow zero, set a maximum value, and even roll
 * values suitable for indexing arrays or Sets.
 */
class TinySimpleDice {
  /**
   * Rolls a dice specifically for choosing an array or Set index.
   * @param {any[]|Set<any>} arr - The array or Set to get a random index from.
   * @returns {number} - Valid index for the array or Set.
   * @throws {TypeError} If the input is not an array or Set.
   */
  static rollArrayIndex(arr) {
    const isArray = Array.isArray(arr);
    const isSet = arr instanceof Set;
    if (!isArray && !isSet) throw new TypeError('rollArrayIndex expects an array or Set.');
    return Math.floor(Math.random() * (isArray ? arr.length : arr.size));
  }

  /**
   * Creates a new TinySimpleDice instance.
   * @param {Object} options - Configuration options for the dice.
   * @param {number} options.maxValue - Maximum value the dice can roll.
   * @param {boolean} [options.allowZero=true] - Whether 0 is allowed as a result.
   * @throws {TypeError} If maxValue is not a non-negative integer or allowZero is not boolean.
   */
  constructor({ maxValue, allowZero = true }) {
    if (typeof allowZero !== 'boolean') throw new TypeError('allowZero must be an boolean.');
    if (!Number.isInteger(maxValue) || maxValue < 0)
      throw new TypeError('maxValue must be an integer greater than -1.');
    this.maxValue = maxValue;
    this.allowZero = allowZero;
  }

  /**
   * Rolls the dice according to the configuration.
   * @returns {number} - Random number according to the dice configuration.
   */
  roll() {
    const min = this.allowZero ? 0 : 1;
    return Math.floor(Math.random() * (this.maxValue - min + 1)) + min;
  }
}

export default TinySimpleDice;
