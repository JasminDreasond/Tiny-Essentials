import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyEmbed is a helper class for <embed> elements,
 * typically used to embed external interactive content or media.
 *
 * @extends TinyHtmlTemplate<HTMLEmbedElement>
 */
class TinyHtmlEmbed extends TinyHtmlTemplate {
  /**
   * Creates a new TinyEmbed instance.
   * @param {Object} config
   * @param {string} [config.src=""] - The resource URL to embed.
   * @param {string} [config.type=""] - MIME type of the resource.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass=""]
   */
  constructor({ src = '', type = '', tags = [], mainClass = '' } = {}) {
    super(document.createElement('embed'), tags, mainClass);
    if (src) this.setAttr('src', src);
    if (type) this.setAttr('type', type);
  }

  /**
   * Gets the embed source URL.
   * @returns {string|null} url
   */
  getSrc() {
    return this.attr('src');
  }

  /**
   * Gets the MIME type for the embedded content.
   * @returns {string|null} type
   */
  getType() {
    return this.attr('type');
  }

  /**
   * Sets the embed source URL.
   * @param {string} url
   * @returns {this}
   */
  setSrc(url) {
    this.setAttr('src', url);
    return this;
  }

  /**
   * Sets the MIME type for the embedded content.
   * @param {string} type
   * @returns {this}
   */
  setType(type) {
    this.setAttr('type', type);
    return this;
  }
}

export default TinyHtmlEmbed;
