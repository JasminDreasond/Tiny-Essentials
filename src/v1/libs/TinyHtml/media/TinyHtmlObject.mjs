import TinyHtmlTemplate from '../TinyHtmlTemplate.mjs';

/**
 * TinyObject is a lightweight helper class for managing <object> elements,
 * commonly used to embed external resources like PDFs, HTML, or SVGs.
 *
 * @extends TinyHtmlTemplate<HTMLObjectElement>
 */
class TinyHtmlObject extends TinyHtmlTemplate {
  /**
   * Creates a new TinyObject instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.data=""] - The URL of the resource to embed.
   * @param {string} [config.type=""] - The MIME type of the resource.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""]
   */
  constructor({ data = '', type = '', tags = [], mainClass = '' }) {
    super(document.createElement('object'), tags, mainClass);
    if (data) this.setAttr('data', data);
    if (type) this.setAttr('type', type);
  }

  /**
   * Gets the embedded resource URL.
   * @returns {string|null}
   */
  getData() {
    return this.attr('data');
  }

  /**
   * Gets the MIME type of the resource.
   * @returns {string|null}
   */
  getType() {
    return this.attr('type');
  }

  /**
   * Sets the embedded resource URL.
   * @param {string} url
   * @returns {this}
   */
  setData(url) {
    this.setAttr('data', url);
    return this;
  }

  /**
   * Sets the MIME type of the resource.
   * @param {string} type
   * @returns {this}
   */
  setType(type) {
    this.setAttr('type', type);
    return this;
  }
}

export default TinyHtmlObject;
