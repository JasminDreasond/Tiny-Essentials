import TinyHtmlInput from '../TinyHtmlInput.mjs';

/**
 * TinyFileInput is a helper for managing <input type="file"> elements.
 *
 * @example
 * const fileInput = new TinyFileInput({ accept: '.png,.jpg', multiple: true });
 */
class TinyHtmlFileInput extends TinyHtmlInput {
  /**
   * Creates a new TinyFileInput instance.
   * @param {Object} config
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string|boolean} [config.capture] - Capture mode for file input ("user" | "environment" | true).
   * @param {boolean} [config.multiple=false] - Allow selecting multiple files.
   * @param {string} [config.accept] - Accepted file types (e.g., ".jpg,.png" or "image/*").
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    name,
    capture,
    multiple = false,
    accept,
    placeholder,
    readonly,
    required,
    tags = [],
    mainClass = '',
  }) {
    super({ type: 'file', name, placeholder, tags, mainClass, readonly, required });

    if (typeof multiple !== 'boolean')
      throw new TypeError("TinyHtmlFileInput: 'multiple' must be a boolean.");
    if (accept !== undefined && typeof accept !== 'string')
      throw new TypeError("TinyHtmlFileInput: 'accept' must be a string.");
    if (multiple) this.setAttr('multiple', 'multiple');
    if (accept) this.setAttr('accept', accept);

    // --- capture ---
    if (capture !== undefined) {
      if (typeof capture !== 'string' && typeof capture !== 'boolean')
        throw new TypeError('"capture" must be a string or boolean.');
      this.setAttr('capture', capture);
    }
  }

  /**
   * Gets the list of selected files.
   * @returns {FileList|null}
   */
  getFiles() {
    return this.el.files;
  }
}

export default TinyHtmlFileInput;
