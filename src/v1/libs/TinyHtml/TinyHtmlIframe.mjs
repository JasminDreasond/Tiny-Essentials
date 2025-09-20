import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyIframe is a helper for creating <iframe> elements with full attribute support.
 *
 * @example
 * const iframe = new TinyHtmlIframe({
 *   src: 'https://example.com',
 *   width: 600,
 *   height: 400,
 *   loading: 'lazy',
 *   sandbox: 'allow-scripts allow-same-origin',
 *   referrerpolicy: 'no-referrer',
 * });
 *
 * @extends TinyHtmlTemplate<HTMLIFrameElement>
 */
class TinyHtmlIframe extends TinyHtmlTemplate {
  /**
   * Creates a new TinyIframe instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.src] - The iframe source URL.
   * @param {string} [config.srcdoc]
   * @param {string} [config.name]
   * @param {string} [config.allow]
   * @param {boolean} [config.allowpaymentrequest]
   * @param {boolean} [config.browsingtopics]
   * @param {boolean} [config.credentialless]
   * @param {string} [config.csp]
   * @param {string} [config.sandbox]
   * @param {'no-referrer'|'no-referrer-when-downgrade'|'origin'|'origin-when-cross-origin'|'same-origin'|'strict-origin'|'strict-origin-when-cross-origin'|'unsafe-url'} [config.referrerpolicy]
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
    srcdoc,
    width,
    height,
    title,
    name,
    loading,
    allow,
    allowFullScreen = false,
    allowpaymentrequest, // deprecated
    browsingtopics,
    credentialless,
    csp,
    referrerpolicy,
    sandbox,
    tags = [],
    mainClass = '',
  } = {}) {
    super(document.createElement('iframe'), tags, mainClass);

    // src
    if (src !== undefined) {
      if (typeof src !== 'string') throw new TypeError('TinyIframe: "src" must be a string.');
      this.setAttr('src', src);
    }

    // srcdoc
    if (srcdoc !== undefined) {
      if (typeof srcdoc !== 'string') throw new TypeError('TinyIframe: "srcdoc" must be a string.');
      this.setAttr('srcdoc', srcdoc);
    }

    // width/height
    if (width !== undefined) {
      if (typeof width !== 'number' && typeof width !== 'string')
        throw new TypeError('TinyIframe: "width" must be a number or string.');
      this.setAttr('width', String(width));
    }
    if (height !== undefined) {
      if (typeof height !== 'number' && typeof height !== 'string')
        throw new TypeError('TinyIframe: "height" must be a number or string.');
      this.setAttr('height', String(height));
    }

    // title
    if (title !== undefined) {
      if (typeof title !== 'string') throw new TypeError('TinyIframe: "title" must be a string.');
      this.setAttr('title', title);
    }

    // name
    if (name !== undefined) {
      if (typeof name !== 'string') throw new TypeError('TinyIframe: "name" must be a string.');
      this.setAttr('name', name);
    }

    // loading
    if (loading !== undefined) {
      if (!['lazy', 'eager'].includes(loading))
        throw new TypeError('TinyIframe: "loading" must be "lazy" or "eager".');
      this.setAttr('loading', loading);
    }

    // allow
    if (allow !== undefined) {
      if (typeof allow !== 'string') throw new TypeError('TinyIframe: "allow" must be a string.');
      this.setAttr('allow', allow);
    }

    // allowfullscreen (legacy)
    if (typeof allowFullScreen !== 'boolean')
      throw new TypeError('TinyIframe: "allowFullScreen" must be a boolean.');
    if (allowFullScreen) this.addProp('allowfullscreen');

    // allowpaymentrequest (deprecated)
    if (allowpaymentrequest !== undefined) {
      console.warn('TinyIframe: "allowpaymentrequest" is deprecated. Use allow="payment" instead.');
      if (typeof allowpaymentrequest !== 'boolean')
        throw new TypeError('TinyIframe: "allowpaymentrequest" must be a boolean.');
      if (allowpaymentrequest) this.setAttr('allowpaymentrequest', '');
    }

    // browsingtopics (experimental)
    if (browsingtopics !== undefined) {
      if (typeof browsingtopics !== 'boolean')
        throw new TypeError('TinyIframe: "browsingtopics" must be a boolean.');
      if (browsingtopics) this.addProp('browsingtopics');
    }

    // credentialless (experimental)
    if (credentialless !== undefined) {
      if (typeof credentialless !== 'boolean')
        throw new TypeError('TinyIframe: "credentialless" must be a boolean.');
      if (credentialless) this.addProp('credentialless');
    }

    // csp (experimental)
    if (csp !== undefined) {
      if (typeof csp !== 'string') throw new TypeError('TinyIframe: "csp" must be a string.');
      this.setAttr('csp', csp);
    }

    // referrerpolicy
    if (referrerpolicy !== undefined) {
      const valid = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'unsafe-url',
      ];
      if (!valid.includes(referrerpolicy))
        throw new TypeError(`TinyIframe: "referrerpolicy" must be one of: ${valid.join(', ')}.`);
      this.setAttr('referrerpolicy', referrerpolicy);
    }

    // sandbox
    if (sandbox !== undefined) {
      if (typeof sandbox !== 'string')
        throw new TypeError('TinyIframe: "sandbox" must be a string (space-separated tokens).');
      this.setAttr('sandbox', sandbox);
    }
  }

  // --- helpers ---

  /**
   * Sets the iframe source URL.
   * @param {string} src
   * @returns {this}
   */
  setSrc(src) {
    if (typeof src !== 'string') throw new TypeError('TinyIframe.setSrc: "src" must be a string.');
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
    if (typeof name !== 'string')
      throw new TypeError('TinyIframe.setName: "name" must be a string.');
    this.setAttr('name', name);
    return this;
  }

  /** @returns {string} */
  getName() {
    return this.attr('name') ?? '';
  }

  /**
   * @param {string} value
   */
  setSandbox(value) {
    if (typeof value !== 'string')
      throw new TypeError('TinyIframe.setSandbox: "value" must be a string.');
    this.setAttr('sandbox', value);
    return this;
  }

  /** @returns {string} */
  getSandbox() {
    return this.attr('sandbox') ?? '';
  }

  /**
   * @param {string} value
   */
  setAllow(value) {
    if (typeof value !== 'string')
      throw new TypeError('TinyIframe.setAllow: "value" must be a string.');
    this.setAttr('allow', value);
    return this;
  }

  /** @returns {string} */
  getAllow() {
    return this.attr('allow') ?? '';
  }

  /**
   * @param {boolean} enable
   */
  enableFullscreen(enable = true) {
    if (typeof enable !== 'boolean')
      throw new TypeError('TinyIframe.enableFullscreen: "enable" must be a boolean.');
    if (enable) this.addProp('allowfullscreen');
    else this.removeAttr('allowfullscreen');
    return this;
  }
}

export default TinyHtmlIframe;
