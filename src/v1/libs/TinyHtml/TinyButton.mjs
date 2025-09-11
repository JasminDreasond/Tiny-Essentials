import TinyHtml from '../TinyHtml.mjs';
import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyButton is a lightweight helper class for managing <button> elements
 * with class-based styling, a main class, and label handling.
 * It extends TinyHtml to provide direct DOM element manipulation.
 */
class TinyButton extends TinyHtmlTemplate {
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
   * @param {string|Element|TinyHtml<any>} label
   * @returns {this}
   */
  setLabel(label, allowHtml = false) {
    if (typeof label === 'string') {
      if (!allowHtml) this.setText(label);
      else this.setHtml(label);
    } else if (allowHtml) {
      this.empty().append(label);
    } else throw new Error('');
    return this;
  }
}

export default TinyButton;
