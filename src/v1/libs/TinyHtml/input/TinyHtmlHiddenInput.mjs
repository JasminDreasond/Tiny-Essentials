import TinyHtmlInput from '../TinyHtmlInput.mjs';

/**
 * TinyHiddenInput is a helper for managing <input type="hidden"> elements.
 */
class TinyHtmlHiddenInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string} [config.name]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ name, value, tags = [], mainClass = '' }) {
    super({ type: 'hidden', name, tags, mainClass });
    if (value) this.setAttr('value', value);
  }
}

export default TinyHtmlHiddenInput;
