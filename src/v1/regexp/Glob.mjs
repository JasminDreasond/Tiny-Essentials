/**
 * A highly professional utility to convert GLOB patterns into JavaScript RegExp objects,
 * and decompile them back into GLOB strings.
 *
 * Supports standard features: '*', '**', '?', '[...]', '[!...]', '{a,b}', and '\' escaping.
 */

/**
 * Compiles a GLOB string pattern into a RegExp object.
 *
 * @param {string|string[]} globData - The GLOB pattern to compile.
 * @property {boolean} [strict=true] - If true, throws SyntaxError on unbalanced brackets or braces.
 * @returns {string[]} The resulting regular expression parsed into string array.
 * @throws {TypeError} If globPattern or flags are not strings.
 * @throws {SyntaxError} If the pattern has unmatched groups and strict mode is enabled.
 */
export const compileGlob = (globData, strict = true) => {
  if (typeof globData !== 'string' && !Array.isArray(globData)) {
    throw new TypeError('GLOB pattern must be a string or an array of strings.');
  }
  if (Array.isArray(globData)) {
    const allStrings = globData.every((item) => typeof item === 'string');
    if (!allStrings) {
      throw new TypeError('All elements in the GLOB array must be strings.');
    }
  }
  if (typeof strict !== 'boolean') {
    throw new TypeError('Strict mode must be a boolean.');
  }

  const globPattern = Array.isArray(globData) ? globData.join('') : globData;
  const regexString = ['^'];
  let i = 0;
  let inGroup = false;
  let inBracket = false;

  while (i < globPattern.length) {
    const char = globPattern[i];

    // Handle explicit escaping
    if (char === '\\') {
      const nextChar = globPattern[i + 1] || '';
      regexString.push('\\' + nextChar);
      i += 2;
      continue;
    }

    // Handle character classes [...]
    if (inBracket) {
      if (char === ']') {
        inBracket = false;
        regexString.push(']');
      } else if (char === '!' && globPattern[i - 1] === '[') {
        // Translate GLOB negation [!a] to RegExp negation [^a]
        regexString.push('^');
      } else {
        regexString.push(char);
      }
      i++;
      continue;
    }

    // Handle standard GLOB characters and escape RegExp specials
    switch (char) {
      // Escape RegExp syntax characters that have no meaning in GLOB
      case '/':
      case '$':
      case '^':
      case '+':
      case '.':
      case '(':
      case ')':
      case '=':
      case '!':
      case '|':
        regexString.push('\\' + char);
        break;

      // Match a single character (excluding path separators)
      case '?':
        regexString.push('[^/]');
        break;

      // Start character class
      case '[':
        inBracket = true;
        regexString.push(char);
        break;

      // Literal closing bracket if it wasn't opened
      case ']':
        regexString.push('\\]');
        break;

      // Start an alternation group {a,b}
      case '{':
        inGroup = true;
        regexString.push('(');
        break;

      // Close an alternation group
      case '}':
        if (inGroup) {
          inGroup = false;
          regexString.push(')');
        } else {
          regexString.push('\\}');
        }
        break;

      // Separator inside alternation group
      case ',':
        regexString.push(inGroup ? '|' : '\\,');
        break;

      // Handle wildcards (* and **)
      case '*':
        let starCount = 1;
        while (globPattern[i + 1] === '*') {
          starCount++;
          i++;
        }
        if (starCount > 1) {
          // '**' matches anything, including path separators
          regexString.push('.*');
        } else {
          // '*' matches anything except path separators
          regexString.push('[^/]*');
        }
        break;

      // Literal characters
      default:
        regexString.push(char);
    }
    i++;
  }

  // Strict validations for unclosed syntax
  if (strict) {
    if (inBracket) throw new SyntaxError('Unmatched bracket "[" in GLOB pattern.');
    if (inGroup) throw new SyntaxError('Unmatched brace "{" in GLOB pattern.');
  }

  // Anchor to the end of the string
  regexString.push('$');

  return regexString;
};

