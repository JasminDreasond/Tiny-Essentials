class TinyColorValidator {
  // Utility regex patterns
  static #HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  static #HEXA_REGEX = /^#([A-Fa-f0-9]{8})$/;

  // Alpha 0-1
  static #ALPHA = `(0|1|0?\\.\\d+)`;

  // Matches integers from 0 to 255
  static #NUM_0_255 = `(0|[1-9]\\d?|1\\d{2}|2[0-4]\\d|25[0-5])`;

  // Numbers 0-360
  static #NUM_0_360 = `(0|[1-9]\\d?|[1-2]\\d{2}|3[0-5]\\d|360)`;
  // Numbers 0-100
  static #NUM_0_100 = `(0|[1-9]?\\d|100)`;

  // RGB
  static #RGB_REGEX = new RegExp(
    `^rgb\\(\\s*${TinyColorValidator.#NUM_0_255}\\s*,\\s*${TinyColorValidator.#NUM_0_255}\\s*,\\s*${TinyColorValidator.#NUM_0_255}\\s*\\)$`,
  );
  static #RGBA_REGEX = new RegExp(
    `^rgba\\(\\s*${TinyColorValidator.#NUM_0_255}\\s*,\\s*${TinyColorValidator.#NUM_0_255}\\s*,\\s*${TinyColorValidator.#NUM_0_255}\\s*,\\s*${TinyColorValidator.#ALPHA}\\s*\\)$`,
  );

  // HSL
  static #HSL_REGEX = new RegExp(
    `^hsl\\(\\s*${TinyColorValidator.#NUM_0_360}\\s*,\\s*${TinyColorValidator.#NUM_0_100}%\\s*,\\s*${TinyColorValidator.#NUM_0_100}%\\s*\\)$`,
  );
  static #HSLA_REGEX = new RegExp(
    `^hsla\\(\\s*${TinyColorValidator.#NUM_0_360}\\s*,\\s*${TinyColorValidator.#NUM_0_100}%\\s*,\\s*${TinyColorValidator.#NUM_0_100}%\\s*,\\s*${TinyColorValidator.#ALPHA}\\s*\\)$`,
  );

  // HWB

  static #HWB_REGEX = new RegExp(
    `^hwb\\(\\s*${TinyColorValidator.#NUM_0_360}(deg|grad|rad|turn)?\\s*${TinyColorValidator.#NUM_0_100}%\\s*${TinyColorValidator.#NUM_0_100}%\\s*\\)$`,
  );

  // LAB

  static #LAB_AB = `(-?\\d+)`;

  static #LAB_REGEX = new RegExp(
    `^lab\\(\\s*${TinyColorValidator.#NUM_0_100}%?\\s*${TinyColorValidator.#LAB_AB}%?\\s*${TinyColorValidator.#LAB_AB}%?\\s*\\)$`,
  );

  // LCH

  static #LCH_REGEX = new RegExp(
    `^lch\\(\\s*${TinyColorValidator.#NUM_0_100}%?\\s*${TinyColorValidator.#NUM_0_100}%?\\s*${TinyColorValidator.#NUM_0_360}(deg|grad|rad|turn)?\\s*\\)$`,
  );

  // CSS Level 4 color names
  static #HTML_COLOR_NAMES = new Set([
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
  static #SPECIAL_COLOR_NAMES = new Set(['transparent', 'currentColor']);

  // --- HTML Color Names ---
  /**
   * Returns all HTML color names as an array.
   * @returns {string[]}
   */
  static getHTMLColorNames() {
    return Array.from(TinyColorValidator.#HTML_COLOR_NAMES);
  }

  /**
   * Adds a new HTML color name.
   * @param {string} name
   * @returns {boolean} True if added, false if it already existed.
   */
  static addHTMLColorName(name) {
    const before = TinyColorValidator.#HTML_COLOR_NAMES.size;
    TinyColorValidator.#HTML_COLOR_NAMES.add(name.toLowerCase());
    return TinyColorValidator.#HTML_COLOR_NAMES.size > before;
  }

  /**
   * Removes an HTML color name.
   * @param {string} name
   * @returns {boolean} True if removed, false if not found.
   */
  static removeHTMLColorName(name) {
    return TinyColorValidator.#HTML_COLOR_NAMES.delete(name.toLowerCase());
  }

  /**
   * Checks if an HTML color name exists.
   * @param {string} name
   * @returns {boolean}
   */
  static hasHTMLColorName(name) {
    return TinyColorValidator.#HTML_COLOR_NAMES.has(name.toLowerCase());
  }

  // --- Special Color Names ---
  /**
   * Returns all special color names as an array.
   * @returns {string[]}
   */
  static getSpecialColorNames() {
    return Array.from(TinyColorValidator.#SPECIAL_COLOR_NAMES);
  }

  /**
   * Adds a new special color name.
   * @param {string} name
   * @returns {boolean} True if added, false if it already existed.
   */
  static addSpecialColorName(name) {
    const before = TinyColorValidator.#SPECIAL_COLOR_NAMES.size;
    TinyColorValidator.#SPECIAL_COLOR_NAMES.add(name);
    return TinyColorValidator.#SPECIAL_COLOR_NAMES.size > before;
  }

  /**
   * Removes a special color name.
   * @param {string} name
   * @returns {boolean} True if removed, false if not found.
   */
  static removeSpecialColorName(name) {
    return TinyColorValidator.#SPECIAL_COLOR_NAMES.delete(name);
  }

  /**
   * Checks if a special color name exists.
   * @param {string} name
   * @returns {boolean}
   */
  static hasSpecialColorName(name) {
    return TinyColorValidator.#SPECIAL_COLOR_NAMES.has(name);
  }

  // Validators

  /**
   * Validates if a string is a valid HEX color (#RGB, #RRGGBB).
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid HEX color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorHex(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorHex: input must be a string.');
    return TinyColorValidator.#HEX_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid HEX color (#RRGGBBAA).
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid HEXA color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorHexa(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorHexa: input must be a string.');
    return TinyColorValidator.#HEXA_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid RGB color.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid RGB color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorRgb(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorRgb: input must be a string.');
    return TinyColorValidator.#RGB_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid RGBA color.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid RGBA color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorRgba(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorRgba: input must be a string.');
    return TinyColorValidator.#RGBA_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid HSL color.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid HSL color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorHsl(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorHsl: input must be a string.');
    return TinyColorValidator.#HSL_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid HSLA color.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid HSLA color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorHsla(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorHsla: input must be a string.');
    return TinyColorValidator.#HSLA_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid HWB color.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid HWB color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorHwb(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorHwb: input must be a string.');
    return TinyColorValidator.#HWB_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid CIELAB color.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid Lab color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorLab(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorLab: input must be a string.');
    return TinyColorValidator.#LAB_REGEX.test(input.trim());
  }

  /**
   * Validates if a string is a valid LCH color.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid LCH color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorLch(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorLch: input must be a string.');
    return TinyColorValidator.#LCH_REGEX.test(input.trim());
  }

  /**
   * Validates if a string matches a standard HTML color name.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid HTML color name.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorName(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorName: input must be a string.');
    return TinyColorValidator.#HTML_COLOR_NAMES.has(input.trim().toLowerCase());
  }

  /**
   * Validates if a string matches a special CSS color keyword.
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a special color keyword.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColorSpecialName(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColorSpecialName: input must be a string.');
    return TinyColorValidator.#SPECIAL_COLOR_NAMES.has(input.trim());
  }

  /**
   * Validates if a string is any valid CSS color (HEX, RGB, HSL, HWB, Lab, LCH, name, or special name).
   * @param {string} input - The input string to validate.
   * @returns {boolean} True if the input is a valid CSS color.
   * @throws {TypeError} If input is not a string.
   */
  static validateHTMLColor(input) {
    if (typeof input !== 'string')
      throw new TypeError('validateHTMLColor: input must be a string.');
    return (
      TinyColorValidator.validateHTMLColorHex(input) ||
      TinyColorValidator.validateHTMLColorHexa(input) ||
      TinyColorValidator.validateHTMLColorRgb(input) ||
      TinyColorValidator.validateHTMLColorRgba(input) ||
      TinyColorValidator.validateHTMLColorHsl(input) ||
      TinyColorValidator.validateHTMLColorHsla(input) ||
      TinyColorValidator.validateHTMLColorHwb(input) ||
      TinyColorValidator.validateHTMLColorLab(input) ||
      TinyColorValidator.validateHTMLColorLch(input) ||
      TinyColorValidator.validateHTMLColorName(input) ||
      TinyColorValidator.validateHTMLColorSpecialName(input)
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
  static parseHtmlHex(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlHex: input must be a string.');
    const result = new RegExp(TinyColorValidator.#HEX_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlHexa(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlHexa: input must be a string.');
    const result = new RegExp(TinyColorValidator.#HEXA_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlRgb(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlRgb: input must be a string.');
    const result = new RegExp(TinyColorValidator.#RGB_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlRgba(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlRgba: input must be a string.');
    const result = new RegExp(TinyColorValidator.#RGBA_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlHsl(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlHsl: input must be a string.');
    const result = new RegExp(TinyColorValidator.#HSL_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlHsla(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlHsla: input must be a string.');
    const result = new RegExp(TinyColorValidator.#HSLA_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlHwb(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlHwb: input must be a string.');
    const result = new RegExp(TinyColorValidator.#HWB_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlLab(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlLab: input must be a string.');
    const result = new RegExp(TinyColorValidator.#LAB_REGEX, 'gm').exec(input.trim());
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
  static parseHtmlLch(input) {
    if (typeof input !== 'string') throw new TypeError('parseHtmlLch: input must be a string.');
    const result = new RegExp(TinyColorValidator.#LCH_REGEX, 'gm').exec(input.trim());
    if (!result) return null;
    return [
      parseFloat(result[1]),
      parseFloat(result[2]),
      parseFloat(result[3]),
      // @ts-ignore
      result[4] ?? null,
    ];
  }
}

export default TinyColorValidator;
