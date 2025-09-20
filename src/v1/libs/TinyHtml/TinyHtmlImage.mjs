import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyImage is a helper class for managing <img> elements.
 * It supports modern attributes like srcset, sizes, decoding, fetchpriority,
 * as well as width, height, alt, crossorigin, loading, and more.
 *
 * @example
 * const img = new TinyHtmlImage({
 *   src: '/logo.png',
 *   alt: 'Logo',
 *   width: 200,
 *   height: 100,
 *   loading: 'lazy',
 *   decoding: 'async',
 * });
 *
 * @extends TinyHtmlTemplate<HTMLImageElement>
 */
class TinyHtmlImage extends TinyHtmlTemplate {
  /** @type {boolean} */
  static #defaultFetchMode = false;

  /** @returns {boolean} */
  static get defaultFetchMode() {
    return TinyHtmlImage.#defaultFetchMode;
  }

  /** @param {boolean} value */
  static set defaultFetchMode(value) {
    if (typeof value !== 'boolean')
      throw new TypeError('Expected a boolean value for defaultFetchMode');
    TinyHtmlImage.#defaultFetchMode = value;
  }

  /** @type {boolean} */
  #fetchMode;

  /** @returns {boolean} */
  get fetchMode() {
    return this.#fetchMode;
  }

  /**
   * Creates a new TinyImage instance.
   * @param {Object} config - Configuration object.
   * @param {string} config.src - Image source URL (required).
   * @param {string} [config.alt=""] - Alternate text for the image.
   * @param {number} [config.width] - Width in pixels.
   * @param {number} [config.height] - Height in pixels.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {boolean} [config.fetchMode=TinyHtmlImage.#fetchMode]
   * @param {string} [config.mainClass='']
   * @param {string|string[]|boolean} [config.attributionsrc]
   * @param {'anonymous'|'use-credentials'} [config.crossorigin]
   * @param {'sync'|'async'|'auto'} [config.decoding]
   * @param {string} [config.elementtiming]
   * @param {'high'|'low'|'auto'} [config.fetchpriority]
   * @param {boolean} [config.ismap=false]
   * @param {'eager'|'lazy'} [config.loading]
   * @param {string} [config.referrerpolicy]
   * @param {string} [config.sizes]
   * @param {string} [config.srcset]
   * @param {string} [config.usemap]
   */
  constructor({
    src,
    alt,
    width,
    height,
    tags = [],
    mainClass = '',
    fetchMode = TinyHtmlImage.#defaultFetchMode,
    attributionsrc,
    crossorigin,
    decoding,
    elementtiming,
    fetchpriority,
    ismap = false,
    loading,
    referrerpolicy,
    sizes,
    srcset,
    usemap,
  }) {
    super(document.createElement('img'), tags, mainClass);

    // required
    if (typeof src !== 'string') throw new TypeError('TinyImage: "src" must be a string.');
    this.setAttr('src', src);

    // alt
    if (alt !== undefined) {
      if (typeof alt !== 'string') throw new TypeError('TinyImage: "alt" must be a string.');
      this.setAttr('alt', alt);
    }

    // width/height
    if (width !== undefined) {
      if (!Number.isInteger(width)) throw new TypeError('TinyImage: "width" must be an integer.');
      this.setAttr('width', String(width));
    }
    if (height !== undefined) {
      if (!Number.isInteger(height)) throw new TypeError('TinyImage: "height" must be an integer.');
      this.setAttr('height', String(height));
    }

    // attributionsrc
    if (attributionsrc !== undefined) {
      if (typeof attributionsrc === 'boolean') {
        if (attributionsrc) this.addProp('attributionsrc');
      } else if (typeof attributionsrc === 'string' || Array.isArray(attributionsrc)) {
        const value = Array.isArray(attributionsrc) ? attributionsrc.join(',') : attributionsrc;
        this.setAttr('attributionsrc', value);
      } else
        throw new TypeError(
          'TinyImage: "attributionsrc" must be a boolean, string, or array of strings.',
        );
    }

    // crossorigin
    if (crossorigin !== undefined) {
      if (!['anonymous', 'use-credentials'].includes(crossorigin))
        throw new TypeError('TinyImage: "crossorigin" must be "anonymous" or "use-credentials".');
      this.setAttr('crossorigin', crossorigin);
    }

    // decoding
    if (decoding !== undefined) {
      if (!['sync', 'async', 'auto'].includes(decoding))
        throw new TypeError('TinyImage: "decoding" must be "sync", "async" or "auto".');
      this.setAttr('decoding', decoding);
    }

    // elementtiming
    if (elementtiming !== undefined) {
      if (typeof elementtiming !== 'string')
        throw new TypeError('TinyImage: "elementtiming" must be a string.');
      this.setAttr('elementtiming', elementtiming);
    }

    // fetchpriority
    if (fetchpriority !== undefined) {
      if (!['high', 'low', 'auto'].includes(fetchpriority))
        throw new TypeError('TinyImage: "fetchpriority" must be "high", "low" or "auto".');
      this.setAttr('fetchpriority', fetchpriority);
    }

    // ismap
    if (typeof ismap !== 'boolean') throw new TypeError('TinyImage: "ismap" must be a boolean.');
    if (ismap) this.addProp('ismap');

    // loading
    if (loading !== undefined) {
      if (!['eager', 'lazy'].includes(loading))
        throw new TypeError('TinyImage: "loading" must be "eager" or "lazy".');
      this.setAttr('loading', loading);
    }

    // referrerpolicy
    if (referrerpolicy !== undefined) {
      if (typeof referrerpolicy !== 'string')
        throw new TypeError('TinyImage: "referrerpolicy" must be a string.');
      this.setAttr('referrerpolicy', referrerpolicy);
    }

    // sizes
    if (sizes !== undefined) {
      if (typeof sizes !== 'string') throw new TypeError('TinyImage: "sizes" must be a string.');
      this.setAttr('sizes', sizes);
    }

    // srcset
    if (srcset !== undefined) {
      if (typeof srcset !== 'string') throw new TypeError('TinyImage: "srcset" must be a string.');
      this.setAttr('srcset', srcset);
    }

    // usemap
    if (usemap !== undefined) {
      if (typeof usemap !== 'string') throw new TypeError('TinyImage: "usemap" must be a string.');
      this.setAttr('usemap', usemap);
    }

    // fetchMode (custom internal flag)
    if (typeof fetchMode !== 'boolean')
      throw new TypeError('TinyImage: "fetchMode" must be a boolean.');
    this.#fetchMode = fetchMode;
  }
}

export default TinyHtmlImage;
