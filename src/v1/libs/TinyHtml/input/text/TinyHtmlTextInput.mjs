import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyTextInput is a helper for managing <input type="text"> elements.
 */
class TinyHtmlTextInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {number} [config.minLength]
   * @param {number} [config.maxLength]
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, placeholder, minLength, maxLength, name, tags = [], mainClass = '' }) {
    super({ name, placeholder, value, type: 'text', tags, mainClass });
    if (minLength !== undefined && typeof minLength !== 'number')
      throw new TypeError("TinyHtmlTextInput: 'minLength' must be a number.");
    if (maxLength !== undefined && typeof maxLength !== 'number')
      throw new TypeError("TinyHtmlTextInput: 'maxLength' must be a number.");
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));
  }
}

export default TinyHtmlTextInput;
