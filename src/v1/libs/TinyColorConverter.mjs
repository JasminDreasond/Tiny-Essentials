/**
 * Represents a color in RGBA format.
 * Each element must be a number between 0 and 255.
 * The fourth value represents the alpha (transparency) channel.
 *
 * @typedef {number[]} RgbaColor
 * @property {number} 0 - Red component (0–255)
 * @property {number} 1 - Green component (0–255)
 * @property {number} 2 - Blue component (0–255)
 * @property {number} 3 - Alpha component (0–255)
 */

/**
 * Represents a color in RGB format.
 * Each element must be a number between 0 and 255.
 *
 * @typedef {number[]} RgbColor
 * @property {number} 0 - Red component (0–255)
 * @property {number} 1 - Green component (0–255)
 * @property {number} 2 - Blue component (0–255)
 */

/**
 * Represents a color in HSLA format.
 * The fourth value represents the alpha (transparency) channel.
 *
 * @typedef {number[]} HslaColor
 * @property {number} 0 - Hue (0–360)
 * @property {number} 1 - Saturation (0–100)
 * @property {number} 2 - Lightness (0–100)
 * @property {number} 3 - Alpha component (0–255)
 */

/**
 * Represents a color in HSL format.
 *
 * @typedef {number[]} HslColor
 * @property {number} 0 - Hue (0–360)
 * @property {number} 1 - Saturation (0–100)
 * @property {number} 2 - Lightness (0–100)
 */

/**
 * Represents a hex color.
 *
 * @typedef {string} HexColor
 */

/**
 * A union type representing various accepted color formats.
 * Can be a hex color string, a numeric value, or an array-based RGB/RGBA representation.
 *
 * @typedef {HexColor | number | RgbColor | RgbaColor} ColorTypes
 */

/**
 * @typedef {Object} RgbResult
 * @property {number} r - Red component (0–255)
 * @property {number} g - Green component (0–255)
 * @property {number} b - Blue component (0–255)
 */

/**
 * @typedef {Object} HexResult
 * @property {string} hex - Hex color
 */

/**
 * @typedef {Object} HslResult
 * @property {number} h - Hue (0–360)
 * @property {number} s - Saturation (0–100)
 * @property {number} l - Lightness (0–100)
 */

/**
 * A class that allows converting colors between all common formats.
 */
class TinyColorConverter {
  /**
   * Generates a smooth gradient of colors based on sine wave patterns.
   *
   * @see {@link https://www.npmjs.com/package/rainbow-colors-array} Code Reference
   * @param {number} [len=24] - The number of colors to generate.
   * @param {'rgb'|'hex'|'hsl'} [type='rgb'] - The format of the colors returned: `'rgb'`, `'hex'`, or `'hsl'`.
   * @param {boolean} [pastel=false] - If true, generates pastel tones by adjusting the intensity and offset.
   * @returns {Array<RgbResult|HexResult|HslResult>} An array of color values in the selected format:
   */
  static _rca(len, type, pastel) {
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
          const [h, s, l] = this.rgbaToHsl(Math.round(red), Math.round(green), Math.round(blue));
          cvparr.push({ h, s, l });
          break;
      }
    }

    return cvparr;
  }

  /**
   * Generates a smooth gradient of colors based on sine wave patterns.
   *
   * @param {number} [len=24] - The number of colors to generate.
   * @param {boolean} [pastel=false] - If true, generates pastel tones by adjusting the intensity and offset.
   * @returns {RgbResult[]} An array of rgb color values.
   */
  static rcaRgb(len, pastel) {
    return /** @type {RgbResult[]} */ (TinyColorConverter._rca(len, 'rgb', pastel));
  }

  /**
   * Generates a smooth gradient of colors based on sine wave patterns.
   *
   * @param {number} [len=24] - The number of colors to generate.
   * @param {boolean} [pastel=false] - If true, generates pastel tones by adjusting the intensity and offset.
   * @returns {HslResult[]} An array of hsl color values.
   */
  static rcaHsl(len, pastel) {
    return /** @type {HslResult[]} */ (TinyColorConverter._rca(len, 'hsl', pastel));
  }

  /**
   * Generates a smooth gradient of colors based on sine wave patterns.
   *
   * @param {number} [len=24] - The number of colors to generate.
   * @param {boolean} [pastel=false] - If true, generates pastel tones by adjusting the intensity and offset.
   * @returns {HexResult[]} An array of hex color values.
   */
  static rcaHex(len, pastel) {
    return /** @type {HexResult[]} */ (TinyColorConverter._rca(len, 'hex', pastel));
  }

  /**
   * Generates a random color in hexadecimal format.
   *
   * @returns {HexColor} A hex color string (e.g. `#a3e5f2`).
   */
  static randomColor() {
    return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 6)}`;
  }

  /**
   * Parses input into RGBA array.
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

  // HSL Color

  /**
   * Converts hsl(a) string to RGBA array.
   * @param {string} hsl
   * @returns {RgbaColor}
   */
  static hslStringToRgbaArray(hsl) {
    const match = hsl.match(/[\d.]+/g)?.map(Number);
    if (!match || match.length < 3) return [0, 0, 0, 1];
    const [h, s, l, a = 1] = match;
    return this.hslToRgba(h, s, l, a);
  }

  /**
   * Converts HSL or HSLA to RGBA.
   * @param {number} h - Hue (0–360)
   * @param {number} s - Saturation (0–100)
   * @param {number} l - Lightness (0–100)
   * @param {number} [a=1] - Alpha (0–1)
   * @returns {RgbaColor}
   */
  static hslToRgba(h, s, l, a = 1) {
    s /= 100;
    l /= 100;
    /** @type {(n: number) => number} */
    const k = (n) => (n + h / 30) % 12;
    const a_ = s * Math.min(l, 1 - l);
    /** @type {(n: number) => number} */
    const f = (n) => l - a_ * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255), a];
  }

  // Hex Color

  /**
   * Converts hex to integer.
   * @param {HexColor} hex
   * @returns {number}
   */
  static hexToInt(hex) {
    return parseInt(hex.replace(/^#/, ''), 16);
  }

  /**
   * Converts hex string to RGBA array.
   * @param {HexColor} hex
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
   * @param {HexColor} hex
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
   * @returns {HexColor}
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
   * Converts RGBA to HSLA.
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} [a=1]
   * @returns {HslaColor}
   */
  static rgbaToHsla(r, g, b, a = 1) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;
    const d = max - min;

    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    return [Math.round(h), Math.round(s * 100), Math.round(l * 100), a];
  }

  /**
   * Converts RGBA to HSL.
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} [a=1]
   * @returns {HslColor}
   */
  static rgbaToHsl(r, g, b, a) {
    return this.rgbaToHsla(r, g, b, a).slice(0, 3);
  }

  /**
   * Converts rgb(a) string to RGBA array.
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
   * @returns {HexColor}
   */
  static intToHex(int) {
    return '#' + int.toString(16).padStart(6, '0');
  }

  /**
   * Converts an integer (0xRRGGBB) to RGBA.
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
   * Returns hex color.
   * @returns {HexColor}
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
