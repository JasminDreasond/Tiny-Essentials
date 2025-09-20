import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinySubmitInput is a helper for managing <input type="submit"> elements.
 */
class TinyHtmlSubmitInput extends TinyHtmlInput {
  /**
   * @param {Object} config
   * @param {string} [config.value]
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string} [config.formenctype] - Encoding type ("application/x-www-form-urlencoded", "multipart/form-data", "text/plain").
   * @param {string} [config.formmethod] - Submission method ("get", "post", "dialog").
   * @param {boolean} [config.formnovalidate] - Bypass form validation.
   * @param {string} [config.formtarget] - Where to display response ("_self", "_blank", "_parent", "_top").
   * @param {string} [config.formaction] - URL to submit form (image, submit).
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    formenctype,
    formmethod,
    formnovalidate = false,
    formtarget,
    formaction,
    readonly,
    required,
    value,
    tags = [],
    name,
    placeholder,
    mainClass = '',
  }) {
    super({ value, name, placeholder, type: 'submit', tags, mainClass, readonly, required });

    // --- formaction, formenctype, formmethod, formnovalidate, formtarget ---
    if (formaction !== undefined) {
      if (typeof formaction !== 'string') throw new TypeError('"formaction" must be a string.');
      this.setAttr('formaction', formaction);
    }

    if (formenctype !== undefined) {
      const allowed = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];
      if (!allowed.includes(formenctype))
        throw new Error(`"formenctype" must be one of ${allowed.join(', ')}.`);
      this.setAttr('formenctype', formenctype);
    }

    if (formmethod !== undefined) {
      const allowed = ['get', 'post', 'dialog'];
      if (!allowed.includes(formmethod))
        throw new Error(`"formmethod" must be one of ${allowed.join(', ')}.`);
      this.setAttr('formmethod', formmethod);
    }

    if (typeof formnovalidate !== 'boolean')
      throw new TypeError('"formnovalidate" must be a string.');
    if (formnovalidate === true) this.addProp('formnovalidate');

    if (formtarget !== undefined) {
      if (typeof formtarget !== 'string') throw new TypeError('"formtarget" must be a string.');
      this.setAttr('formtarget', formtarget);
    }
  }
}

export default TinyHtmlSubmitInput;
