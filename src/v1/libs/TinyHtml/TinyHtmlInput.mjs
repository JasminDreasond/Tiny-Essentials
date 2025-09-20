import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlInput is a lightweight helper class for managing <input> elements.
 * It provides a simplified API for setting attributes like type, value,
 * and placeholder, while extending TinyHtmlTemplate for direct DOM manipulation.
 *
 * @example
 * const input = new TinyHtmlInput({ type: 'text', placeholder: 'Your name' });
 * input.setValue('Yasmin');
 *
 * @extends TinyHtmlTemplate<HTMLInputElement>
 */
class TinyHtmlInput extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlInput instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.form] - ID of a form element.
   * @param {boolean} [config.disabled] - Whether input is disabled.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string} [config.type="text"] - Input type (e.g., "text", "password", "email").
   * @param {string} [config.placeholder=""] - Placeholder text.
   * @param {string} [config.name=""] - Input name.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({
    type = 'text',
    placeholder = '',
    name = '',
    tags = [],
    mainClass = '',
    disabled,
    readonly,
    required,
    form,
  } = {}) {
    super(document.createElement('input'), tags, mainClass);
    if (typeof type !== 'string' || !type.trim())
      throw new TypeError(`TinyHtmlInput: 'type' must be a non-empty string. Got: ${type}`);
    this.setAttr('type', type);
    if (name !== undefined && typeof name !== 'string')
      throw new TypeError('TinyHtmlInput: "name" must be a string.');
    if (name) this.setAttr('name', name);

    if (placeholder !== undefined && typeof placeholder !== 'string')
      throw new TypeError('TinyHtmlInput: "placeholder" must be a string.');
    if (placeholder) this.setAttr('placeholder', placeholder);

    // --- readonly ---
    if (readonly !== undefined) {
      if (typeof readonly !== 'boolean') throw new TypeError('"readonly" must be a boolean.');
      if (readonly) this.addProp('readonly');
    }

    // --- required ---
    if (required !== undefined) {
      if (typeof required !== 'boolean') throw new TypeError('"required" must be a boolean.');
      if (required) this.addProp('required');
    }

    // --- disabled ---
    if (disabled !== undefined) {
      if (typeof disabled !== 'boolean') throw new TypeError('"disabled" must be a boolean.');
      if (disabled) this.addProp('disabled');
    }

    // --- form ---
    if (form !== undefined) {
      if (typeof form !== 'string') throw new TypeError('"form" must be a string (form id).');
      this.setAttr('form', form);
    }
  }
}

export default TinyHtmlInput;
