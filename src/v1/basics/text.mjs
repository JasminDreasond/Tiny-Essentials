/**
 * Converts a string to title case where the first letter of each word is capitalized.
 * All other letters are converted to lowercase.
 *
 * Example: "hello world" -> "Hello World"
 *
 * @param {string} str - The string to be converted to title case.
 * @returns {string} The string converted to title case.
 */
export function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Converts a string to title case where the first letter of each word is capitalized,
 * but the first letter of the entire string is left lowercase.
 *
 * Example: "hello world" -> "hello World"
 *
 * @param {string} str - The string to be converted to title case with the first letter in lowercase.
 * @returns {string} The string converted to title case with the first letter in lowercase.
 */
export function toTitleCaseLowerFirst(str) {
  const titleCased = str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
  return titleCased.charAt(0).toLowerCase() + titleCased.slice(1);
}
