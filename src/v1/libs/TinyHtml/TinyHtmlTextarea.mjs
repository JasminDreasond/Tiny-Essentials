import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyTextarea is a helper class for managing <textarea> elements.
 * It allows configuring all standard attributes such as rows, cols, placeholder,
 * autocomplete, spellcheck, and more, with validation.
 *
 * @example
 * const textarea = new TinyHtmlTextarea({
 *   rows: 5,
 *   placeholder: 'Write here...',
 *   required: true,
 *   maxlength: 200
 * });
 *
 * @extends TinyHtmlTemplate<HTMLTextAreaElement>
 */
class TinyHtmlTextarea extends TinyHtmlTemplate {
  /**
   * Creates a new TinyTextarea instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.value=""] - Initial text inside the textarea.
   * @param {number} [config.rows] - Number of visible text lines.
   * @param {number} [config.cols] - Number of character columns.
   * @param {string} [config.placeholder] - Placeholder text.
   * @param {'none'|'sentences'|'words'|'characters'|'on'|'off'} [config.autocapitalize] - Controls automatic capitalization.
   * @param {string} [config.autocomplete] - Autocomplete behavior ("on", "off", or token list).
   * @param {string} [config.autocorrect] - Autocorrect behavior ("on" or "off").
   * @param {boolean} [config.autofocus=false] - Whether the textarea should autofocus on load.
   * @param {string} [config.dirname] - Directionality of submitted text.
   * @param {boolean} [config.disabled=false] - Whether the textarea is disabled.
   * @param {string} [config.form] - The id of the associated form.
   * @param {number} [config.maxlength] - Maximum length in UTF-16 code units.
   * @param {number} [config.minlength] - Minimum length in UTF-16 code units.
   * @param {string} [config.name] - The name of the control.
   * @param {boolean} [config.readonly=false] - Whether the textarea is read-only.
   * @param {boolean} [config.required=false] - Whether the textarea is required.
   * @param {true|false|"true"|"false"|"default"} [config.spellcheck] - Spellcheck behavior.
   * @param {"hard"|"soft"|"off"} [config.wrap] - Wrapping behavior.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=''] - Main CSS class.
   * @throws {TypeError} If any attribute is of the wrong type.
   */
  constructor({
    value = '',
    rows,
    cols,
    placeholder,
    autocapitalize,
    autocomplete,
    autocorrect,
    autofocus = false,
    dirname,
    disabled = false,
    form,
    maxlength,
    minlength,
    name,
    readonly = false,
    required = false,
    spellcheck,
    wrap,
    tags = [],
    mainClass = '',
  } = {}) {
    super(document.createElement('textarea'), tags, mainClass);

    // value
    if (typeof value !== 'string') throw new TypeError('TinyTextarea: "value" must be a string.');
    this.setText(value);

    // rows
    if (rows !== undefined) {
      if (!Number.isInteger(rows) || rows < 1)
        throw new TypeError('TinyTextarea: "rows" must be a positive integer.');
      this.setAttr('rows', rows);
    }

    // cols
    if (cols !== undefined) {
      if (!Number.isInteger(cols) || cols < 1)
        throw new TypeError('TinyTextarea: "cols" must be a positive integer.');
      this.setAttr('cols', cols);
    }

    // placeholder
    if (placeholder !== undefined) {
      if (typeof placeholder !== 'string')
        throw new TypeError('TinyTextarea: "placeholder" must be a string.');
      this.setAttr('placeholder', placeholder);
    }

    // autocapitalize
    if (autocapitalize !== undefined) {
      const valid = ['none', 'sentences', 'words', 'characters', 'on', 'off'];
      if (!valid.includes(autocapitalize))
        throw new TypeError(`TinyTextarea: "autocapitalize" must be one of ${valid.join(', ')}.`);
      this.setAttr('autocapitalize', autocapitalize);
    }

    // autocomplete
    if (autocomplete !== undefined) {
      if (typeof autocomplete !== 'string')
        throw new TypeError('TinyTextarea: "autocomplete" must be a string.');
      this.setAttr('autocomplete', autocomplete);
    }

    // autocorrect
    if (autocorrect !== undefined) {
      if (!['on', 'off'].includes(autocorrect))
        throw new TypeError('TinyTextarea: "autocorrect" must be "on" or "off".');
      this.setAttr('autocorrect', autocorrect);
    }

    // autofocus
    if (autofocus) this.setAttr('autofocus', 'true');

    // dirname
    if (dirname !== undefined) {
      if (typeof dirname !== 'string')
        throw new TypeError('TinyTextarea: "dirname" must be a string.');
      this.setAttr('dirname', dirname);
    }

    // disabled
    if (disabled) this.addProp('disabled');

    // form
    if (form !== undefined) {
      if (typeof form !== 'string') throw new TypeError('TinyTextarea: "form" must be a string.');
      this.setAttr('form', form);
    }

    // maxlength
    if (maxlength !== undefined) {
      if (!Number.isInteger(maxlength) || maxlength < 1)
        throw new TypeError('TinyTextarea: "maxlength" must be a positive integer.');
      this.setAttr('maxlength', maxlength);
    }

    // minlength
    if (minlength !== undefined) {
      if (!Number.isInteger(minlength) || minlength < 0)
        throw new TypeError('TinyTextarea: "minlength" must be a non-negative integer.');
      this.setAttr('minlength', minlength);
    }

    // name
    if (name !== undefined) {
      if (typeof name !== 'string') throw new TypeError('TinyTextarea: "name" must be a string.');
      this.setAttr('name', name);
    }

    // readonly
    if (readonly) this.addProp('readonly');

    // required
    if (required) this.addProp('required');

    // spellcheck
    if (spellcheck !== undefined) {
      if (![true, false, 'true', 'false', 'default'].includes(spellcheck))
        throw new TypeError('TinyTextarea: "spellcheck" must be "true", "false" or "default".');
      this.setAttr('spellcheck', spellcheck);
    }

    // wrap
    if (wrap !== undefined) {
      const valid = ['hard', 'soft', 'off'];
      if (!valid.includes(wrap))
        throw new TypeError(`TinyTextarea: "wrap" must be one of ${valid.join(', ')}.`);
      this.setAttr('wrap', wrap);
    }
  }
}

export default TinyHtmlTextarea;
