/**
 * Counts the number of elements in an array or the number of properties in an object.
 *
 * @param {Array<*>|Record<string | number | symbol, any>} obj - The array or object to count.
 * @returns {number} - The count of items (array elements or object keys).
 * @throws {TypeError} If the input is neither an array nor a pure object.
 *
 * @example
 * countObj([1, 2, 3]); // 3
 * countObj({ a: 1, b: 2 }); // 2
 * countObj('not an object'); // Throws TypeError
 */
export function countObj(obj) {
  if (!Array.isArray(obj) && !isJsonObject(obj))
    throw new TypeError('Argument must be either an Array or a pure JSON Object.');

  // Is Array
  if (Array.isArray(obj)) return obj.length;
  // Object
  return Object.keys(obj).length;
}

/**
 * Determines whether a given value is a pure JSON object (plain object).
 *
 * A pure object satisfies the following:
 * - It is not null.
 * - Its type is "object".
 * - Its internal [[Class]] is "[object Object]".
 * - It is not an instance of built-in types like Array, Date, Map, Set, etc.
 *
 * This function is useful for strict data validation when you want to ensure
 * a value is a clean JSON-compatible object, free of class instances or special types.
 *
 * @param {unknown} value - The value to test.
 * @returns {value is Record<string | number | symbol, unknown>} Returns true if the value is a pure object.
 */
export function isJsonObject(value) {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  if (Object.prototype.toString.call(value) !== '[object Object]') return false;
  return true;
}

/**
 * Determines whether a given value is a JSON object.
 *
 * A pure object satisfies the following:
 * - It is not null.
 * - Its type is "object".
 * - It is not an Array instance.
 *
 * @param {unknown} value - The value to test.
 * @returns {value is Object<string | number | symbol, unknown>} Returns true if the value is a object.
 */
export function isValidObj(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Determines whether the provided value is a class constructor.
 *
 * @reference https://stackoverflow.com/a/30760236
 * 
 * @param {unknown} target - The value to be inspected.
 * @returns {boolean} True if the value is a class constructor, false otherwise.
 * @throws {TypeError} If the provided target is not a function.
 */
export const isClass = (target) => {
  // 1. Strict runtime validation to prevent silent failures
  if (typeof target !== 'function')
    throw new TypeError(`The 'target' argument must be a function. Received: ${typeof target}`);

  try {
    // 2. Attempt to invoke the target as a regular function.
    // If 'target' is a class, it will throw a TypeError:
    // "Class constructor cannot be invoked without 'new'".
    target();
    return false;
  } catch (error) {
    // 3. Verify if the error is a TypeError and matches the class invocation error pattern.
    return error instanceof TypeError && error.message.includes('Class constructor');
  }
};

/**
 * Determines whether a given value is an instance of a custom ES6 class.
 *
 * @param {unknown} value - The value to inspect.
 * @returns {boolean} True if the value is an instance of an ES6 class, false otherwise.
 */
export function isClassInstance(value) {
    // 1. Primitives and null are never class instances.
    if (value === null || typeof value !== 'object') {
        return false;
    }

    const proto = Object.getPrototypeOf(value);

    // 2. Objects without prototypes (e.g., Object.create(null)) 
    // or plain objects ({}) are not custom class instances.
    if (proto === null || proto === Object.prototype) {
        return false;
    }

    // 3. Ensure the constructor property exists and is a callable function.
    if (typeof value.constructor !== 'function') {
        return false;
    }

    const constructorString = value.constructor.toString();

    // 4. Check if the constructor string starts with the 'class' keyword.
    // The regex /^\s*class\b/ is used to safely handle potential whitespace 
    // alterations caused by bundlers or minifiers.
    return /^\s*class\b/.test(constructorString);
}
