import TinyHtml from '../TinyHtml.mjs';
import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlSelect is a helper class for managing <select> elements.
 * It supports all standard attributes (multiple, autocomplete, autofocus, disabled, etc.)
 * and provides helpers for managing <option> elements.
 *
 * @example
 * const select = new TinyHtmlSelect({
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
   * @param {Object} config
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

    this.multiple = multiple;
    if (autocomplete !== undefined) this.autocomplete = autocomplete;
    this.autofocus = autofocus;
    this.disabled = disabled;
    if (form !== undefined) this.form = form;
    if (name !== undefined) this.name = name;
    this.required = required;
    if (size !== undefined) this.size = size;

    for (const opt of options) {
      this.addOption(opt);
    }
  }

  /** @param {boolean} multiple */
  set multiple(multiple) {
    if (typeof multiple !== 'boolean') throw new TypeError('"multiple" must be a boolean.');
    if (multiple) this.addProp('multiple');
    else this.removeProp('multiple');
  }

  /** @returns {boolean} */
  get multiple() {
    return this.hasProp('multiple');
  }

  /** @param {string} autocomplete */
  set autocomplete(autocomplete) {
    if (typeof autocomplete !== 'string') throw new TypeError('"autocomplete" must be a string.');
    this.setAttr('autocomplete', autocomplete);
  }

  /** @returns {string|null} */
  get autocomplete() {
    return this.attrString('autocomplete');
  }

  /** @param {boolean} autofocus */
  set autofocus(autofocus) {
    if (typeof autofocus !== 'boolean') throw new TypeError('"autofocus" must be a boolean.');
    if (autofocus) this.addProp('autofocus');
    else this.removeProp('autofocus');
  }

  /** @returns {boolean} */
  get autofocus() {
    return this.hasProp('autofocus');
  }

  /** @param {boolean} disabled */
  set disabled(disabled) {
    if (typeof disabled !== 'boolean') throw new TypeError('"disabled" must be a boolean.');
    if (disabled) this.addProp('disabled');
    else this.removeProp('disabled');
  }

  /** @returns {boolean} */
  get disabled() {
    return this.hasProp('disabled');
  }

  /** @param {string} form */
  set form(form) {
    if (typeof form !== 'string') throw new TypeError('"form" must be a string (form id).');
    this.setAttr('form', form);
  }

  /** @returns {string|null} */
  get form() {
    return this.attrString('form');
  }

  /** @param {string} name */
  set name(name) {
    if (typeof name !== 'string') throw new TypeError('"name" must be a string.');
    this.setAttr('name', name);
  }

  /** @returns {string|null} */
  get name() {
    return this.attrString('name');
  }

  /** @param {boolean} required */
  set required(required) {
    if (typeof required !== 'boolean') throw new TypeError('"required" must be a boolean.');
    if (required) this.addProp('required');
    else this.removeProp('required');
  }

  /** @returns {boolean} */
  get required() {
    return this.hasProp('required');
  }

  /** @param {number} size */
  set elSize(size) {
    if (!Number.isInteger(size) || size < 0)
      throw new TypeError('"size" must be a non-negative integer.');
    this.setAttr('size', size);
  }

  /** @returns {number|null} */
  get elSize() {
    return this.attrNumber('size');
  }

  /**
   * Adds an option element.
   * @param {{ value: string, label: string|Element|TinyHtml<any>, selected?: boolean, allowHtml?: boolean }} option
   * @returns {this}
   */
  addOption({ value, label, allowHtml = false, selected = false }) {
    if (typeof value !== 'string') throw new TypeError('"value" must be a string.');
    if (typeof selected !== 'boolean') throw new TypeError('"selected" must be a boolean.');

    const opt = new TinyHtml(document.createElement('option'));
    opt.setAttr('value', value);

    if (typeof label === 'string') {
      if (!allowHtml) opt.setText(label);
      else opt.setHtml(label);
    } else if (label instanceof Element || label instanceof TinyHtml) {
      if (!allowHtml)
        throw new Error('addOption: Passing an Element/TinyHtml requires allowHtml=true.');
      opt.append(label);
    } else {
      throw new TypeError('"label" must be a string, Element, or TinyHtml instance.');
    }

    if (selected) opt.addProp('selected');
    this.append(opt);
    return this;
  }

  /** @returns {string} */
  get value() {
    if (this.multiple)
      throw new Error('TinyHtmlSelect.value: Use "values" getter for multiple selects.');
    return this.valTxt();
  }

  /** @param {string} val */
  set value(val) {
    if (this.multiple)
      throw new Error('TinyHtmlSelect.value: Use "values" setter for multiple selects.');
    if (typeof val !== 'string') throw new TypeError('"value" must be a string.');
    this.setValue(val);
  }

  /** @returns {string[]} */
  get values() {
    if (!this.multiple)
      throw new Error('TinyHtmlSelect.values: Use "value" getter for single select.');
    return Array.from(this.prop('selectedOptions')).map((o) => o.value);
  }

  /** @param {string[]} vals */
  set values(vals) {
    if (!this.multiple)
      throw new Error('TinyHtmlSelect.values: Use "value" setter for single select.');
    if (!Array.isArray(vals) || !vals.every((v) => typeof v === 'string'))
      throw new TypeError('"values" must be an array of strings.');
    this.setValue(vals);
  }

  /**
   * Internal: apply selection to options.
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
