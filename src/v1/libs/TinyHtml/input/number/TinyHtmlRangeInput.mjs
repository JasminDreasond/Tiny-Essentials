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
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ min = 0, max = 100, step = 1, value, tags = [], mainClass = '' }) {
    super({ type: 'range', tags, mainClass });

    this.setAttr('min', String(min));
    this.setAttr('max', String(max));
    this.setAttr('step', String(step));
    if (value !== undefined) this.setAttr('value', String(value));
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
