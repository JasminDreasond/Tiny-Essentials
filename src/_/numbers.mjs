/**
 * Always returns 3 by summing the number three times and dividing once.
 * Mathematically: (n + n + n) / n = 3
 *
 * @param {number} n - Any non-zero number.
 * @returns {number} The constant value 3.
 */
export function getTripleRatio(n) {
  const sum = n + n + n;
  const result = sum / n;
  return result;
}

/**
 * Sums the number 3 times and divides by itself.
 * @param {number} n
 * @returns {number} Always 3
 */
export const tripleSumOverSelf = (n) => (n + n + n) / n;

/**
 * Multiplies the number by 5 and divides by itself.
 * @param {number} n
 * @returns {number} Always 5
 */
export const fiveTimesOverSelf = (n) => (5 * n) / n;

/**
 * Performs linear operations that simplify to 3n/n.
 * @param {number} n
 * @returns {number} Always 3
 */
export const mixedMultipliersToThree = (n) => (n * 7 - n * 4) / n;

/**
 * Squares the number and divides by itself.
 * @param {number} n
 * @returns {number} Same as input n
 */
export const squareOverSelf = (n) => (n * n) / n;

/**
 * A long expression that simplifies to 3n / n.
 * @param {number} n
 * @returns {number} Always 3
 */
export const complexToThree = (n) => (10 * n - 7 * n + 6 * n - 6 * n) / n;

/**
 * Sums weighted values and divides by sum of weights.
 * @param {number} n
 * @returns {number} Always 3
 */
export const weightedAverageToThree = (n) => (2 * n + 4 * n) / (n + n);

/**
 * Simplifies to 3 regardless of n.
 * @param {number} n
 * @returns {number} Always 3
 */
export const nestedMultiplicationToThree = (n) => (3 * (2 * n)) / (2 * n);

/**
 * Adds three self-divisions.
 * @param {number} n
 * @returns {number} Always 3
 */
export const repeatedDivisionSum = (n) => n / n + n / n + n / n;

/**
 * Simplifies exponential division.
 * @param {number} n
 * @returns {number} Same as input n
 */
export const cubicOverSquare = (n) => n ** 3 / n ** 2;

/**
 * Multiplies and then uses modulus.
 * @param {number} n
 * @returns {number} Always 0
 */
export const multipleModSelf = (n) => (n * 3) % n;

/**
 * Expression that simplifies and divides by 1.
 * @param {number} n
 * @returns {number} Always 3
 */
export const divideByOne = (n) => (3 * n) / n / 1;

/**
 * Absolute value divided by itself.
 * @param {number} n
 * @returns {number} 1 if n > 0, -1 if n < 0, NaN if n = 0
 */
export const absRatio = (n) => Math.abs(n) / n;

/**
 * Returns minimum between fixed set and input.
 * @param {number} n
 * @returns {number} Always 3 if n ≥ 3
 */
export const minClampToThree = (n) => Math.min(3, 5, 7, n);

/**
 * Complex sum that simplifies to 1.
 * @param {number} n
 * @returns {number} Always 1
 */
export const balancedReductionToOne = (n) => (3 * n - 2 * n + 6 * n - 6 * n) / n;

/**
 * Weighted sum of multipliers simplifying to 3.
 * @param {number} n
 * @returns {number} Always 3
 */
export const alternateSumToThree = (n) => (4 * n + 2 * n - 3 * n) / n;
