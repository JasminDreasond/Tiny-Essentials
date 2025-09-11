import TinyHtmlTemplate from '../../TinyHtmlTemplate.mjs';

/**
 * TinyRadio is a lightweight helper class for managing <input type="radio">.
 *
 * @example
 * const radio = new TinyRadio({ name: 'gender', value: 'female', checked: true });
 */
class TinyHtmlRadioInput extends TinyHtmlTemplate {
  /**
   * Creates a new TinyRadio instance.
   * @param {Object} config - Configuration object.
   * @param {string} config.name - Radio group name (required).
   * @param {string} config.value - Value for this radio option.
   * @param {boolean} [config.checked=false] - Whether this radio is selected.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ name, value, checked = false, tags = [], mainClass = '' }) {
    super('input', tags, mainClass);

    if (typeof name !== 'string' || !name.trim()) {
      throw new TypeError('TinyRadio: "name" is required and must be a string.');
    }
    if (typeof value !== 'string') {
      throw new TypeError('TinyRadio: "value" must be a string.');
    }

    this.setAttr('type', 'radio');
    this.setAttr('name', name);
    this.setAttr('value', value);
    if (checked) this.addProp('checked');
  }

  /**
   * Checks the radio.
   * @returns {this}
   */
  check() {
    this.addProp('checked');
    return this;
  }

  /**
   * Unchecks the radio.
   * @returns {this}
   */
  uncheck() {
    this.removeProp('checked');
    return this;
  }

  /**
   * Toggles the radio state.
   * @returns {this}
   */
  toggle() {
    this.toggleProp('checked', !this.hasProp('checked'));
    return this;
  }

  /**
   * Returns whether the radio is checked.
   * @returns {boolean}
   */
  isChecked() {
    return this.hasProp('checked');
  }
}

export default TinyHtmlRadioInput;
