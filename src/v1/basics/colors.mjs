// Utility regex patterns
const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const HEXA_REGEX = /^#([A-Fa-f0-9]{8})$/;

// Alpha 0-1
const ALPHA = `(0|1|0?\\.\\d+)`;

// Matches integers from 0 to 255
const NUM_0_255 = `(0|[1-9]\\d?|1\\d{2}|2[0-4]\\d|25[0-5])`;

// Numbers 0-360
const NUM_0_360 = `(0|[1-9]\\d?|[1-2]\\d{2}|3[0-5]\\d|360)`;
// Numbers 0-100
const NUM_0_100 = `(0|[1-9]?\\d|100)`;

// RGB
const RGB_REGEX = new RegExp(
  `^rgb\\(\\s*${NUM_0_255}\\s*,\\s*${NUM_0_255}\\s*,\\s*${NUM_0_255}\\s*\\)$`,
);
const RGBA_REGEX = new RegExp(
  `^rgba\\(\\s*${NUM_0_255}\\s*,\\s*${NUM_0_255}\\s*,\\s*${NUM_0_255}\\s*,\\s*${ALPHA}\\s*\\)$`,
);

// HSL
const HSL_REGEX = new RegExp(
  `^hsl\\(\\s*${NUM_0_360}\\s*,\\s*${NUM_0_100}%\\s*,\\s*${NUM_0_100}%\\s*\\)$`,
);
const HSLA_REGEX = new RegExp(
  `^hsla\\(\\s*${NUM_0_360}\\s*,\\s*${NUM_0_100}%\\s*,\\s*${NUM_0_100}%\\s*,\\s*${ALPHA}\\s*\\)$`,
);

// HWB

const HWB_REGEX = new RegExp(
  `^hwb\\(\\s*${NUM_0_360}(deg|grad|rad|turn)?\\s*${NUM_0_100}%\\s*${NUM_0_100}%\\s*\\)$`,
);

// LAB

const LAB_AB = `(-?\\d+)`;

const LAB_REGEX = new RegExp(`^lab\\(\\s*${NUM_0_100}%?\\s*${LAB_AB}%?\\s*${LAB_AB}%?\\s*\\)$`);

// LCH

const LCH_REGEX = new RegExp(
  `^lch\\(\\s*${NUM_0_100}%?\\s*${NUM_0_100}%?\\s*${NUM_0_360}(deg|grad|rad|turn)?\\s*\\)$`,
);

// CSS Level 4 color names
const HTML_COLOR_NAMES = new Set([
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
]);

// CSS system special names
const SPECIAL_COLOR_NAMES = new Set(['transparent', 'currentColor']);

/**
 * ColorRegistry provides controlled access to color name sets.
 */
export const getColorRegistry = () => ({
  // --- HTML Color Names ---
  /**
   * Returns all HTML color names as an array.
   * @returns {string[]}
   */
  getHTMLColorNames() {
    return Array.from(HTML_COLOR_NAMES);
  },

  /**
   * Adds a new HTML color name.
   * @param {string} name
   * @returns {boolean} True if added, false if it already existed.
   */
  addHTMLColorName(name) {
    const before = HTML_COLOR_NAMES.size;
    HTML_COLOR_NAMES.add(name.toLowerCase());
    return HTML_COLOR_NAMES.size > before;
  },

  /**
   * Removes an HTML color name.
   * @param {string} name
   * @returns {boolean} True if removed, false if not found.
   */
  removeHTMLColorName(name) {
    return HTML_COLOR_NAMES.delete(name.toLowerCase());
  },

  /**
   * Checks if an HTML color name exists.
   * @param {string} name
   * @returns {boolean}
   */
  hasHTMLColorName(name) {
    return HTML_COLOR_NAMES.has(name.toLowerCase());
  },

  // --- Special Color Names ---
  /**
   * Returns all special color names as an array.
   * @returns {string[]}
   */
  getSpecialColorNames() {
    return Array.from(SPECIAL_COLOR_NAMES);
  },

  /**
   * Adds a new special color name.
   * @param {string} name
   * @returns {boolean} True if added, false if it already existed.
   */
  addSpecialColorName(name) {
    const before = SPECIAL_COLOR_NAMES.size;
    SPECIAL_COLOR_NAMES.add(name);
    return SPECIAL_COLOR_NAMES.size > before;
  },

  /**
   * Removes a special color name.
   * @param {string} name
   * @returns {boolean} True if removed, false if not found.
   */
  removeSpecialColorName(name) {
    return SPECIAL_COLOR_NAMES.delete(name);
  },

  /**
   * Checks if a special color name exists.
   * @param {string} name
   * @returns {boolean}
   */
  hasSpecialColorName(name) {
    return SPECIAL_COLOR_NAMES.has(name);
  },
});

// Validators

