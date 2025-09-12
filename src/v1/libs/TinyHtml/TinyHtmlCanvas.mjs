import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyCanvas is a helper for <canvas> elements,
 * providing a direct way to configure its size and retrieve the rendering context.
 *
 * @extends TinyHtmlTemplate<HTMLCanvasElement>
 */
class TinyHtmlCanvas extends TinyHtmlTemplate {
  /**
   * Creates a new TinyCanvas instance.
   * @param {Object} config
   * @param {number} [config.width=300] - Canvas width in pixels.
   * @param {number} [config.height=150] - Canvas height in pixels.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass=""]
   */
  constructor({ width, height, tags = [], mainClass = '' } = {}) {
    super(document.createElement('canvas'), tags, mainClass);

    if (typeof width !== 'number')
      throw new TypeError(`TinyCanvas: 'width' must be a number. Got: ${typeof width}`);
    if (typeof height !== 'number')
      throw new TypeError(`TinyCanvas: 'height' must be a number. Got: ${typeof height}`);

    this.setAttr('width', width);
    this.setAttr('height', height);
  }

  /**
   * Gets the 2D rendering context or another supported context.
   * @param {string} [type="2d"]
   * @param {any} [options={}]
   * @returns {RenderingContext|null}
   */
  getContext(type = '2d', options = {}) {
    if (typeof type !== 'string')
      throw new TypeError(`getContext: 'type' must be a string. Got: ${typeof type}`);

    const el = this.get(0);
    if (!(el instanceof HTMLCanvasElement)) return null;
    return el.getContext(type, options);
  }
}

export default TinyHtmlCanvas;
