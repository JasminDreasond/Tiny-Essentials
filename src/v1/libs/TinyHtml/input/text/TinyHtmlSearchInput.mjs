import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinySearchInput is a helper for managing <input type="search"> elements.
 */
class TinyHtmlSearchInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {number} [config.minLength]
   * @param {number} [config.maxLength]
   * @param {string} [config.name]
   * @param {string} [config.pattern] - Regex pattern.
   * @param {string} [config.autocomplete] - Autocomplete hint (e.g., "on", "off", "email").
   * @param {string} [config.autocapitalize] - Auto-capitalization ("none" | "sentences" | "words" | "characters").
   * @param {string} [config.dirname] - Name for directionality field (text-based inputs).
   * @param {number} [config.size] - Size of text input.
   * @param {string} [config.list] - ID of a <datalist>.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    value,
    list,
    placeholder,
    autocapitalize,
    autocomplete,
    pattern,
    minLength,
    maxLength,
    readonly,
    required,
    size,
    dirname,
    name,
    tags = [],
    mainClass = '',
  }) {
    super({ value, name, placeholder, type: 'search', tags, mainClass, readonly, required });
    if (minLength !== undefined && typeof minLength !== 'number')
      throw new TypeError("TinyHtmlSearchInput: 'minLength' must be a number.");
    if (maxLength !== undefined && typeof maxLength !== 'number')
      throw new TypeError("TinyHtmlSearchInput: 'maxLength' must be a number.");
    if (minLength !== undefined) this.setAttr('minlength', String(minLength));
    if (maxLength !== undefined) this.setAttr('maxlength', String(maxLength));

    // --- pattern ---
    if (pattern !== undefined) {
      if (typeof pattern !== 'string') throw new TypeError('"pattern" must be a string.');
      this.setAttr('pattern', pattern);
    }

    // --- list ---
    if (list !== undefined) {
      if (typeof list !== 'string') throw new TypeError('"list" must be a string (datalist id).');
      this.setAttr('list', list);
    }

    // --- autocapitalize ---
    if (autocapitalize !== undefined) {
      const allowed = ['none', 'sentences', 'words', 'characters'];
      if (!allowed.includes(autocapitalize))
        throw new Error(`"autocapitalize" must be one of ${allowed.join(', ')}.`);
      this.setAttr('autocapitalize', autocapitalize);
    }

    // --- autocomplete ---
    if (autocomplete !== undefined) {
      if (typeof autocomplete !== 'string') throw new TypeError('"autocomplete" must be a string.');
      this.setAttr('autocomplete', autocomplete);
    }

    // --- dirname ---
    if (dirname !== undefined) {
      if (typeof dirname !== 'string') throw new TypeError('"dirname" must be a string.');
      this.setAttr('dirname', dirname);
    }

    // --- size ---
    if (size !== undefined) {
      if (!Number.isInteger(size) || size < 1)
        throw new TypeError('"size" must be a positive integer.');
      this.setAttr('size', String(size));
    }
  }
}

export default TinyHtmlSearchInput;
