import TinyHtmlInput from '../TinyHtmlInput.mjs';

/**
 * TinyColorInput is a helper for managing <input type="color"> elements.
 */
class TinyHtmlColorInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value="#000000"]
   * @param {number|string} [config.alpha]
   * @param {string} [config.placeholder]
   * @param {string} [config.name]
   * @param {string} [config.autocomplete] - Autocomplete hint (e.g., "on", "off", "email").
   * @param {string} [config.list] - ID of a <datalist>.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    list,
    value = '#000000',
    name = '',
    autocomplete,
    alpha,
    readonly,
    required,
    placeholder,
    tags = [],
    mainClass = '',
  }) {
    super({ type: 'color', value, name, placeholder, tags, mainClass, readonly, required });

    if (alpha !== undefined && typeof alpha !== 'string' && typeof alpha !== 'number')
      throw new TypeError('TinyHtmlInput: "alpha" must be a string or number.');
    if (alpha !== undefined) this.setAttr('alpha', alpha);

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

export default TinyHtmlColorInput;
