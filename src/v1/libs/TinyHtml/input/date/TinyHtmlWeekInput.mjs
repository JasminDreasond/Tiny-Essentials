import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyWeekInput is a helper for managing <input type="week"> elements.
 */
class TinyHtmlWeekInput extends TinyHtmlInput {
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
    super({ value, name, placeholder, type: 'week', tags, mainClass });
    if (min !== undefined && typeof min !== 'number')
      throw new TypeError("TinyHtmlWeekInput: 'min' must be a number.");
    if (max !== undefined && typeof max !== 'number')
      throw new TypeError("TinyHtmlWeekInput: 'max' must be a number.");
    if (min) this.setAttr('min', min);
    if (max) this.setAttr('max', max);
  }
}

export default TinyHtmlWeekInput;
