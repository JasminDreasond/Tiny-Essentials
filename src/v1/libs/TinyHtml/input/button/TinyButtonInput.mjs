import TinyInput from '../../TinyInput.mjs';

/**
 * TinyButtonInput is a helper for managing <input type="button"> elements.
 */
class TinyButtonInput extends TinyInput {
  /**
   * Creates a new TinyButtonInput instance.
   * @param {Object} config
   * @param {string} [config.value='Button'] - The text displayed on the button.
   * @param {string|string[]|Set<string>} [config.tags=[]] - CSS classes to apply.
   * @param {string} [config.mainClass=''] - Main CSS class applied.
   */
  constructor({ value = 'Button', tags = [], mainClass = '' } = {}) {
    super({ type: 'button', tags, mainClass });
    this.setAttr('value', value);
  }
}

export default TinyButtonInput;
