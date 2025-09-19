import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyPasswordInput is a helper for managing <input type="password"> elements.
 */
class TinyHtmlPasswordInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {number} [config.minLength]
   * @param {number} [config.maxLength]
   * @param {string} [config.name]
   * @param {string} [config.pattern] - Regex pattern.
   * @param {string} [config.autocomplete] - Autocomplete hint (e.g., "on", "off", "email").
   * @param {number} [config.size] - Size of text input.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    value,
    placeholder,
    autocomplete,
    pattern,
    minLength,
    size,
    readonly,
    required,
    maxLength,
    name,
    tags = [],
    mainClass = '',
  }) {
    super({ name, placeholder, value, type: 'password', tags, mainClass, readonly, required });
    if (minLength !== undefined && typeof minLength !== 'number')
      throw new TypeError("TinyHtmlPasswordInput: 'minLength' must be a number.");
    if (maxLength !== undefined && typeof maxLength !== 'number')
      throw new TypeError("TinyHtmlPasswordInput: 'maxLength' must be a number.");
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));

    // --- pattern ---
    if (pattern !== undefined) {
      if (typeof pattern !== 'string') throw new TypeError('"pattern" must be a string.');
      this.setAttr('pattern', pattern);
    }

    // --- autocomplete ---
    if (autocomplete !== undefined) {
      if (typeof autocomplete !== 'string') throw new TypeError('"autocomplete" must be a string.');
      this.setAttr('autocomplete', autocomplete);
    }

    // --- size ---
    if (size !== undefined) {
      if (!Number.isInteger(size) || size < 1)
        throw new TypeError('"size" must be a positive integer.');
      this.setAttr('size', String(size));
    }
  }
}

export default TinyHtmlPasswordInput;
