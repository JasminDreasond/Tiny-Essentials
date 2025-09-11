import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyCanvas is a helper for <canvas> elements,
 * providing a direct way to configure its size and retrieve the rendering context.
 */
class TinyCanvas extends TinyHtmlTemplate {
  /**
   * Creates a new TinyCanvas instance.
   * @param {Object} config
   * @param {number} [config.width=300] - Canvas width in pixels.
   * @param {number} [config.height=150] - Canvas height in pixels.
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass=""]
   */
  constructor({ width = 300, height = 150, tags = [], mainClass = '' } = {}) {
    super('canvas', tags, mainClass);
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
    const el = this.get(0);
    if (!(el instanceof HTMLCanvasElement)) return null;
    return el.getContext(type, options);
  }
}

export default TinyCanvas;
