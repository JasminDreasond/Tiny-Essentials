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
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, min, max, step, tags = [], mainClass = '' }) {
    super({ value, type: 'number', tags, mainClass });
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
