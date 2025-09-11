import TinyInput from '../TinyInput.mjs';

/**
 * TinyColorInput is a helper for managing <input type="color"> elements.
 */
class TinyColorInput extends TinyInput {
  /**
   * @param {Object} config
   * @param {string} [config.value="#000000"]
   * @param {string} [config.name]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({ value = '#000000', name = '', tags = [], mainClass = '' } = {}) {
    super({ type: 'color', name, tags, mainClass });
    this.setAttr('value', value);
  }
}

export default TinyColorInput;
