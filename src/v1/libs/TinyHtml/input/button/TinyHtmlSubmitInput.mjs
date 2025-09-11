import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinySubmitInput is a helper for managing <input type="submit"> elements.
 */
class TinyHtmlSubmitInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value = 'Submit', tags = [], mainClass = '' }) {
    super({ type: 'submit', tags, mainClass });
    this.setAttr('value', value);
  }
}

export default TinyHtmlSubmitInput;
