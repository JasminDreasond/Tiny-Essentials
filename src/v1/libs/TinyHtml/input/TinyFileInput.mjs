import TinyInput from '../TinyInput.mjs';

/**
 * TinyFileInput is a helper for managing <input type="file"> elements.
 *
 * @example
 * const fileInput = new TinyFileInput({ accept: '.png,.jpg', multiple: true });
 */
class TinyFileInput extends TinyInput {
  /**
   * Creates a new TinyFileInput instance.
   * @param {Object} config
   * @param {string} [config.name]
   * @param {boolean} [config.multiple=false] - Allow selecting multiple files.
   * @param {string} [config.accept] - Accepted file types (e.g., ".jpg,.png" or "image/*").
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ name, multiple = false, accept, tags = [], mainClass = '' } = {}) {
    super({ type: 'file', name, tags, mainClass });

    if (multiple) this.setAttr('multiple', 'multiple');
    if (accept) this.setAttr('accept', accept);
  }

  /**
   * Gets the list of selected files.
   * @returns {FileList|null}
   */
  getFiles() {
    const element = this.elements[0];
    if (!(element instanceof HTMLInputElement)) throw new Error('');
    return element.files;
  }
}

export default TinyFileInput;
