import objType from './objType.mjs';

/**
 * Filters a list of strings by comparing each item against a list of validators.
 *
 * Each validator can be either:
 * - A **string** (for exact match)
 * - An **object** with one or more of the following:
 *   - `starts`: {string} - The string must start with this prefix.
 *   - `ends`: {string} - The string must end with this suffix.
 *   - `regexp`: {RegExp} - The string must match the regular expression.
 *
 * The comparison stops at the first matching validator per item.
 *
 * Examples:
 * ```js
 * super_string_filter(['apple', 'banana', 'blueberry'], ['banana']); // ['banana']
 * super_string_filter(['apple', 'banana'], [{ starts: 'app' }]); // ['apple']
 * super_string_filter(['test.js'], [{ ends: '.js' }]); // ['test.js']
 * super_string_filter(['data123'], [{ regexp: /^\w+\d+$/ }]); // ['data123']
 * ```
 *
 * @param {string[]} list - The list of strings to filter.
 * @param {(string|Object)[]} validator_list - The list of validators.
 * @returns {string[]} A filtered array of strings that passed at least one validator.
 * @deprecated
 */
export default function super_string_filter(list, validator_list) {
  // Result
  const result = [];

  // The For
  for (const item in list) {
    for (const item2 in validator_list) {
      // Check Types

      // String
      if (typeof validator_list[item2] === 'string') {
        if (list[item] === validator_list[item2]) {
          result.push(validator_list[item2]);
          break;
        }
      }

      // Object
      else if (objType(validator_list[item2], 'object')) {
        // Validator
        const tiny_validator = {};

        // Starts With
        tiny_validator.starts = {};
        // @ts-ignore
        tiny_validator.starts.enabled = typeof validator_list[item2].starts === 'string';
        // @ts-ignore
        if (tiny_validator.starts.enabled) {
          // @ts-ignore
          tiny_validator.starts.result = list[item].startsWith(validator_list[item2].starts);
        }

        // Ends With
        tiny_validator.ends = {};
        // @ts-ignore
        tiny_validator.ends.enabled = typeof validator_list[item2].ends === 'string';
        // @ts-ignore
        if (tiny_validator.ends.enabled) {
          // @ts-ignore
          tiny_validator.ends.result = list[item].endsWith(validator_list[item2].ends);
        }

        // RegExp
        tiny_validator.regexp = {};
        // @ts-ignore
        tiny_validator.regexp.enabled = objType(validator_list[item2].regexp, 'regexp');
        // @ts-ignore
        if (tiny_validator.regexp.enabled) {
          // @ts-ignore
          tiny_validator.regexp.result = list[item].match(validator_list[item2].regexp);
        }

        // Check Validator
        let allowed_timezone = true;
        for (const item3 in tiny_validator) {
          // @ts-ignore
          if (tiny_validator[item3].enabled) {
            // Invalid Result
            // @ts-ignore
            if (!tiny_validator[item3].result) {
              allowed_timezone = false;
              break;
            }
          }
        }

        // Start With
        if (allowed_timezone) {
          result.push(list[item]);
          break;
        }
      }
    }
  }

  // Result
  return result;
}
