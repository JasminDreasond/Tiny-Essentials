// Utility regex patterns
const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const HEXA_REGEX = /^#([A-Fa-f0-9]{8})$/;

const RGB_REGEX = /^rgb\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)$/;
const RGBA_REGEX = /^rgba\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1}|0?\.\d+)\)$/;

const HSL_REGEX = /^hsl\((\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\)$/;
const HSLA_REGEX = /^hsla\((\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1}|0?\.\d+)\)$/;

const HWB_REGEX =
  /^hwb\(\s*\d{1,3}(deg|grad|rad|turn)?\s*\d{1,3}%\s*\d{1,3}%\s*(,\s*(0|1|0?\.\d+))?\)$/i;

const LAB_REGEX = /^lab\(\s*\d{1,3}%?\s*-?\d{1,3}%?\s*-?\d{1,3}%?\s*(\/\s*(0|1|0?\.\d+))?\)$/i;

const LCH_REGEX =
  /^lch\(\s*\d{1,3}%?\s*\d{1,3}%?\s*\d{1,3}(deg|grad|rad|turn)?\s*(\/\s*(0|1|0?\.\d+))?\)$/i;

// CSS Level 4 color names
const HTML_COLOR_NAMES = new Set([
  'red',
  'blue',
  'green',
  'black',
  'white',
  'gray',
  'silver',
  'maroon',
  'olive',
  'lime',
  'aqua',
  'teal',
  'navy',
  'fuchsia',
  'purple',
  'yellow',
  'orange',
  'aliceblue',
  'antiquewhite',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'blanchedalmond',
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
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
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
  'limegreen',
  'linen',
  'magenta',
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
  'oldlace',
  'olivedrab',
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
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'whitesmoke',
  'yellowgreen',
  'rebeccapurple',
]);

// CSS system special names
const SPECIAL_COLOR_NAMES = new Set(['transparent', 'currentColor']);

/**
 * ColorRegistry provides controlled access to color name sets.
 */
export const ColorRegistry = {
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
};

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
