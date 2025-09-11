import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyTextarea is a helper class for managing <textarea> elements.
 * It allows setting rows, cols, and initial text content.
 *
 * @example
 * const textarea = new TinyTextarea({ rows: 5, placeholder: 'Write here...' });
 */
class TinyHtmlTextarea extends TinyHtmlTemplate {
  /**
   * Creates a new TinyTextarea instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.value=""] - Initial text inside the textarea.
   * @param {number} [config.rows] - Number of visible text lines.
   * @param {number} [config.cols] - Number of character columns.
   * @param {string} [config.placeholder] - Placeholder text.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ value = '', rows, cols, placeholder, tags = [], mainClass = '' } = {}) {
    super('textarea', tags, mainClass);

    if (value) this.setText(value);
    if (rows) this.setAttr('rows', rows);
    if (cols) this.setAttr('cols', cols);
    if (placeholder) this.setAttr('placeholder', placeholder);
  }
}

export default TinyHtmlTextarea;
