import TinyHtmlInput from '../TinyHtmlInput.mjs';

class TinyHtmlImageInput extends TinyHtmlInput {
  /**
   * Creates a new TinyHtmlImageInput instance.
   * @param {Object} config
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ name, tags = [], mainClass = '' }) {
    super({ type: 'image', name, placeholder, tags, mainClass });
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

export default TinyHtmlFileInput;
