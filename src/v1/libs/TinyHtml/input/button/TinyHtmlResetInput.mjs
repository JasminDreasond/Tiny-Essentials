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
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, tags = [], readonly, required, name, placeholder, mainClass = '' }) {
    super({ name, placeholder, type: 'reset', tags, mainClass, readonly, required });

    if (value !== undefined && typeof value !== 'string' && typeof value !== 'number')
      throw new TypeError('TinyHtmlInput: "value" must be a string or number.');
    if (value !== undefined) this.setAttr('value', value);
  }
}

export default TinyHtmlResetInput;
