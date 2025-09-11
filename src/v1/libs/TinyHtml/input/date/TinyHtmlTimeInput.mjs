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
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value, min, max, step, tags = [], mainClass = '' }) {
    super({ type: 'time', tags, mainClass });
    if (value) this.setAttr('value', value);
    if (min) this.setAttr('min', min);
    if (max) this.setAttr('max', max);
    if (step !== undefined) this.setAttr('step', String(step));
  }
}

export default TinyHtmlTimeInput;
