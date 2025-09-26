import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyHtmlTimeInput is a helper class for managing `<input type="time">` elements.
 * It provides validated getters and setters for all relevant attributes such as
 * value, min, max, step, autocomplete, and more.
 *
 * @example
 * const timeInput = new TinyHtmlTimeInput({
 *   value: "12:30",
 *   min: "08:00",
 *   max: "18:00",
 *   step: 60,
 *   required: true,
 *   name: "appointmentTime"
 * });
 */
class TinyHtmlTimeInput extends TinyHtmlInput {
  /**
   * Creates a new TinyHtmlTimeInput instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.value] - Initial time value in "HH:MM" format.
   * @param {string} [config.min] - Minimum allowed time (e.g., "08:00").
   * @param {string} [config.max] - Maximum allowed time (e.g., "18:00").
   * @param {number|string} [config.step] - Granularity in seconds (or "any").
   * @param {string} [config.name] - The name of the control.
   * @param {string} [config.placeholder] - Placeholder text.
   * @param {string} [config.autocomplete] - Autocomplete hint ("on", "off", or token list).
   * @param {string} [config.list] - The id of a `<datalist>`.
   * @param {boolean} [config.readonly=false] - Whether the input is read-only.
   * @param {boolean} [config.required=false] - Whether the input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=''] - Main CSS class.
   * @throws {TypeError} If any attribute is of the wrong type.
   */
  constructor({
    value,
    list,
    min,
    max,
    step,
    name,
    readonly = false,
    required = false,
    placeholder,
    autocomplete,
    tags = [],
    mainClass = '',
  } = {}) {
    super({ name, placeholder, type: 'time', tags, mainClass });

    // --- attributes initialization ---
    if (value !== undefined) this.value = value;
    if (min !== undefined) this.min = min;
    if (max !== undefined) this.max = max;
    if (step !== undefined) this.step = step;
    if (list !== undefined) this.list = list;
    if (autocomplete !== undefined) this.autocomplete = autocomplete;

    // --- boolean props ---
    this.readonly = readonly;
    this.required = required;
  }

  /** @param {string|Date|number} value */
  set value(value) {
    if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date))
      throw new TypeError('TinyHtmlTimeInput: "value" must be a string or date.');
    if (value instanceof Date) {
      const hours = String(value.getHours()).padStart(2, '0');
      const minutes = String(value.getMinutes()).padStart(2, '0');

      const formatted = `${hours}:${minutes}`;
      this.setVal(formatted);
      return;
    }
    this.setVal(value);
  }

  /** @returns {string|null} */
  get value() {
    return this.attrString('value');
  }

  /** @param {string} min */
  set min(min) {
    if (typeof min !== 'string') throw new TypeError('TinyHtmlTimeInput: "min" must be a string.');
    this.setAttr('min', min);
  }

  /** @returns {string|null} */
  get min() {
    return this.attrString('min');
  }

  /** @param {string} max */
  set max(max) {
    if (typeof max !== 'string') throw new TypeError('TinyHtmlTimeInput: "max" must be a string.');
    this.setAttr('max', max);
  }

  /** @returns {string|null} */
  get max() {
    return this.attrString('max');
  }

  /** @param {number|string} step */
  set step(step) {
    if (typeof step === 'number') {
      if (!Number.isFinite(step) || step <= 0)
        throw new TypeError('TinyHtmlTimeInput: "step" must be a positive number or "any".');
      this.setAttr('step', String(step));
      return;
    }
    if (step !== 'any') throw new TypeError('TinyHtmlTimeInput: "step" must be a number or "any".');
    this.setAttr('step', step);
  }

  /** @returns {string|null} */
  get step() {
    return this.attrString('step');
  }

  /** @param {string} list */
  set list(list) {
    if (typeof list !== 'string')
      throw new TypeError('TinyHtmlTimeInput: "list" must be a string (datalist id).');
    this.setAttr('list', list);
  }

  /** @returns {string|null} */
  get list() {
    return this.attrString('list');
  }

  /** @param {string} autocomplete */
  set autocomplete(autocomplete) {
    if (typeof autocomplete !== 'string')
      throw new TypeError('TinyHtmlTimeInput: "autocomplete" must be a string.');
    this.setAttr('autocomplete', autocomplete);
  }

  /** @returns {string|null} */
  get autocomplete() {
    return this.attrString('autocomplete');
  }
}

export default TinyHtmlTimeInput;
