import TinyHtmlTemplate from '../TinyHtmlTemplate.mjs';

/**
 * TinyHtmlObject is a lightweight helper class for managing <object> elements,
 * commonly used to embed external resources like PDFs, HTML, or SVGs.
 *
 * Supported attributes:
 * - data: URL of the resource (string). At least one of `data` or `type` must be defined.
 * - type: MIME type of the resource (string). At least one of `data` or `type` must be defined.
 * - form: ID of the associated <form> element (string).
 * - height: Displayed height of the resource in CSS pixels (positive integer).
 * - width: Displayed width of the resource in CSS pixels (positive integer).
 * - name: Name of the browsing context (string).
 *
 * @extends TinyHtmlTemplate<HTMLObjectElement>
 */
class TinyHtmlObject extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlObject instance.
   *
   * @param {Object} config - Configuration object.
   * @param {string} [config.data=""] - The URL of the resource to embed.
   * @param {string} [config.type=""] - The MIME type of the resource.
   * @param {string} [config.form] - The ID of a <form> element in the same document.
   * @param {number} [config.height] - Height of the displayed resource, in CSS pixels (positive integer).
   * @param {number} [config.width] - Width of the displayed resource, in CSS pixels (positive integer).
   * @param {string} [config.name] - Name of the browsing context or control.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""]
   *
   * @throws {TypeError} If `data` or `type` are not strings.
   * @throws {Error} If neither `data` nor `type` is provided.
   * @throws {TypeError} If `form` is not a non-empty string.
   * @throws {TypeError} If `height` or `width` are not positive integers.
   * @throws {TypeError} If `name` is not a non-empty string.
   */
  constructor({ data = '', type = '', form, height, width, name, tags = [], mainClass = '' } = {}) {
    super(document.createElement('object'), tags, mainClass);

    // At least one of data or type must be defined
    if (!data && !type)
      throw new Error('TinyHtmlObject: At least one of "data" or "type" must be provided.');

    // data
    if (data !== '') {
      if (typeof data !== 'string')
        throw new TypeError(`TinyHtmlObject: "data" must be a string. Got: ${typeof data}`);
      this.setAttr('data', data);
    }

    // type
    if (type !== '') {
      if (typeof type !== 'string')
        throw new TypeError(`TinyHtmlObject: "type" must be a string. Got: ${typeof type}`);
      this.setAttr('type', type);
    }

    // form
    if (form !== undefined) {
      if (typeof form !== 'string' || !form.trim())
        throw new TypeError('TinyHtmlObject: "form" must be a non-empty string (form id).');
      this.setAttr('form', form);
    }

    // height
    if (height !== undefined) {
      if (!Number.isInteger(height) || height <= 0)
        throw new TypeError('TinyHtmlObject: "height" must be a positive integer (CSS pixels).');
      this.setAttr('height', String(height));
    }

    // width
    if (width !== undefined) {
      if (!Number.isInteger(width) || width <= 0)
        throw new TypeError('TinyHtmlObject: "width" must be a positive integer (CSS pixels).');
      this.setAttr('width', String(width));
    }

    // name
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim())
        throw new TypeError('TinyHtmlObject: "name" must be a non-empty string.');
      this.setAttr('name', name);
    }
  }

  // === Getters ===
  /** @returns {string|null} */
  getData() {
    return this.attr('data');
  }

  /** @returns {string|null} */
  getType() {
    return this.attr('type');
  }

  /** @returns {string|null} */
  getForm() {
    return this.attr('form');
  }

  /** @returns {number|null} */
  getHeight() {
    const val = this.attr('height');
    return val ? parseInt(val, 10) : null;
  }

  /** @returns {number|null} */
  getWidth() {
    const val = this.attr('width');
    return val ? parseInt(val, 10) : null;
  }

  /** @returns {string|null} */
  getName() {
    return this.attr('name');
  }

  // === Setters ===
  /**
   * @param {string} url
   * @returns {this}
   */
  setData(url) {
    if (typeof url !== 'string') throw new TypeError('setData: "url" must be a string.');
    this.setAttr('data', url);
    return this;
  }

  /**
   * @param {string} type
   * @returns {this}
   */
  setType(type) {
    if (typeof type !== 'string') throw new TypeError('setType: "type" must be a string.');
    this.setAttr('type', type);
    return this;
  }

  /**
   * @param {string} formId
   * @returns {this}
   */
  setForm(formId) {
    if (typeof formId !== 'string' || !formId.trim())
      throw new TypeError('setForm: "formId" must be a non-empty string.');
    this.setAttr('form', formId);
    return this;
  }

  /**
   * @param {number} h
   * @returns {this}
   */
  setHeight(h) {
    if (!Number.isInteger(h) || h <= 0)
      throw new TypeError('setHeight: "h" must be a positive integer.');
    this.setAttr('height', String(h));
    return this;
  }

  /**
   * @param {number} w
   * @returns {this}
   */
  setWidth(w) {
    if (!Number.isInteger(w) || w <= 0)
      throw new TypeError('setWidth: "w" must be a positive integer.');
    this.setAttr('width', String(w));
    return this;
  }

  /**
   * @param {string} n
   * @returns {this}
   */
  setName(n) {
    if (typeof n !== 'string' || !n.trim())
      throw new TypeError('setName: "n" must be a non-empty string.');
    this.setAttr('name', n);
    return this;
  }
}

export default TinyHtmlObject;
