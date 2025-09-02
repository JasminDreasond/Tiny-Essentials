/**
 * Parse inline styles into an object.
 * @param {string} styleText
 * @returns {Record<string,string>}
 */
export function parseStyle(styleText) {
  /** @type {Record<string,string>}} */
  const styles = {};
  styleText.split(';').forEach((rule) => {
    const [prop, value] = rule.split(':').map((s) => s && s.trim());
    if (prop && value) {
      styles[prop] = value;
    }
  });
  return styles;
}