/**
 * Validates if a string is a valid HEX color (#RGB, #RRGGBB).
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid HEX color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorHex(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorHex: input must be a string.');
  return HEX_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid HEX color (#RRGGBBAA).
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid HEXA color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorHexa(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorHexa: input must be a string.');
  return HEXA_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid RGB color.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid RGB color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorRgb(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorRgb: input must be a string.');
  return RGB_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid RGBA color.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid RGBA color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorRgba(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorRgba: input must be a string.');
  return RGBA_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid HSL color.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid HSL color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorHsl(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorHsl: input must be a string.');
  return HSL_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid HSLA color.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid HSLA color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorHsla(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorHsla: input must be a string.');
  return HSLA_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid HWB color.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid HWB color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorHwb(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorHwb: input must be a string.');
  return HWB_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid CIELAB color.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid Lab color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorLab(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorLab: input must be a string.');
  return LAB_REGEX.test(input.trim());
}

/**
 * Validates if a string is a valid LCH color.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid LCH color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorLch(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorLch: input must be a string.');
  return LCH_REGEX.test(input.trim());
}

/**
 * Validates if a string matches a standard HTML color name.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid HTML color name.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorName(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorName: input must be a string.');
  return HTML_COLOR_NAMES.has(input.trim().toLowerCase());
}

/**
 * Validates if a string matches a special CSS color keyword.
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a special color keyword.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColorSpecialName(input) {
  if (typeof input !== 'string')
    throw new TypeError('validateHTMLColorSpecialName: input must be a string.');
  return SPECIAL_COLOR_NAMES.has(input.trim());
}

/**
 * Validates if a string is any valid CSS color (HEX, RGB, HSL, HWB, Lab, LCH, name, or special name).
 * @param {string} input - The input string to validate.
 * @returns {boolean} True if the input is a valid CSS color.
 * @throws {TypeError} If input is not a string.
 */
export function validateHTMLColor(input) {
  if (typeof input !== 'string') throw new TypeError('validateHTMLColor: input must be a string.');
  return (
    validateHTMLColorHex(input) ||
    validateHTMLColorHexa(input) ||
    validateHTMLColorRgb(input) ||
    validateHTMLColorRgba(input) ||
    validateHTMLColorHsl(input) ||
    validateHTMLColorHsla(input) ||
    validateHTMLColorHwb(input) ||
    validateHTMLColorLab(input) ||
    validateHTMLColorLch(input) ||
    validateHTMLColorName(input) ||
    validateHTMLColorSpecialName(input)
  );
}

/**
 * Represents the allowed angle unit types for CSS color functions.
 *
 * - `deg` → Degrees (0–360).
 * - `grad` → Gradians (0–400).
 * - `rad` → Radians (0–2π).
 * - `turn` → Turns (0–1).
 *
 * @typedef {'deg' | 'grad' | 'rad' | 'turn'} AngleUnit
 */

// --- HEX / HEXA ---

/**
 * Parses a HEX color string (#RGB or #RRGGBB).
 * Returns the regex match array with captured groups or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {string|null} Regex match result with captured groups, or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlHex(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlHex: input must be a string.');
  const result = new RegExp(HEX_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return result[1];
}

/**
 * Parses a HEXA color string (#RRGGBBAA).
 * Returns the regex match array with captured groups or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {string|null} Regex match result with captured groups, or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlHexa(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlHexa: input must be a string.');
  const result = new RegExp(HEXA_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return result[1];
}

// --- RGB / RGBA ---

/**
 * Parses an RGB color string (rgb(r, g, b)).
 * Returns the regex match array with captured groups for r, g, and b or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {[number, number, number]|null} Regex match result with groups [r, g, b], or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlRgb(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlRgb: input must be a string.');
  const result = new RegExp(RGB_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
}

/**
 * Parses an RGBA color string (rgba(r, g, b, a)).
 * Returns the regex match array with captured groups for r, g, b, and a or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {[number, number, number, number]|null} Regex match result with groups [r, g, b, a], or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlRgba(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlRgba: input must be a string.');
  const result = new RegExp(RGBA_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return [
    parseFloat(result[1]),
    parseFloat(result[2]),
    parseFloat(result[3]),
    parseFloat(result[4]),
  ];
}

// --- HSL / HSLA ---

/**
 * Parses an HSL color string (hsl(h, s%, l%)).
 * Returns the regex match array with captured groups for h, s, and l or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {[number, number, number]|null} Regex match result with groups [h, s, l], or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlHsl(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlHsl: input must be a string.');
  const result = new RegExp(HSL_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
}

/**
 * Parses an HSLA color string (hsla(h, s%, l%, a)).
 * Returns the regex match array with captured groups for h, s, l, and a or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {[number, number, number, number]|null} Regex match result with groups [h, s, l, a], or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlHsla(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlHsla: input must be a string.');
  const result = new RegExp(HSLA_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return [
    parseFloat(result[1]),
    parseFloat(result[2]),
    parseFloat(result[3]),
    parseFloat(result[4]),
  ];
}

// --- HWB ---

/**
 * Parses an HWB color string (hwb(hue, whiteness%, blackness%[, alpha])).
 * Returns the regex match array with captured groups or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {[number, AngleUnit|null, number, number]|null} Regex match result with captured groups, or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlHwb(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlHwb: input must be a string.');
  const result = new RegExp(HWB_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return [
    parseFloat(result[1]),
    // @ts-ignore
    result[2] ?? null,
    parseFloat(result[3]),
    parseFloat(result[4]),
  ];
}

// --- Lab ---

/**
 * Parses a CIELAB color string (lab(L a b[/alpha])).
 * Returns the regex match array with captured groups or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {[number, number, number]|null} Regex match result with captured groups, or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlLab(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlLab: input must be a string.');
  const result = new RegExp(LAB_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
}

// --- LCH ---

/**
 * Parses an LCH color string (lch(L C H[/alpha])).
 * Returns the regex match array with captured groups or null if invalid.
 * @param {string} input - The input string to parse.
 * @returns {[number, number, number, AngleUnit|null]|null} Regex match result with captured groups, or null if not valid.
 * @throws {TypeError} If input is not a string.
 */
export function parseHtmlLch(input) {
  if (typeof input !== 'string') throw new TypeError('parseHtmlLch: input must be a string.');
  const result = new RegExp(LCH_REGEX, 'gm').exec(input.trim());
  if (!result) return null;
  return [
    parseFloat(result[1]),
    parseFloat(result[2]),
    parseFloat(result[3]),
    // @ts-ignore
    result[4] ?? null,
  ];
}
