// @ts-nocheck

import objType from '../../../get/objType.mjs';

/**
 * Validates the provided data and returns an object with either the parsed data or an error message.
 * The function checks if the data is an object, array, or an invalid response, and processes it accordingly.
 * If the data contains a `401 Unauthorized` error, it is handled specifically.
 *
 * @function
 * @param {Object|Array} data - The response data to validate. This can be either an object or an array.
 *
 * @returns {Record<string, any>} The result object containing:
 *   - `data` (Object|null): The validated data if no error occurred or null if an error was found.
 *   - `error` (Object|null): The error object if there was an issue, or null if no error was found.
 *
 * @example
 * const response = { error: 'invalid_request', error_description: 'Invalid request format' };
 * const result = errorValidator(response);
 * console.log(result); // { data: null, error: { code: 401, message: 'Invalid request format' } }
 *
 * @example
 * const response = [{ id: 1, name: 'John' }];
 * const result = errorValidator(response);
 * console.log(result); // { data: [{ id: 1, name: 'John' }], error: null }
 *
 * @example
 * const response = 'Invalid Response';
 * const result = errorValidator(response);
 * console.log(result); // { data: null, error: { code: 500, message: 'Invalid HTTP Result!' } }
 */
export default function errorValidator(data) {
  // Result
  const result = { data: null, error: null };

  // Exist Object
  if (objType(data, 'object')) {
    // Success
    if (typeof data.message !== 'string' || data.message !== '401: Unauthorized') {
      // Success Complete
      if (typeof data.error !== 'string' || typeof data.error_description !== 'string')
        result.data = data;
      // Nope
      else result.error = { code: 401, message: data.error_description };
    }

    // Nope
    else result.error = { code: 401, message: data.message };
  }

  // Exist Array
  else if (Array.isArray(data)) result.data = data;
  // Nope
  else result.error = { code: 500, message: 'Invalid HTTP Result!' };

  // Complete
  return result;
}
