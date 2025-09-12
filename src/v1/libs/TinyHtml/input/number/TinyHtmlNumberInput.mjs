import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyNumberInput is a helper for managing <input type="number"> elements.
 */
class TinyHtmlNumberInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {number} [config.min=0]
   * @param {number} [config.max=100]
   * @param {number} [config.step=1]
   * @param {number} [config.value]
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, min, max, step, name, placeholder, tags = [], mainClass = '' }) {
    super({ value, name, placeholder, type: 'number', tags, mainClass });
    if (min !== undefined && typeof min !== 'number')
      throw new TypeError("TinyHtmlNumberInput: 'min' must be a number.");
    if (max !== undefined && typeof max !== 'number')
      throw new TypeError("TinyHtmlNumberInput: 'max' must be a number.");
    if (step !== undefined && typeof step !== 'number')
      throw new TypeError("TinyHtmlNumberInput: 'step' must be a number.");
    if (min !== undefined) this.setAttr('min', String(min));
    if (max !== undefined) this.setAttr('max', String(max));
    if (step !== undefined) this.setAttr('step', String(step));
  }

  /**
   * Gets the current numeric value.
   * @returns {number}
   */
  getValue() {
    return this.valNb();
  }
}

export default TinyHtmlNumberInput;