/**
 * Compiles a GLOB string pattern into a RegExp object.
 *
 * @param {string} globPattern - The GLOB pattern to compile.
 * @param {string} [flags=''] - Optional RegExp flags (e.g., 'i', 'g', 'm').
 * @property {boolean} [strict=true] - If true, throws SyntaxError on unbalanced brackets or braces.
 * @returns {RegExp} The resulting regular expression.
 * @throws {TypeError} If globPattern or flags are not strings.
 * @throws {SyntaxError} If the pattern has unmatched groups and strict mode is enabled.
 */
export const compileGlobRegExp = (globPattern, flags = '', strict = true) => {
  if (typeof flags !== 'string') {
    throw new TypeError('RegExp flags must be a string.');
  }
  return new RegExp(compileGlob(globPattern, strict).join(''), flags);
};

/**
 * Decompiles a glob data back into a GLOB string pattern.
 * Note: This method is designed specifically for values generated by this file compiler method.
 *
 * @param {RegExp|string|string[]} regexp - The regular expression to decompile.
 * @returns {string[]} The reconstructed GLOB pattern.
 * @throws {TypeError} If the argument is not a valid RegExp instance or string.
 */
export const decompileGlob = (regexp) => {
  if (
    !(regexp instanceof RegExp) &&
    typeof regexp !== 'string' &&
    (!Array.isArray(regexp) || !regexp.every((v) => typeof v === 'string'))
  ) {
    throw new TypeError('Argument must be a RegExp instance or string stuff.');
  }

  let source =
    typeof regexp === 'string' ? regexp : Array.isArray(regexp) ? regexp.join('') : regexp.source;
  const globPattern = [];

  // Remove the strict start and end anchors that the compiler adds
  if (source.startsWith('^')) {
    source = source.slice(1);
  }
  if (source.endsWith('$')) {
    source = source.slice(0, -1);
  }

  let i = 0;
  while (i < source.length) {
    const char = source[i];

    // Handle escaped characters (e.g., '\/' becomes '/', '\.' becomes '.')
    if (char === '\\') {
      const nextChar = source[i + 1] || '';
      globPattern.push(nextChar);
      i += 2;
      continue;
    }

    // Handle '**' wildcard (compiled as '.*')
    if (char === '.') {
      if (source[i + 1] === '*') {
        globPattern.push('**');
        i += 2;
        continue;
      }
    }

    if (char === '[') {
      // Handle '*' wildcard (compiled as '[^/]*')
      if (source.slice(i, i + 5) === '[^/]*') {
        globPattern.push('*');
        i += 5;
        continue;
      }
      // Handle '?' wildcard (compiled as '[^/]')
      if (source.slice(i, i + 4) === '[^/]') {
        globPattern.push('?');
        i += 4;
        continue;
      }
      // Handle negation inside brackets (compiled from '[!' to '[^')
      if (source[i + 1] === '^') {
        globPattern.push('[!');
        i += 2;
        continue;
      }
    }

    // Restore alternation groups '{a,b}' (compiled as '(a|b)')
    if (char === '(') {
      globPattern.push('{');
      i++;
      continue;
    }
    if (char === '|') {
      globPattern.push(',');
      i++;
      continue;
    }
    if (char === ')') {
      globPattern.push('}');
      i++;
      continue;
    }

    // Literal character appending
    globPattern.push(char);
    i++;
  }

  return globPattern;
};

/**
 * Validates if a given pattern is a syntactically correct GLOB string.
 *
 * @param {string|string[]} globPattern - The pattern to validate.
 * @returns {boolean} True if the pattern is syntactically valid, false otherwise.
 * @throws {TypeError} If the input is not a string or an array of strings.
 */
export const isValidGlob = (globPattern) => {
  try {
    // 1. Attempt to compile the pattern using the existing strict logic.
    // If the syntax is broken, compileGlob will throw a SyntaxError.
    compileGlob(globPattern, true);
    return true;
  } catch (error) {
    // 2. If the error is a SyntaxError, the pattern is mathematically/syntactically invalid.
    if (error instanceof SyntaxError) {
      return false;
    }

    // 3. If it's any other error, re-throw it to avoid masking potential bugs.
    throw error;
  }
};
