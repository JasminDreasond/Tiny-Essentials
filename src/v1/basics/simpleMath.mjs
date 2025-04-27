/**
 * Executes a Rule of Three calculation.
 *
 * @param {number} val1 - The first reference value (numerator in direct proportion, denominator in inverse).
 * @param {number} val2 - The second reference value (denominator in direct proportion, numerator in inverse).
 * @param {number} val3 - The third value (numerator in direct proportion, denominator in inverse).
 * @param {boolean} [inverse] - Whether the calculation should use inverse proportion (true for inverse, false for direct).
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
export function ruleOfThree(val1, val2, val3, inverse = false) {
  return inverse ? Number(val1 * val2) / val3 : Number(val3 * val2) / val1;
}

/**
 * Calculates a percentage of a given base value.
 * @param {number} price - The base value.
 * @param {number} percentage - The percentage to apply.
 * @returns {number} The result of the percentage calculation.
 *
 * @example
 * getSimplePerc(200, 15); // 30
 */
export function getSimplePerc(price, percentage) {
  return price * (percentage / 100);
}

/**
 * Calculates the age based on the given date.
 *
 * @param {number|string|Date} timeData - The birth date (can be a timestamp, ISO string, or Date object).
 * @param {Date|null} [now=null] - The Date object representing the current date. Defaults to the current date and time if not provided.
 * @returns {number|null} The age in years, or null if `timeData` is not provided or invalid.
 */
export function getAge(timeData = 0, now = null) {
  if (typeof timeData !== 'undefined' && timeData !== null && timeData !== 0) {
    const birthDate = new Date(timeData);
    if (Number.isNaN(birthDate.getTime())) return null;

    const currentDate = now instanceof Date ? now : new Date();

    let age = currentDate.getFullYear() - birthDate.getFullYear();

    const currentMonth = currentDate.getMonth();
    const birthMonth = birthDate.getMonth();

    const currentDay = currentDate.getDate();
    const birthDay = birthDate.getDate();

    // Adjust if birthday hasn't occurred yet this year
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) age--;

    return Math.abs(age);
  }

  return null;
}
