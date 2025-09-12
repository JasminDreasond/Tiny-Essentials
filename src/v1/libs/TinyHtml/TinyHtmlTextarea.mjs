import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyTextarea is a helper class for managing <textarea> elements.
 * It allows setting rows, cols, and initial text content.
 *
 * @example
 * const textarea = new TinyTextarea({ rows: 5, placeholder: 'Write here...' });
 * @extends TinyHtmlTemplate<HTMLTextAreaElement>
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
    super(document.createElement('textarea'), tags, mainClass);

    if (typeof value !== 'string') throw new TypeError('TinyTextarea: "value" must be a string.');
    this.setText(value);

    if (rows !== undefined) {
      if (!Number.isInteger(rows)) throw new TypeError('TinyTextarea: "rows" must be an integer.');
      this.setAttr('rows', rows);
    }

    if (cols !== undefined) {
      if (!Number.isInteger(cols)) throw new TypeError('TinyTextarea: "cols" must be an integer.');
      this.setAttr('cols', cols);
    }

    if (placeholder !== undefined) {
      if (typeof placeholder !== 'string')
        throw new TypeError('TinyTextarea: "placeholder" must be a string.');
      this.setAttr('placeholder', placeholder);
    }
  }
}

export default TinyHtmlTextarea;
