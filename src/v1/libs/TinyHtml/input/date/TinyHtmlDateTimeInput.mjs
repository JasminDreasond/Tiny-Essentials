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
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, min, max, step, tags = [], mainClass = '' } = {}) {
    super({ type: 'datetime-local', tags, mainClass });
    if (value) this.setAttr('value', value);
    if (min) this.setAttr('min', min);
    if (max) this.setAttr('max', max);
    if (step !== undefined) this.setAttr('step', String(step));
  }
}

export default TinyHtmlDateTimeInput;
