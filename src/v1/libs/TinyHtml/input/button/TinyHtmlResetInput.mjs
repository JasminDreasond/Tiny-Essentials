import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyResetInput is a helper for managing <input type="reset"> elements.
 */
class TinyHtmlResetInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value = 'Reset', tags = [], name, placeholder, mainClass = '' }) {
    super({ value, name, placeholder, type: 'reset', tags, mainClass });
  }
}

export default TinyHtmlResetInput;
