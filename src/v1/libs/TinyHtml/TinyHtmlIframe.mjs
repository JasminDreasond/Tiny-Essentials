import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyIframe is a helper for creating <iframe> elements.
 *
 * @example
 * const iframe = new TinyIframe({ src: 'https://example.com', width: 600, height: 400 });
 *
 * @extends TinyHtmlTemplate<HTMLIFrameElement>
 */
class TinyHtmlIframe extends TinyHtmlTemplate {
  /**
   * Creates a new TinyIframe instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.src] - The iframe source URL.
   * @param {number|string} [config.width] - Width in pixels or CSS string.
   * @param {number|string} [config.height] - Height in pixels or CSS string.
   * @param {string} [config.title] - Accessible title for the iframe.
   * @param {boolean} [config.allowFullScreen=false] - Whether fullscreen is allowed.
   * @param {string} [config.loading="lazy"] - Loading mode ("lazy" or "eager").
   * @param {string|string[]|Set<string>} [config.tags=[]] - CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({
    src,
    width,
    height,
    title,
    allowFullScreen = false,
    loading = 'lazy',
    tags = [],
    mainClass = '',
  }) {
    super(document.createElement('iframe'), tags, mainClass);

    if (src) this.setAttr('src', src);
    if (width) this.setAttr('width', width);
    if (height) this.setAttr('height', height);
    if (title) this.setAttr('title', title);
    if (loading) this.setAttr('loading', loading);
    if (allowFullScreen) this.setAttr('allowfullscreen', 'true');
  }

  /**
   * Sets the iframe source URL.
   * @param {string} src
   * @returns {this}
   */
  setSrc(src) {
    this.setAttr('src', src);
    return this;
  }

  /**
   * Gets the iframe source URL.
   * @returns {string}
   */
  getSrc() {
    return this.attr('src') ?? '';
  }

  /**
   * @param {string} name
   */
  setName(name) {
    this.setAttr('name', name);
    return this;
  }

  getName() {
    return this.attr('name');
  }

  /**
   * @param {string} value
   */
  setSandbox(value) {
    this.setAttr('sandbox', value);
    return this;
  }

  getSandbox() {
    return this.attr('sandbox');
  }

  /**
   * @param {string} value
   */
  setAllow(value) {
    this.setAttr('allow', value);
    return this;
  }

  getAllow() {
    return this.attr('allow');
  }

  /**
   * @param {boolean} enable
   */
  enableFullscreen(enable = true) {
    if (enable) this.setAttr('allowfullscreen', 'true');
    else this.removeAttr('allowfullscreen');
    return this;
  }
}

export default TinyHtmlIframe;
