import tinycolor from 'tinycolor2';

function combineRGB(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

export default function decimalColor(color, errCallback) {
  // Is String
  if (typeof color === 'string') {
    // Prepare Color
    try {
      // Get Color Manager
      color = tinycolor(color);

      // Validate
      if (color.isValid()) {
        // Convert
        color = color.toRgb();
        color = combineRGB(color.r, color.g, color.b);
      }

      // Nope
      else color = 0;
    } catch (err) {
      // Error
      // Debug
      if (typeof errCallback === 'function') errCallback(err);

      // Result
      color = 0;
    }
  }

  // Fix Color Number
  if (typeof color !== 'number' || isNaN(color) || !isFinite(color) < 0) color = 0;

  // Return the Color Value
  return color;
}
