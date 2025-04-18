// https://stackoverflow.com/questions/3617797/regex-to-match-only-letters
function oneLetter(type = 'g') {
  return new RegExp('[a-zA-Z]', type);
}

function multiLetters(type = 'g') {
  return new RegExp('[a-zA-Z]+', type);
}

function oneLetter(type = 'g') {
  return new RegExp('^[a-zA-Z]+$', type);
}

export {
  // Use a character set: [a-zA-Z] matches one letter from A–Z in lowercase and uppercase.
  oneLetter,
  // [a-zA-Z]+ matches one or more letters
  multiLetters,
  // ^[a-zA-Z]+$ matches only strings that consist of one or more letters only
  oneLetter,
};
