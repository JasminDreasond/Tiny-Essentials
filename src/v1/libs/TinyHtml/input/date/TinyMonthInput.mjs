import TinyInput from '../../TinyInput.mjs';

/**
 * TinyMonthInput is a helper for managing <input type="month"> elements.
 */
class TinyMonthInput extends TinyInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string} [config.min]
   * @param {string} [config.max]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, min, max, tags = [], mainClass = '' } = {}) {
    super({ type: 'month', tags, mainClass });
    if (value) this.setAttr('value', value);
    if (min) this.setAttr('min', min);
    if (max) this.setAttr('max', max);
  }
}

export default TinyMonthInput;
