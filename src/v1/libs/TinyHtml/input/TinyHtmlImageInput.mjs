import TinyHtmlInput from '../TinyHtmlInput.mjs';

class TinyHtmlImageInput extends TinyHtmlInput {
  /**
   * Creates a new TinyHtmlImageInput instance.
   * @param {Object} config
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string} [config.formenctype] - Encoding type ("application/x-www-form-urlencoded", "multipart/form-data", "text/plain").
   * @param {string} [config.formmethod] - Submission method ("get", "post", "dialog").
   * @param {boolean} [config.formnovalidate] - Bypass form validation.
   * @param {string} [config.formtarget] - Where to display response ("_self", "_blank", "_parent", "_top").
   * @param {string} [config.autocomplete] - Autocomplete hint (e.g., "on", "off", "email").
   * @param {string} [config.alt] - Alt text (only for type="image").
   * @param {string} [config.formaction] - URL to submit form (image, submit).
   * @param {number} [config.height] - Height in CSS pixels (image input).
   * @param {number} [config.width] - Width in CSS pixels (image input).
   * @param {string} [config.list] - ID of a <datalist>.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    list,
    formenctype,
    formmethod,
    formnovalidate = false,
    height,
    width,
    formtarget,
    formaction,
    name,
    readonly,
    required,
    alt,
    autocomplete,
    tags = [],
    mainClass = '',
  }) {
    super({ type: 'image', name, placeholder, tags, mainClass, readonly, required });
    // --- alt ---
    if (alt !== undefined) {
      if (typeof alt !== 'string') throw new TypeError('"alt" must be a string.');
      this.setAttr('alt', alt);
    }

    // --- list ---
    if (list !== undefined) {
      if (typeof list !== 'string') throw new TypeError('"list" must be a string (datalist id).');
      this.setAttr('list', list);
    }

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

    // --- height / width ---
    if (height !== undefined) {
      if (type !== 'image') throw new Error('"height" is only valid for type="image".');
      if (!Number.isInteger(height) || height <= 0)
        throw new TypeError('"height" must be a positive integer.');
      this.setAttr('height', String(height));
    }
    if (width !== undefined) {
      if (type !== 'image') throw new Error('"width" is only valid for type="image".');
      if (!Number.isInteger(width) || width <= 0)
        throw new TypeError('"width" must be a positive integer.');
      this.setAttr('width', String(width));
    }

    // --- autocomplete ---
    if (autocomplete !== undefined) {
      if (typeof autocomplete !== 'string') throw new TypeError('"autocomplete" must be a string.');
      this.setAttr('autocomplete', autocomplete);
    }
  }
}

export default TinyHtmlFileInput;
