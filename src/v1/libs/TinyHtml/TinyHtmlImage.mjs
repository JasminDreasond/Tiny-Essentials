import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyImage is a helper class for managing <img> elements.
 * It allows setting the image source, alt text, and dimensions with validation.
 *
 * @example
 * const img = new TinyImage({ src: '/logo.png', alt: 'Logo', width: 200 });
 *
 * @extends TinyHtmlTemplate<HTMLImageElement>
 */
class TinyHtmlImage extends TinyHtmlTemplate {
  /** @type {boolean} */
  static fetchMode = false;

  /** @type {boolean} */
  #fetchMode;

  /**
   * Creates a new TinyImage instance.
   * @param {Object} config - Configuration object.
   * @param {string} config.src - Image source URL.
   * @param {string} [config.alt=""] - Alternate text for the image.
   * @param {number} [config.width] - Width in pixels.
   * @param {number} [config.height] - Height in pixels.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {boolean} [config.fetchMode=TinyImage.fetchMode]
   * @param {string} [config.mainClass='']
   */
  constructor({
    src,
    alt = '',
    width,
    height,
    tags = [],
    mainClass = '',
    fetchMode = TinyHtmlImage.fetchMode,
  }) {
    super(document.createElement('img'), tags, mainClass);
    if (typeof src !== 'string') throw new TypeError('TinyImage: "src" must be a string.');
    if (alt !== undefined && typeof alt !== 'string')
      throw new TypeError('TinyImage: "alt" must be a string.');
    if (width !== undefined && typeof width !== 'number')
      throw new TypeError('TinyImage: "width" must be a number.');
    if (height !== undefined && typeof height !== 'number')
      throw new TypeError('TinyImage: "height" must be a number.');
    if (typeof fetchMode !== 'boolean')
      throw new TypeError('TinyImage: "fetchMode" must be a boolean.');

    this.setAttr('src', src);
    if (alt) this.setAttr('alt', alt);
    if (width) this.setAttr('width', width);
    if (height) this.setAttr('height', height);
    this.#fetchMode = fetchMode;
  }
}

export default TinyHtmlImage;
