import TinyHtmlInput from '../TinyHtmlInput.mjs';

/**
 * TinyHiddenInput is a helper for managing <input type="hidden"> elements.
 */
class TinyHtmlHiddenInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string} [config.name]
   * @param {string} [config.autocomplete] - Autocomplete hint (e.g., "on", "off", "email").
   * @param {string} [config.dirname] - Name for directionality field (text-based inputs).
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    name,
    value,
    dirname,
    autocomplete,
    readonly,
    required,
    tags = [],
    mainClass = '',
  }) {
    super({ type: 'hidden', name, tags, mainClass, readonly, required });

    if (value !== undefined && typeof value !== 'string' && typeof value !== 'number')
      throw new TypeError('TinyHtmlInput: "value" must be a string or number.');
    if (value !== undefined) this.setAttr('value', value);

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
  }
}

export default TinyHtmlHiddenInput;
