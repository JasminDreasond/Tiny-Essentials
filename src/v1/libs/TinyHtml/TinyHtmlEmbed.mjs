import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlEmbed is a helper class for creating and managing <embed> elements,
 * typically used to embed external interactive content or media such as PDFs or plugins.
 *
 * Supported attributes:
 * - `src`: The URL of the resource being embedded.
 * - `type`: The MIME type used to select the plug-in to instantiate.
 * - `width`: Display width in CSS pixels (absolute value, no percentages).
 * - `height`: Display height in CSS pixels (absolute value, no percentages).
 *
 * @example
 * const embed = new TinyHtmlEmbed({
 *   src: '/docs/sample.pdf',
 *   type: 'application/pdf',
 *   width: 800,
 *   height: 600,
 * });
 *
 * @extends TinyHtmlTemplate<HTMLEmbedElement>
 */
class TinyHtmlEmbed extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlEmbed instance.
   *
   * @param {Object} [config={}] - Configuration object.
   * @param {string} [config.src=""] - The resource URL to embed.
   * @param {string} [config.type=""] - The MIME type of the resource (e.g. "application/pdf").
   * @param {number|string} [config.width] - Width in CSS pixels. Must be an absolute value (no percentages).
   * @param {number|string} [config.height] - Height in CSS pixels. Must be an absolute value (no percentages).
   * @param {string|string[]|Set<string>} [config.tags=[]] - CSS classes to apply.
   * @param {string} [config.mainClass=""] - Main CSS class.
   *
   * @throws {TypeError} If `src` is not a string.
   * @throws {TypeError} If `type` is not a string.
   * @throws {TypeError} If `width` is provided and is not a number or string.
   * @throws {TypeError} If `height` is provided and is not a number or string.
   */
  constructor({ src = '', type = '', width, height, tags = [], mainClass = '' } = {}) {
    super(document.createElement('embed'), tags, mainClass);

    if (typeof src !== 'string')
      throw new TypeError(`TinyHtmlEmbed: "src" must be a string. Got: ${typeof src}`);
    if (typeof type !== 'string')
      throw new TypeError(`TinyHtmlEmbed: "type" must be a string. Got: ${typeof type}`);
    if (width !== undefined && typeof width !== 'number' && typeof width !== 'string')
      throw new TypeError(
        `TinyHtmlEmbed: "width" must be a number or string. Got: ${typeof width}`,
      );
    if (height !== undefined && typeof height !== 'number' && typeof height !== 'string')
      throw new TypeError(
        `TinyHtmlEmbed: "height" must be a number or string. Got: ${typeof height}`,
      );

    if (src) this.setAttr('src', src);
    if (type) this.setAttr('type', type);
    if (width) this.setAttr('width', width);
    if (height) this.setAttr('height', height);
  }

  /** @returns {string|null} */
  getSrc() {
    return this.attr('src');
  }

  /** @returns {string|null} */
  getType() {
    return this.attr('type');
  }

  /** @returns {string|null} */
  getWidth() {
    return this.attr('width');
  }

  /** @returns {string|null} */
  getHeight() {
    return this.attr('height');
  }

  /**
   * @param {string} url
   * @returns {this}
   */
  setSrc(url) {
    if (typeof url !== 'string')
      throw new TypeError(`setSrc: "url" must be a string. Got: ${typeof url}`);
    this.setAttr('src', url);
    return this;
  }

  /**
   * @param {string} type
   * @returns {this}
   */
  setType(type) {
    if (typeof type !== 'string')
      throw new TypeError(`setType: "type" must be a string. Got: ${typeof type}`);
    this.setAttr('type', type);
    return this;
  }

  /**
   * @param {number|string} width
   * @returns {this}
   */
  setWidth(width) {
    if (typeof width !== 'number' && typeof width !== 'string')
      throw new TypeError(`setWidth: "width" must be a number or string. Got: ${typeof width}`);
    this.setAttr('width', width);
    return this;
  }

  /**
   * @param {number|string} height
   * @returns {this}
   */
  setHeight(height) {
    if (typeof height !== 'number' && typeof height !== 'string')
      throw new TypeError(`setHeight: "height" must be a number or string. Got: ${typeof height}`);
    this.setAttr('height', height);
    return this;
  }
}

export default TinyHtmlEmbed;
