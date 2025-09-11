import TinyHtml from '../TinyHtml.mjs';
import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyButton is a lightweight helper class for managing <button> elements
 * with class-based styling, a main class, and label handling.
 * It extends TinyHtml to provide direct DOM element manipulation.
 */
class TinyHtmlButton extends TinyHtmlTemplate {
  /**
   * Creates a new TinyButton instance.
   * @param {Object} config - Configuration object for the button.
   * @param {string} config.label - The text to display inside the button.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes to apply.
   * @param {string} [config.type="button"] - The button type (e.g., "button", "submit", "reset").
   * @param {string} [config.mainClass='']
   */
  constructor({ label, tags = [], type = 'button', mainClass = '' }) {
    super('button', tags, mainClass);
    this.setAttr('type', type);
    this.setText(label);
  }

  /**
   * Updates the button label with text, HTML, or an element.
   *
   * @param {string|Element|TinyHtml<any>} label - The new label to set.
   * - If a string is provided:
   *   - By default, the string is set as plain text.
   *   - If `allowHtml` is true, the string is interpreted as raw HTML.
   * - If an Element or TinyHtml is provided:
   *   - It is appended as a child, but only if `allowHtml` is true.
   *   - Otherwise, an error is thrown.
   * @param {boolean} [allowHtml=false] - Whether to allow raw HTML or DOM elements instead of plain text.
   * @returns {this} Returns the current instance for chaining.
   * @throws {TypeError} If `label` is not a string, Element, or TinyHtml.
   * @throws {Error} If an Element/TinyHtml is passed but `allowHtml` is false.
   *
   * @example
   * btn.setLabel("Save"); // plain text
   * btn.setLabel("<b>Save</b>", true); // raw HTML
   * btn.setLabel(document.createElement("span"), true); // DOM element
   */
  setLabel(label, allowHtml = false) {
    if (typeof label === 'string') {
      if (!allowHtml) this.setText(label);
      else this.setHtml(label);
    } else if (label instanceof Element || label instanceof TinyHtml) {
      if (!allowHtml)
        throw new Error('setLabel: Passing an Element/TinyHtml requires allowHtml=true.');
      this.empty().append(label);
    } else
      throw new TypeError("setLabel: 'label' must be a string, Element, or TinyHtml instance.");
    return this;
  }
}

export default TinyHtmlButton;
