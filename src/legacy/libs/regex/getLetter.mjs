/**
 * Matches exactly one letter (lowercase or uppercase).
 * @param {string} [type='g'] - The flag for the regular expression (default is 'g').
 * @returns {RegExp} The regular expression to match exactly one letter.
 * @deprecated
 */
function oneLetter(type = 'g') {
  return new RegExp('^[a-zA-Z]+$', type); // Matches exactly one letter
}

/**
 * Matches one or more letters (lowercase or uppercase).
 * @param {string} [type='g'] - The flag for the regular expression (default is 'g').
 * @returns {RegExp} The regular expression to match one or more letters.
 * @deprecated
 */
function multiLetters(type = 'g') {
  return new RegExp('[a-zA-Z]+', type); // Matches one or more letters
}

export {
  oneLetter, // Matches exactly one letter
  multiLetters, // Matches one or more letters
};
