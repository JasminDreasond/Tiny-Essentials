import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyPasswordInput is a helper for managing <input type="password"> elements.
 */
class TinyHtmlPasswordInput extends TinyHtmlInput {
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
    super({ type: 'password', tags, mainClass });
    if (value) this.setAttr('value', value);
    if (placeholder) this.setAttr('placeholder', placeholder);
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));
  }
}

export default TinyHtmlPasswordInput;
