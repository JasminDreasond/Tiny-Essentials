import TinyHtmlInput from '../TinyHtmlInput.mjs';

/**
 * TinyColorInput is a helper for managing <input type="color"> elements.
 */
class TinyHtmlColorInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value="#000000"]
   * @param {string} [config.placeholder]
   * @param {string} [config.name]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value = '#000000', name = '', placeholder, tags = [], mainClass = '' }) {
    super({ type: 'color', value, name, placeholder, tags, mainClass });
  }
}

export default TinyHtmlColorInput;
