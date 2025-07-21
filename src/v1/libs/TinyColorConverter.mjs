/**
 * @typedef {Array<number>} RgbaColor
 */

/**
 * @typedef {Array<number>} RgbColor
 */

/**
 * @typedef {Array<number>} HslaColor
 */

/**
 * @typedef {Array<number>} HslColor
 */

/**
 * @typedef {string|number|RgbColor|RgbaColor|HslColor|HslaColor} ColorTypes
 */

/**
 * A class that allows converting colors between all common formats.
 */
class TinyColorConverter {
  /**
   * Generates a smooth gradient of colors based on sine wave patterns.
   *
   * @param {number} [len=24] - The number of colors to generate.
   * @param {'rgb'|'hex'|'hsl'} [type='rgb'] - The format of the colors returned: `'rgb'`, `'hex'`, or `'hsl'`.
   * @param {boolean} [pastel=false] - If true, generates pastel tones by adjusting the intensity and offset.
   * @returns {Array<Object>} An array of color values in the selected format:
   * - For `'rgb'`: `{ r: number, g: number, b: number }`
   * - For `'hex'`: `{ hex: string }`
   * - For `'hsl'`: `{ h: number, s: number, l: number }`
   */
  static rca(len, type, pastel) {
    let eq1 = 127;
    let eq2 = 128;
    if (len === undefined) {
      len = 24;
    }
    if (type === undefined) {
      type = 'rgb';
    }
    if (pastel === true) {
      eq1 = 55;
      eq2 = 200;
    }
    const frequency = (Math.PI * 2) / len;

    const cvparr = [];
    for (let i = 0; i < len; ++i) {
      const red = Math.sin(frequency * i + 2) * eq1 + eq2;
      const green = Math.sin(frequency * i + 0) * eq1 + eq2;
      const blue = Math.sin(frequency * i + 4) * eq1 + eq2;

      switch (type) {
        case 'hex':
          cvparr.push({ hex: this.rgbToHex(Math.round(red), Math.round(green), Math.round(blue)) });
          break;
        case 'rgb':
          cvparr.push({ r: red, g: green, b: blue });
          break;
        case 'hsl':
          cvparr.push(this.rgbToHsl(Math.round(red), Math.round(green), Math.round(blue)));
          break;
      }
    }

    return cvparr;
  }

  /**
   * Generates a random color in hexadecimal format.
   *
   * @returns {string} A hex color string (e.g. `#a3e5f2`).
   */
  static randomColor() {
    return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 6)}`;
  }

  /**
   * Parses input into RGBA array.
   * @private
   * @param {ColorTypes} input
   * @returns {RgbaColor}
   */
  static parseInput(input) {
    if (typeof input === 'string') {
      input = input.trim().toLowerCase();
      if (input.startsWith('#')) return this.hexToRgba(input);
      if (input.startsWith('rgb')) return this.rgbaStringToRgbaArray(input);
    }
    if (typeof input === 'number') return this.intToRgba(input);
    if (
      Array.isArray(input) &&
      (input.length === 3 || input.length === 4) &&
      input.every((item) => typeof item === 'number')
    ) {
      return [...input, 1].slice(0, 4);
    }

    throw new Error('Unsupported color format.');
  }

  // Hex Color

  /**
   * Converts hex to integer.
   * @param {string} hex
   * @returns {number}
   */
  static hexToInt(hex) {
    return parseInt(hex.replace(/^#/, ''), 16);
  }

  /**
   * Converts hex string to RGBA array.
   * @private
   * @param {string} hex
   * @returns {RgbaColor}
   */
  static hexToRgba(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3)
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    const intVal = parseInt(hex, 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    return [r, g, b, 1];
  }

  /**
   * Converts HEX to RGB.
   * @param {string} hex
   * @returns {RgbColor}
   */
  static hexToRgb(hex) {
    return this.hexToRgba(hex).slice(0, 3);
  }

  // RGBA Color

  /**
   * Converts RGB to HEX.
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {string}
   */
  static rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Converts RGB to integer.
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {number}
   */
  static rgbToInt(r, g, b) {
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Converts rgb(a) string to RGBA array.
   * @private
   * @param {string} rgb
   * @returns {RgbaColor}
   */
  static rgbaStringToRgbaArray(rgb) {
    const match = rgb.match(/[\d.]+/g)?.map(Number);
    if (!match) return [];
    return [...match, 1].slice(0, 4);
  }

  // Integer Color

  /**
   * Converts integer color to hex.
   * @param {number} int
   * @returns {string}
   */
  static intToHex(int) {
    return '#' + int.toString(16).padStart(6, '0');
  }

  /**
   * Converts an integer (0xRRGGBB) to RGBA.
   * @private
   * @param {number} value
   * @returns {RgbaColor}
   */
  static intToRgba(value) {
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return [r, g, b, 1];
  }

  // Class Script

  /** @type {ColorTypes} */
  #original = '#000000';
  /** @type {RgbaColor} */
  #rgba = [0, 0, 0, 0];

  #checkIsHsl;

  /**
   * @param {ColorTypes|null} [input=null] - Any valid color (hex, rgb string, rgba string, hsl(a), css name, array or int).
   * @param {boolean} [checkIsHsl=false]
   */
  constructor(input = null, checkIsHsl = false) {
    this.#checkIsHsl = checkIsHsl;
    if (typeof input !== 'undefined' && input !== null) this.setColor(input);
  }

  /**
   * @param {ColorTypes} input - Any valid color (hex, rgb string, rgba string, hsl(a), css name, array or int).
   */
  setColor(input) {
    this.#original = input;
    const isHsl =
      this.#checkIsHsl &&
      Array.isArray(input) &&
      input[0] <= 360 &&
      input[1] <= 100 &&
      input[2] <= 100;
    this.#rgba = TinyColorConverter.parseInput(input);
  }

  /**
   * Returns RGBA array.
   * @returns {RgbaColor}
   */
  toRgbaArray() {
    return [...this.#rgba];
  }

  /**
   * Returns RGB or RGBA string.
   * @returns {string}
   */
  toRgbString() {
    const [r, g, b] = this.#rgba;
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Returns RGB or RGBA string.
   * @returns {string}
   */
  toRgbaString() {
    const [r, g, b, a] = this.#rgba;
    return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
  }

  /**
   * Returns hex string.
   * @returns {string}
   */
  toHex() {
    const [r, g, b] = this.#rgba;
    return TinyColorConverter.rgbToHex(r, g, b);
  }

  /**
   * Returns color as integer.
   * @returns {number}
   */
  toInt() {
    const [r, g, b] = this.#rgba;
    return TinyColorConverter.rgbToInt(r, g, b);
  }

  /**
   * Returns the original input.
   * @returns {ColorTypes}
   */
  getOriginal() {
    return this.#original;
  }
}

export default TinyColorConverter;
