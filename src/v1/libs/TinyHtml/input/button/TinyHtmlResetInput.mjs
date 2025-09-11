import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyResetInput is a helper for managing <input type="reset"> elements.
 */
class TinyHtmlResetInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value = 'Reset', tags = [], mainClass = '' } = {}) {
    super({ type: 'reset', tags, mainClass });
    this.setAttr('value', value);
  }
}

export default TinyHtmlResetInput;
