/**
 * Capitalizes the first letter of each word in a given string.
 *
 * @param {string} text - The input string to be transformed.
 * @returns {string} The transformed string with each word's first letter capitalized.
 * @deprecated
 *
 * @example
 * capitalize("hello world"); // "Hello World"
 *
 * @example
 * capitalize("my little pony"); // "My Little Pony"
 */
export default function capitalize(text) {
  return text.replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
}
