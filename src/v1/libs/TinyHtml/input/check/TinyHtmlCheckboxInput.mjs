import TinyHtmlTemplate from '../../TinyHtmlTemplate.mjs';

/**
 * TinyCheckbox is a lightweight helper class for managing <input type="checkbox">.
 *
 * @example
 * const checkbox = new TinyCheckbox({ checked: true });
 *
 * @extends TinyHtmlTemplate<HTMLInputElement>
 */
class TinyHtmlCheckboxInput extends TinyHtmlTemplate {
  /**
   * Creates a new TinyCheckbox instance.
   * @param {Object} config - Configuration object.
   * @param {boolean} [config.checked=false] - Whether the checkbox is checked.
   * @param {string} [config.name] - Input name attribute.
   * @param {string} [config.value="on"] - Input value when checked.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ checked = false, name, value = 'on', tags = [], mainClass = '' }) {
    super(document.createElement('input'), tags, mainClass);

    this.setAttr('type', 'checkbox');
    this.setAttr('value', value);
    if (name) this.setAttr('name', name);
    if (checked) this.addProp('checked');
  }

  /**
   * Checks the checkbox.
   * @returns {this}
   */
  check() {
    this.addProp('checked');
    return this;
  }

  /**
   * Unchecks the checkbox.
   * @returns {this}
   */
  uncheck() {
    this.removeProp('checked');
    return this;
  }

  /**
   * Toggles the checkbox state.
   * @returns {this}
   */
  toggle() {
    this.toggleProp('checked', !this.hasProp('checked'));
    return this;
  }

  /**
   * Returns whether the checkbox is checked.
   * @returns {boolean}
   */
  isChecked() {
    return this.hasProp('checked');
  }
}

export default TinyHtmlCheckboxInput;
