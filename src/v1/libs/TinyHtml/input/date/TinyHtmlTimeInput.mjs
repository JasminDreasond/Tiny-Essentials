import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyTimeInput is a helper for managing <input type="time"> elements.
 */
class TinyHtmlTimeInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string} [config.min]
   * @param {string} [config.max]
   * @param {string} [config.step]
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, min, max, step, name, placeholder, tags = [], mainClass = '' }) {
    super({ value, name, placeholder, type: 'time', tags, mainClass });
    if (min !== undefined && typeof min !== 'number') throw new TypeError("TinyHtmlTimeInput: 'min' must be a number.");
    if (max !== undefined && typeof max !== 'number') throw new TypeError("TinyHtmlTimeInput: 'max' must be a number.");
    if (step !== undefined && typeof step !== 'number') throw new TypeError("TinyHtmlTimeInput: 'step' must be a number.");
    if (min) this.setAttr('min', min);
    if (max) this.setAttr('max', max);
    if (step !== undefined) this.setAttr('step', String(step));
  }
}

export default TinyHtmlTimeInput;
