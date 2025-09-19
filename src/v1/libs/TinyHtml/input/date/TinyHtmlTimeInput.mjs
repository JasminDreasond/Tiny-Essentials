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
   * @param {string} [config.autocomplete] - Autocomplete hint (e.g., "on", "off", "email").
   * @param {string} [config.list] - ID of a <datalist>.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    value,
    list,
    min,
    max,
    step,
    name,
    readonly,
    required,
    placeholder,
    autocomplete,
    tags = [],
    mainClass = '',
  }) {
    super({ value, name, placeholder, type: 'time', tags, mainClass, readonly, required });
    if (min !== undefined && typeof min !== 'number')
      throw new TypeError("TinyHtmlTimeInput: 'min' must be a number.");
    if (max !== undefined && typeof max !== 'number')
      throw new TypeError("TinyHtmlTimeInput: 'max' must be a number.");
    if (step !== undefined && typeof step !== 'number')
      throw new TypeError("TinyHtmlTimeInput: 'step' must be a number.");
    if (min !== undefined) this.setAttr('min', String(min));
    if (max !== undefined) this.setAttr('max', String(max));
    if (step !== undefined) this.setAttr('step', String(step));

    // --- list ---
    if (list !== undefined) {
      if (typeof list !== 'string') throw new TypeError('"list" must be a string (datalist id).');
      this.setAttr('list', list);
    }

    // --- autocomplete ---
    if (autocomplete !== undefined) {
      if (typeof autocomplete !== 'string') throw new TypeError('"autocomplete" must be a string.');
      this.setAttr('autocomplete', autocomplete);
    }
  }
}

export default TinyHtmlTimeInput;
