import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyRadio is a lightweight helper class for managing <input type="radio">.
 *
 * @example
 * const radio = new TinyRadio({ name: 'gender', value: 'female', checked: true });
 */
class TinyHtmlRadioInput extends TinyHtmlInput {
  /**
   * Creates a new TinyRadio instance.
   * @param {Object} config - Configuration object.
   * @param {string} config.name - Radio group name (required).
   * @param {string} config.value - Value for this radio option.
   * @param {boolean} [config.checked=false] - Whether this radio is selected.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ name, value, checked = false, readonly, required, tags = [], mainClass = '' }) {
    super({ tags, mainClass, type: 'radio', name, value, readonly, required });
    if (typeof checked !== 'boolean')
      throw new TypeError("TinyHtmlRadioInput: 'checked' must be a boolean.");
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
