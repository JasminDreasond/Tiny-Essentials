/**
 * Generates a comparator function to sort an array of objects by a given key.
 *
 * @param {string} item - The object key to sort by.
 * @param {boolean} [isReverse=false] - If `true`, the sorting will be in descending order.
 * @returns {(a: Object<string|number, *>, b: Object<string|number, *>) => number} Comparator function compatible with Array.prototype.sort().
 *
 * @example
 * const arr = [{ pos: 2 }, { pos: 1 }, { pos: 3 }];
 * arr.sort(arraySortPositions('pos')); // Ascending: [{pos: 1}, {pos: 2}, {pos: 3}]
 *
 * @example
 * const arr = [{ pos: 2 }, { pos: 1 }, { pos: 3 }];
 * arr.sort(arraySortPositions('pos', true)); // Descending: [{pos: 3}, {pos: 2}, {pos: 1}]
 */
export default function arraySortPositions(item, isReverse = false) {
  if (!isReverse) {
    return function (a, b) {
      return a[item] < b[item] ? -1 : a[item] > b[item] ? 1 : 0;
    };
  } else {
    return function (a, b) {
      return a[item] > b[item] ? -1 : a[item] < b[item] ? 1 : 0;
    };
  }
}
