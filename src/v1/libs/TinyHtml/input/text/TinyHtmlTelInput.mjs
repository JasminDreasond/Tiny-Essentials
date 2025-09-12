import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyTelInput is a helper for managing <input type="tel"> elements.
 */
class TinyHtmlTelInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {number} [config.minLength]
   * @param {number} [config.maxLength]
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string} [config.pattern]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    value,
    placeholder,
    pattern,
    minLength,
    maxLength,
    name,
    tags = [],
    mainClass = '',
  }) {
    super({ name, placeholder, value, type: 'tel', tags, mainClass });
    if (pattern) this.setAttr('pattern', pattern);
    if (minLength !== undefined && typeof minLength !== 'number')
      throw new TypeError("TinyHtmlTelInput: 'minLength' must be a number.");
    if (maxLength !== undefined && typeof maxLength !== 'number')
      throw new TypeError("TinyHtmlTelInput: 'maxLength' must be a number.");
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));
  }
}

export default TinyHtmlTelInput;
