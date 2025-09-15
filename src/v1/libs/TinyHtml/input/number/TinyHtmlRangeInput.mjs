import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyRangeInput is a helper for managing <input type="range"> elements.
 */
class TinyHtmlRangeInput extends TinyHtmlInput {
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
  constructor({
    min = 0,
    max = 100,
    step = 1,
    value,
    name,
    placeholder,
    tags = [],
    mainClass = '',
  }) {
    super({ value, name, placeholder, type: 'range', tags, mainClass });
    if (min !== undefined && typeof min !== 'number')
      throw new TypeError("TinyHtmlRangeInput: 'min' must be a number.");
    if (max !== undefined && typeof max !== 'number')
      throw new TypeError("TinyHtmlRangeInput: 'max' must be a number.");
    if (step !== undefined && typeof step !== 'number')
      throw new TypeError("TinyHtmlRangeInput: 'step' must be a number.");
    this.setAttr('min', String(min));
    this.setAttr('max', String(max));
    this.setAttr('step', String(step));
  }

  /**
   * Gets the current numeric value of the range input.
   * @returns {number}
   */
  getValue() {
    return this.valNb();
  }
}

export default TinyHtmlRangeInput;
