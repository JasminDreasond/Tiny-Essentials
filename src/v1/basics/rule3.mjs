/**
 * Executes a Rule of Three calculation.
 *
 * @param {number} val1 - The first reference value (numerator in direct proportion, denominator in inverse).
 * @param {number} val2 - The second reference value (denominator in direct proportion, numerator in inverse).
 * @param {number} val3 - The third value (numerator in direct proportion, denominator in inverse).
 * @param {boolean} inverse - Whether the calculation should use inverse proportion (true for inverse, false for direct).
 * @returns {number} The result of the Rule of Three operation.
 *
 * Rule of Three Formula (Direct Proportion):
 *      val1 / val2 = val3 / result
 *
 * For Inverse Proportion:
 *      val1 / val3 = val2 / result
 *
 * Visual Representation:
 *
 * For Direct Proportion:
 *      val1      val2
 *      -----  =  ------
 *      val3      result
 *
 * For Inverse Proportion:
 *      val1      val2
 *      -----  =  ------
 *      val3      result
 *
 * @example
 * // Direct proportion:
 * ruleOfThree.execute(2, 6, 3, false); // → 9
 *
 * @example
 * // Inverse proportion:
 * ruleOfThree.execute(2, 6, 3, true); // → 4
 */
const ruleOfThree = (val1, val2, val3, inverse) => {
  return inverse ? Number(val1 * val2) / val3 : Number(val3 * val2) / val1;
};

export default ruleOfThree;
