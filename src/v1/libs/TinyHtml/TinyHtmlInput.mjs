import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlInput is a lightweight helper class for managing <input> elements.
 * It provides a simplified API for setting attributes like type, value,
 * and placeholder, while extending TinyHtmlTemplate for direct DOM manipulation.
 *
 * @example
 * const input = new TinyHtmlInput({ type: 'text', placeholder: 'Your name' });
 * input.setValue('Yasmin');
 */
class TinyHtmlInput extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlInput instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.type="text"] - Input type (e.g., "text", "password", "email").
   * @param {string} [config.value=""] - Initial value.
   * @param {string} [config.placeholder=""] - Placeholder text.
   * @param {string} [config.name=""] - Input name.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({
    type = 'text',
    value = '',
    placeholder = '',
    name = '',
    tags = [],
    mainClass = '',
  } = {}) {
    super('input', tags, mainClass);
    if (typeof type !== 'string' || !type.trim())
      throw new TypeError(`TinyHtmlInput: 'type' must be a non-empty string. Got: ${type}`);

    this.setAttr('type', type);
    if (name) this.setAttr('name', name);
    if (value) this.setAttr('value', value);
    if (placeholder) this.setAttr('placeholder', placeholder);
  }
}

export default TinyHtmlInput;
