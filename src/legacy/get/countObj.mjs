import objType from './objType.mjs';

/**
 * Counts the number of elements or properties in an object or array.
 *
 * - If the input is an array, returns its length.
 * - If it's a plain object, returns the number of its own enumerable properties.
 * - Otherwise, returns 0.
 *
 * @param {*} obj - The input to count elements or properties from.
 * @returns {number} The count of elements (array) or properties (object), or 0 if not applicable.
 */
export default function countObj(obj) {
  // Is Array
  if (Array.isArray(obj)) return obj.length;
  // Object
  else if (objType(obj, 'object')) return Object.keys(obj).length;
  // Nothing
  return 0;
}
