// @ts-nocheck

/**
 * Checks the internal type of an object using `Object.prototype.toString`.
 *
 * - If `type` is provided, returns `true` if it matches the object's internal type (case-insensitive).
 * - If `type` is omitted, returns the object's internal type as a lowercase string.
 *
 * Examples:
 * ```js
 * objType([], 'array'); // true
 * objType({}, 'object'); // true
 * objType('hello'); // "string"
 * objType(undefined); // null
 * ```
 *
 * @param {*} obj - The value to check the type of.
 * @param {string} [type] - Optional string to compare the object's type against.
 * @returns {boolean|string|null} Returns true/false if checking, or type string/null if querying.
 */
export default function objType(obj, type) {
  // Is Defined
  if (typeof obj !== 'undefined') {
    // Check Obj Type
    if (typeof type === 'string') {
      if (Object.prototype.toString.call(obj).toLowerCase() === `[object ${type}]`) return true;
      else return false;
    }

    // Get Obj Type
    else {
      // Result
      const result = Object.prototype.toString.call(obj).toLowerCase();
      // Send Result
      return result.substring(8, result.length - 1);
    }
  }

  // Nope
  else return null;
}
