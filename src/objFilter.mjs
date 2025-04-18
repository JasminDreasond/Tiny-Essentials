/**
 * Checks the type of a given object or returns its type as a string.
 *
 * @param {*} obj - The object to check or identify.
 * @param {string} [type] - Optional. If provided, checks whether the object matches this type (e.g., "object", "array", "string").
 * @returns {boolean|string|null} - Returns `true` if the type matches, `false` if not,
 *                                   the type string if no type is provided, or `null` if the object is `undefined`.
 *
 * @example
 * objType([], 'array'); // true
 * objType({}, 'object'); // true
 * objType('hello'); // "string"
 * objType(undefined); // null
 */
export function objType(obj, type) {
  // Is Defined
  if (typeof obj !== 'undefined') {
    // Check Obj Type
    if (typeof type === 'string') {
      if (Object.prototype.toString.call(obj).toLowerCase() === `[object ${type}]`) return true;
      return false;
    }
    // Get Obj Type
    const result = Object.prototype.toString.call(obj).toLowerCase();
    // Send Result
    return result.substring(8, result.length - 1);
  }
  // Nope
  return null;
}

/**
 * Counts the number of elements in an array or the number of properties in an object.
 *
 * @param {*} obj - The array or object to count.
 * @returns {number} - The count of items (array elements or object keys), or `0` if the input is neither an array nor an object.
 *
 * @example
 * countObj([1, 2, 3]); // 3
 * countObj({ a: 1, b: 2 }); // 2
 * countObj('not an object'); // 0
 */
export function countObj(obj) {
  // Is Array
  if (Array.isArray(obj)) return obj.length;
  // Object
  if (objType(obj, 'object')) return Object.keys(obj).length;
  // Nothing
  return 0;
}
