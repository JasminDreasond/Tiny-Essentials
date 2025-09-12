import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyMonthInput is a helper for managing <input type="month"> elements.
 */
class TinyHtmlMonthInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string} [config.min]
   * @param {string} [config.max]
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, min, max, name, placeholder, tags = [], mainClass = '' }) {
    super({ value, name, placeholder, type: 'month', tags, mainClass });
    if (typeof min !== 'number') throw new TypeError("TinyHtmlMonthInput: 'min' must be a number.");
    if (typeof max !== 'number') throw new TypeError("TinyHtmlMonthInput: 'max' must be a number.");
    if (min) this.setAttr('min', min);
    if (max) this.setAttr('max', max);
  }
}

export default TinyHtmlMonthInput;
