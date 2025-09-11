import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinySelect is a lightweight helper class for managing <select> elements.
 * It provides an easy way to add <option> elements dynamically.
 *
 * @example
 * const select = new TinySelect({ options: [{ value: '1', label: 'One' }] });
 *
 * @extends TinyHtmlTemplate<HTMLSelectElement>
 */
class TinyHtmlSelect extends TinyHtmlTemplate {
  /**
   * Creates a new TinySelect instance.
   * @param {Object} config - Configuration object.
   * @param {{ value: string, label: string, selected?: boolean }[]} [config.options=[]]
   *   List of options to initialize the select with.
   * @param {boolean} [config.multiple=false] - Whether the select allows multiple choices.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ options = [], multiple = false, tags = [], mainClass = '' } = {}) {
    super(document.createElement('select'), tags, mainClass);

    if (multiple) this.setAttr('multiple', 'multiple');

    for (const opt of options) {
      this.addOption(opt);
    }
  }

  /**
   * Adds an option to the select element.
   * @param {{ value: string, label: string, selected?: boolean }} option
   * @returns {this}
   */
  addOption({ value, label, selected = false }) {
    if (typeof value !== 'string' || typeof label !== 'string')
      throw new TypeError('TinySelect.addOption: "value" and "label" must be strings.');
    if (typeof selected !== 'boolean')
      throw new TypeError('TinySelect.addOption: "selected" must be a boolean.');
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (selected) opt.selected = true;
    this.append(opt);
    return this;
  }

  /**
   * Gets the currently selected value.
   * @returns {string}
   */
  getValue() {
    if (!this.hasProp('multiple')) throw new Error('');
    return this.valTxt();
  }

  /**
   * Gets the currently selected values.
   * @returns {string[]}
   */
  getValues() {
    return Array.from(this.prop('selectedOptions')).map((o) => o.value);
  }

  /**
   * Sets the selected value(s).
   * @param {string|string[]} value
   * @returns {this}
   */
  setValue(value) {
    const values = Array.isArray(value) ? value : [value];
    for (const opt of this.prop('options')) {
      opt.selected = values.includes(opt.value);
    }
    return this;
  }
}

export default TinyHtmlSelect;
