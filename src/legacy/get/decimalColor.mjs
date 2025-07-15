import tinycolor from 'tinycolor2';

/**
 * Combines RGB values into a single decimal color.
 *
 * @private
 * @param {number} r - Red component (0–255).
 * @param {number} g - Green component (0–255).
 * @param {number} b - Blue component (0–255).
 * @returns {number} The combined decimal color value.
 */
function combineRGB(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

/**
 * Converts a CSS color string (hex, rgb, hsl, etc.) to a decimal color value.
 *
 * - If the input is a valid color string, it returns the decimal RGB representation (e.g. 16729344 for `#ff6600`).
 * - If invalid, returns `0`.
 * - If the input is already a number and valid, returns it unchanged.
 *
 * @param {string|number} color - The color input (e.g. "#ff6600", "rgb(255, 102, 0)", or a decimal number).
 * @param {function} [errCallback] - Optional callback to handle parsing errors.
 * @returns {number} The decimal representation of the color, or 0 if invalid.
 * @deprecated
 */
export default function decimalColor(color, errCallback) {
  let newColor;
  // Is String
  if (typeof color === 'string') {
    // Prepare Color
    try {
      // Get Color Manager
      newColor = tinycolor(color);

      // Validate
      if (newColor.isValid()) {
        // Convert
        newColor = newColor.toRgb();
        newColor = combineRGB(newColor.r, newColor.g, newColor.b);
      }

      // Nope
      else newColor = 0;
    } catch (err) {
      // Error
      if (typeof errCallback === 'function') errCallback(err);
      newColor = 0;
    }
  }

  // Fix Color Number
  if (typeof newColor !== 'number' || isNaN(newColor) || !isFinite(newColor) || newColor < 0)
    newColor = 0;

  // Return the Color Value
  return newColor;
}
