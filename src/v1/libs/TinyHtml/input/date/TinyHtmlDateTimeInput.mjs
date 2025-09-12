import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyDateTimeInput is a helper for managing <input type="datetime-local"> elements.
 */
class TinyHtmlDateTimeInput extends TinyHtmlInput {
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
  constructor({ value, min, max, name, placeholder, step, tags = [], mainClass = '' }) {
    super({ value, name, placeholder, type: 'datetime-local', tags, mainClass });
    if (typeof min !== 'number')
      throw new TypeError("TinyHtmlDateTimeInput: 'min' must be a number.");
    if (typeof max !== 'number')
      throw new TypeError("TinyHtmlDateTimeInput: 'max' must be a number.");
    if (typeof step !== 'number')
      throw new TypeError("TinyHtmlDateTimeInput: 'step' must be a number.");
    if (min) this.setAttr('min', min);
    if (max) this.setAttr('max', max);
    if (step !== undefined) this.setAttr('step', String(step));
  }
}

export default TinyHtmlDateTimeInput;
