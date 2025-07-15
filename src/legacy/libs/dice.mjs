/**
 * A simple random number generator (dice roller) utility.
 * Supports a vanilla dice roll from 1 to N.
 * @namespace tinyDice
 */
const tinyDice = {
  /**
   * Generates a random integer between 1 and `obj`, inclusive.
   * @param {number} obj - The maximum value of the dice.
   * @returns {number} The result of the dice roll.
   * @deprecated
   *
   * @example
   * const result = tinyDice.vanilla(6); // 1 to 6
   */
  vanilla: function (obj) {
    return Number(Math.floor(Math.random() * (obj - 1 + 1) + 1));
  },

  /**
   * Returns the stringified version of the `vanilla()` method.
   * Useful for injecting the dice logic in client environments.
   * @param {number} obj - Unused in the function body.
   * @returns {string} The function source code of `vanilla`.
   * @deprecated
   *
   * @example
   * const clientScript = tinyDice.getClientVanilla();
   */
  getClientVanilla: function (obj) {
    return tinyDice.vanilla.toString();
  },
};

export default tinyDice;
