/**
 * Asynchronously replaces matches in a string using a regex and an async function.
 *
 * @param {string} str - The input string to perform replacements on.
 * @param {RegExp} regex - The regular expression to match substrings for replacement.
 * @param {Function} asyncFn - An asynchronous function that returns a replacement for each match.
 *                             It receives the same arguments as a standard `replace` callback.
 * @returns {Promise<string>} The resulting string with all async replacements applied.
 *
 * @example
 * await asyncReplace("Hello @user1 and @user2!", /@\w+/g, async (mention) => {
 *   return await getUserNameFromMention(mention);
 * });
 */
export default async function asyncReplace(str, regex, asyncFn) {
  /**
   * @type {any[]}
   */
  const promises = [];

  // Collect promises
  str.replace(regex, (match, ...args) => {
    promises.push(asyncFn(match, ...args));
    return match;
  });

  const data = await Promise.all(promises);

  // Replace using the resolved data
  return str.replace(regex, () => data.shift());
}
