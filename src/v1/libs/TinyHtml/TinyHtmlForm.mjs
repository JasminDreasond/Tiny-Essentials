import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlForm is a helper for creating and managing <form> elements
 * with full attribute support and validation.
 *
 * @example
 * const form = new TinyHtmlForm({
 *   action: '/submit',
 *   method: 'post',
 *   enctype: 'multipart/form-data',
 *   autocomplete: 'on',
 *   novalidate: true,
 *   target: '_blank',
 *   tags: ['form', 'signup'],
 *   mainClass: 'primary-form'
 * });
 *
 * @extends TinyHtmlTemplate<HTMLFormElement>
 */
class TinyHtmlForm extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlForm instance.
   *
   * The constructor accepts a single `config` object with named options to
   * configure the created `<form>` element. Validation is performed for each
   * option and a `TypeError` is thrown when an invalid type or value is
   * provided. Deprecated attributes are accepted but will emit a console.warn.
   *
   * @param {Object} [config={}] - Configuration object.
   * @param {string} [config.action=""] - The URL that processes the form submission.
   *   If omitted the form will submit to the current document URL.
   * @param {'get'|'post'|'dialog'} [config.method='get'] - The HTTP method to submit the form with.
   *   - `get` (default): form data appended to the action URL.
   *   - `post`: form data sent in request body; `enctype` is relevant.
   *   - `dialog`: when the form is inside a `<dialog>`, closes the dialog and fires a submit event without sending data.
   * @param {'application/x-www-form-urlencoded'|'multipart/form-data'|'text/plain'} [config.enctype]
   *   The encoding type for form submission (only used when method is `post`).
   * @param {string} [config.acceptCharset] - The character encoding accepted by the server (e.g. "UTF-8").
   *   The specification recommends "UTF-8".
   * @param {'none'|'off'|'sentences'|'on'|'words'|'characters'} [config.autocapitalize]
   *   Controls automatic capitalization for text inputs inside the form.
   * @param {'on'|'off'} [config.autocomplete] - Hint to the browser whether autofill is allowed for controls in the form.
   * @param {string} [config.name] - The form name. Must be a non-empty string when provided.
   * @param {string} [config.rel] - Space-separated relationship tokens describing the form's link semantics.
   * @param {boolean} [config.novalidate=false] - When true, disables built-in form validation on submit.
   * @param {string} [config.target] - Target browsing context for the response.
   *   Can be one of `_self`, `_blank`, `_parent`, `_top`, `_unfencedTop` or a valid browsing context name
   *   (pattern: starts with a letter/underscore, then alphanumeric/`-`/`_`).
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes to apply to the form element.
   * @param {string} [config.mainClass=''] - Main CSS class to append to the element.
   *
   * @throws {TypeError} If `action` is provided and is not a string.
   * @throws {TypeError} If `method` is not one of 'get', 'post' or 'dialog'.
   * @throws {TypeError} If `enctype` is provided and is not one of the allowed encodings.
   * @throws {TypeError} If `acceptCharset` is provided and is not a string.
   * @throws {TypeError} If `autocapitalize` is provided and is not one of the allowed tokens.
   * @throws {TypeError} If `autocomplete` is provided and is not 'on' or 'off'.
   * @throws {TypeError} If `name` is provided and is not a non-empty string.
   * @throws {TypeError} If `rel` is provided and is not a string.
   * @throws {TypeError} If `novalidate` is not a boolean.
   * @throws {TypeError} If `target` is not a valid target keyword or a valid browsing context name.
   */
  constructor({
    action = '',
    method = 'get',
    enctype,
    acceptCharset,
    autocapitalize,
    autocomplete,
    name,
    rel,
    novalidate = false,
    target,
    tags = [],
    mainClass = '',
  } = {}) {
    super(document.createElement('form'), tags, mainClass);

    // --- action ---
    if (typeof action !== 'string') throw new TypeError('TinyForm: "action" must be a string.');
    if (action) this.setAttr('action', action);

    // --- method ---
    if (typeof method !== 'string') throw new TypeError('TinyForm: "method" must be a string.');
    const normalized = method.toLowerCase();
    const validMethods = ['get', 'post', 'dialog'];
    if (!validMethods.includes(normalized))
      throw new TypeError(`TinyForm: "method" must be one of: ${validMethods.join(', ')}.`);
    this.setAttr('method', normalized);

    // --- enctype ---
    if (enctype !== undefined) {
      const validEnctypes = [
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain',
      ];
      if (!validEnctypes.includes(enctype))
        throw new TypeError(`TinyForm: "enctype" must be one of: ${validEnctypes.join(', ')}.`);
      this.setAttr('enctype', enctype);
    }

    // --- accept-charset ---
    if (acceptCharset !== undefined) {
      if (typeof acceptCharset !== 'string')
        throw new TypeError('TinyForm: "acceptCharset" must be a string.');
      if (acceptCharset.toUpperCase() !== 'UTF-8')
        console.warn('TinyForm: Only "UTF-8" is recommended for accept-charset.');
      this.setAttr('accept-charset', acceptCharset);
    }

    // --- autocapitalize ---
    if (autocapitalize !== undefined) {
      const validAuto = ['none', 'off', 'sentences', 'on', 'words', 'characters'];
      if (!validAuto.includes(autocapitalize))
        throw new TypeError(`TinyForm: "autocapitalize" must be one of: ${validAuto.join(', ')}.`);
      this.setAttr('autocapitalize', autocapitalize);
    }

    // --- autocomplete ---
    if (autocomplete !== undefined) {
      if (!['on', 'off'].includes(autocomplete))
        throw new TypeError('TinyForm: "autocomplete" must be "on" or "off".');
      this.setAttr('autocomplete', autocomplete);
    }

    // --- name ---
    if (name !== undefined) {
      if (typeof name !== 'string') throw new TypeError('TinyForm: "name" must be a string.');
      if (name.trim() === '') throw new TypeError('TinyForm: "name" cannot be an empty string.');
      this.setAttr('name', name);
    }

    // --- rel ---
    if (rel !== undefined) {
      if (typeof rel !== 'string') throw new TypeError('TinyForm: "rel" must be a string.');
      this.setAttr('rel', rel);
    }

    // --- novalidate ---
    if (typeof novalidate !== 'boolean')
      throw new TypeError('TinyForm: "novalidate" must be a boolean.');
    if (novalidate) this.addProp('novalidate');

    // --- target ---
    if (target !== undefined) {
      if (typeof target !== 'string') throw new TypeError('TinyForm: "target" must be a string.');
      const validTargets = ['_self', '_blank', '_parent', '_top', '_unfencedTop'];
      // valid name pattern: start with letter/underscore, then letters/digits/underscore/hyphen
      const validName = /^[a-zA-Z_][\w-]*$/;
      if (!validTargets.includes(target) && !validName.test(target))
        throw new TypeError(
          `TinyForm: "target" must be a valid browsing context name or one of: ${validTargets.join(', ')}.`,
        );
      this.setAttr('target', target);
    }
  }

  /**
   * Programmatically submits the form.
   * @returns {this}
   */
  submit() {
    this.elements.forEach((element) =>
      element instanceof HTMLFormElement ? element.submit() : null,
    );
    return this;
  }

  /**
   * Resets the form.
   * @returns {this}
   */
  reset() {
    this.elements.forEach((element) =>
      element instanceof HTMLFormElement ? element.reset() : null,
    );
    return this;
  }
}

export default TinyHtmlForm;
