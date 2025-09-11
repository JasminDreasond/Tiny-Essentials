import TinyInput from '../../TinyInput.mjs';

/**
 * TinyTelInput is a helper for managing <input type="tel"> elements.
 */
class TinyTelInput extends TinyInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {number} [config.minLength]
   * @param {number} [config.maxLength]
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
    tags = [],
    mainClass = '',
  } = {}) {
    super({ type: 'tel', tags, mainClass });
    if (value) this.setAttr('value', value);
    if (placeholder) this.setAttr('placeholder', placeholder);
    if (pattern) this.setAttr('pattern', pattern);
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));
  }
}

export default TinyTelInput;
