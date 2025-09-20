import TinyHtml from '../TinyHtml.mjs';
import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinySelect is a lightweight helper class for managing <select> elements.
 * It provides an easy way to add <option> elements dynamically and supports
 * all standard <select> attributes like autocomplete, autofocus, disabled, etc.
 *
 * @example
 * const select = new TinySelect({
 *   options: [
 *     { value: '1', label: 'One' },
 *     { value: '2', label: 'Two', selected: true }
 *   ],
 *   multiple: true,
 *   required: true,
 *   size: 5,
 *   name: 'numbers',
 * });
 *
 * @extends TinyHtmlTemplate<HTMLSelectElement>
 */
class TinyHtmlSelect extends TinyHtmlTemplate {
  /**
   * Creates a new TinySelect instance.
   * @param {Object} config - Configuration object.
   * @param {{ value: string, label: string|Element|TinyHtml<any>, selected?: boolean, allowHtml?: boolean }[]} [config.options=[]]
   * @param {boolean} [config.multiple=false]
   * @param {string} [config.autocomplete]
   * @param {boolean} [config.autofocus=false]
   * @param {boolean} [config.disabled=false]
   * @param {string} [config.form]
   * @param {string} [config.name]
   * @param {boolean} [config.required=false]
   * @param {number} [config.size]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    options = [],
    multiple = false,
    autocomplete,
    autofocus = false,
    disabled = false,
    form,
    name,
    required = false,
    size,
    tags = [],
    mainClass = '',
  } = {}) {
    super(document.createElement('select'), tags, mainClass);

    // multiple
    if (typeof multiple !== 'boolean')
      throw new TypeError('TinySelect: "multiple" must be a boolean.');
    if (multiple) this.setAttr('multiple', 'multiple');

    // autocomplete
    if (autocomplete !== undefined) {
      if (typeof autocomplete !== 'string')
        throw new TypeError('TinySelect: "autocomplete" must be a string.');
      this.setAttr('autocomplete', autocomplete);
    }

    // autofocus
    if (typeof autofocus !== 'boolean')
      throw new TypeError('TinySelect: "autofocus" must be a boolean.');
    if (autofocus) this.setAttr('autofocus', 'autofocus');

    // disabled
    if (typeof disabled !== 'boolean')
      throw new TypeError('TinySelect: "disabled" must be a boolean.');
    if (disabled) this.addProp('disabled');

    // form
    if (form !== undefined) {
      if (typeof form !== 'string')
        throw new TypeError('TinySelect: "form" must be a string (form id).');
      this.setAttr('form', form);
    }

    // name
    if (name !== undefined) {
      if (typeof name !== 'string') throw new TypeError('TinySelect: "name" must be a string.');
      this.setAttr('name', name);
    }

    // required
    if (typeof required !== 'boolean')
      throw new TypeError('TinySelect: "required" must be a boolean.');
    if (required) this.addProp('required');

    // size
    if (size !== undefined) {
      if (!Number.isInteger(size) || size < 0)
        throw new TypeError('TinySelect: "size" must be a non-negative integer.');
      this.setAttr('size', String(size));
    }

    // options
    for (const opt of options) {
      this.addOption(opt);
    }
  }

  /**
   * Adds an option to the select element.
   * @param {{ value: string, label: string|Element|TinyHtml<any>, selected?: boolean, allowHtml?: boolean }} option
   * @returns {this}
   */
  addOption({ value, label, allowHtml = false, selected = false }) {
    if (typeof value !== 'string')
      throw new TypeError('TinySelect.addOption: "value" must be a string.');
    if (typeof selected !== 'boolean')
      throw new TypeError('TinySelect.addOption: "selected" must be a boolean.');

    const opt = new TinyHtml(document.createElement('option'));
    opt.setVal(value);

    if (typeof label === 'string') {
      if (!allowHtml) opt.setText(label);
      else opt.setHtml(label);
    } else if (label instanceof Element || label instanceof TinyHtml) {
      if (!allowHtml)
        throw new Error('addOption: Passing an Element/TinyHtml requires allowHtml=true.');
      opt.append(label);
    } else
      throw new TypeError("addOption: 'label' must be a string, Element, or TinyHtml instance.");

    if (selected) opt.addProp('selected');
    this.append(opt);
    return this;
  }

  /**
   * Gets the currently selected value.
   * @returns {string}
   */
  getValue() {
    if (this.hasProp('multiple'))
      throw new Error('TinySelect.getValue: Use getValues() for multiple selects.');
    return this.valTxt();
  }

  /**
   * Gets the currently selected values.
   * @returns {string[]}
   */
  getValues() {
    if (!this.hasProp('multiple'))
      throw new Error('TinySelect.getValues: Use getValue() for single selects.');
    return Array.from(this.prop('selectedOptions')).map((o) => o.value);
  }

  /**
   * Sets the selected value(s).
   * @param {string|string[]} value
   * @returns {this}
   */
  setValue(value) {
    const values = Array.isArray(value) ? value : [value];
    if (!values.every((v) => typeof v === 'string'))
      throw new TypeError('TinySelect.setValue: "value" must be a string or array of strings.');

    for (const opt of this.prop('options')) {
      opt.selected = values.includes(opt.value);
    }
    return this;
  }
}

export default TinyHtmlSelect;
