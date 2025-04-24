// @ts-nocheck

import * as firebaseEscape from './escape.mjs';

/**
 * Escapes a given string or number for use in Firebase database paths, with an option to preserve the path structure.
 *
 * This function encodes the input string or number using a custom encoding defined in the `firebaseEscape.encode()` method.
 * If the `keepPath` flag is set to `true`, the function will encode each segment of the path individually.
 *
 * @param {string|number} text - The text or number to be escaped.
 * @param {boolean} [keepPath=false] - Whether to preserve the path structure (encode each path segment separately).
 * @returns {string|null} The escaped string or null if the input is neither a string nor a number.
 */
export default function databaseEscape(text, keepPath = false) {
  // Check if the input is a string or number
  if (typeof text === 'string' || typeof text === 'number') {
    // Convert the value to a string if it's a number
    let new_value = text;
    if (typeof new_value === 'number') new_value = String(new_value);

    // Normal escape (do not preserve path)
    if (!keepPath) new_value = firebaseEscape.encode(new_value);
    // Escape path segments individually (preserve path structure)
    else {
      // Split path into segments
      new_value = new_value.split('/');
      for (const item in new_value) new_value[item] = firebaseEscape.encode(new_value[item]);

      // Join the segments back into a single string
      new_value = new_value.join('/');
    }

    // Return the escaped value
    return new_value;
  }

  // Return null if the input is neither a string nor a number
  else return null;
}
