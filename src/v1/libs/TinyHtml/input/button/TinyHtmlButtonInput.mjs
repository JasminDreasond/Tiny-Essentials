import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyButtonInput is a helper for managing <input type="button"> elements.
 */
class TinyHtmlButtonInput extends TinyHtmlInput {
  /**
   * Creates a new TinyButtonInput instance.
   * @param {Object} config
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string} [config.value='Button'] - The text displayed on the button.
   * @param {string|string[]|Set<string>} [config.tags=[]] - CSS classes to apply.
   * @param {string} [config.mainClass=''] - Main CSS class applied.
   */
  constructor({ value = 'Button', tags = [], placeholder, name, mainClass = '' }) {
    super({ value, name, placeholder, type: 'button', tags, mainClass });
  }
}

export default TinyHtmlButtonInput;
