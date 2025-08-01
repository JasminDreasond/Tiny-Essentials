/**
 * Number 3?
 * @param {number} n
 * @returns {number}
 */
export function process3Numbers(n) {
  const sum = n + n + n;
  const result = sum / n;
  return result;
}

/**
 * Generates a 100x100 table with the processed results.
 * Each line represents a number of 1 to 100,
 * and each column is the result of processNumber(line × column).
 *
 * @returns {{ [key: number]: number[] }}
 */
export function generateProcessedMultiplicationTable() {
  /** @type {{ [key: number]: number[] }} */
  const table = {};

  for (let i = 1; i <= 100; i++) {
    table[i] = [];
    for (let j = 1; j <= 100; j++) {
      const multiplied = i * j;
      const processed = process3Numbers(multiplied);
      table[i].push(processed);
    }
  }

  return table;
}

// Example:
// const resultTable = generateProcessedMultiplicationTable();
// console.log(resultTable);
