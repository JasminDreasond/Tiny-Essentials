import objType from './objType.mjs';

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
        tiny_validator.starts.enabled = typeof validator_list[item2].starts === 'string';
        if (tiny_validator.starts.enabled) {
          tiny_validator.starts.result = list[item].startsWith(validator_list[item2].starts);
        }

        // Ends With
        tiny_validator.ends = {};
        tiny_validator.ends.enabled = typeof validator_list[item2].ends === 'string';
        if (tiny_validator.ends.enabled) {
          tiny_validator.ends.result = list[item].endsWith(validator_list[item2].ends);
        }

        // RegExp
        tiny_validator.regexp = {};
        tiny_validator.regexp.enabled = objType(validator_list[item2].regexp, 'regexp');
        if (tiny_validator.regexp.enabled) {
          tiny_validator.regexp.result = list[item].match(validator_list[item2].regexp);
        }

        // Check Validator
        let allowed_timezone = true;
        for (const item3 in tiny_validator) {
          if (tiny_validator[item3].enabled) {
            // Invalid Result
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
