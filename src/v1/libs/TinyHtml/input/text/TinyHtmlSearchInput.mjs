import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinySearchInput is a helper for managing <input type="search"> elements.
 */
class TinyHtmlSearchInput extends TinyHtmlInput {
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
    super({ value, name, placeholder, type: 'search', tags, mainClass });
    if (minLength !== undefined && typeof minLength !== 'number')
      throw new TypeError("TinyHtmlSearchInput: 'minLength' must be a number.");
    if (maxLength !== undefined && typeof maxLength !== 'number')
      throw new TypeError("TinyHtmlSearchInput: 'maxLength' must be a number.");
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));
  }
}

export default TinyHtmlSearchInput;
