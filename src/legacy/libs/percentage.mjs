/**
 * Simple utility to calculate percentage values.
 * @namespace percentageBase
 */
const percentageBase = {
  /**
   * Calculates a percentage of a given base value.
   * @param {number} preco - The base value.
   * @param {number} porcentagem - The percentage to apply.
   * @returns {number} The result of the percentage calculation.
   * @deprecated
   *
   * @example
   * percentageBase.run(200, 15); // 30
   */
  run: function (preco, porcentagem) {
    return preco * (porcentagem / 100);
  },
};

export default percentageBase;
