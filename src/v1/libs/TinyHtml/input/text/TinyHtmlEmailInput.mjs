import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyEmailInput is a helper for managing <input type="email"> elements.
 */
class TinyHtmlEmailInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {number} [config.minLength]
   * @param {number} [config.maxLength]
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, placeholder, minLength, maxLength, tags = [], mainClass = '' }) {
    super({ value, placeholder, type: 'email', tags, mainClass });
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));
  }
}

export default TinyHtmlEmailInput;
