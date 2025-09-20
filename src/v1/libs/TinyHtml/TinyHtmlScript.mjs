import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlScript is a helper class for creating and managing <script> elements.
 * Supports both inline and external scripts, with attributes for async, defer, modules, etc.
 *
 * @extends TinyHtmlTemplate<HTMLScriptElement>
 */
class TinyHtmlScript extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlScript instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.src] - URI of an external script.
   * @param {string} [config.type] - The type of script (e.g., "module", "importmap", "speculationrules", or JS MIME type).
   * @param {boolean} [config.async=false] - Whether the script should be executed asynchronously (requires src).
   * @param {boolean} [config.defer=false] - Whether the script should be deferred until after parsing (requires src).
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""] - Main CSS class.
   * @param {string} [config.content=""] - Inline script content (ignored if src is provided).
   * @param {string|string[]} [config.blocking] - Space-separated list of blocking tokens (currently only "render").
   * @param {string} [config.crossorigin] - CORS setting ("anonymous" or "use-credentials").
   * @param {string} [config.fetchpriority="auto"] - Fetch priority ("auto", "high", "low").
   * @param {string} [config.integrity] - Subresource integrity hash (only valid with src).
   * @param {boolean} [config.nomodule=false] - Whether to prevent execution in browsers supporting modules.
   * @param {string} [config.nonce] - Cryptographic nonce for CSP.
   * @param {string} [config.referrerpolicy] - Referrer policy.
   * @param {boolean|string|string[]} [config.attributionsrc] - Boolean or list of URLs for attribution reporting.
   */
  constructor({
    src,
    type,
    async = false,
    defer = false,
    tags = [],
    mainClass = '',
    content = '',
    blocking,
    crossorigin,
    fetchpriority = 'auto',
    integrity,
    nomodule = false,
    nonce,
    referrerpolicy,
    attributionsrc,
  } = {}) {
    super(document.createElement('script'), tags, mainClass);

    // src
    if (src !== undefined) {
      if (typeof src !== 'string') throw new TypeError('TinyHtmlScript: "src" must be a string.');
      this.setAttr('src', src);
    }

    // type
    if (type !== undefined) {
      if (typeof type !== 'string') throw new TypeError('TinyHtmlScript: "type" must be a string.');
      this.setAttr('type', type);
    }

    // async / defer (only valid with src)
    if (async !== undefined) {
      if (typeof async !== 'boolean')
        throw new TypeError('TinyHtmlScript: "async" must be a boolean.');
      if (async) {
        if (!src) throw new Error('TinyHtmlScript: "async" requires a "src" attribute.');
        this.addProp('async');
      }
    }

    if (defer !== undefined) {
      if (typeof defer !== 'boolean')
        throw new TypeError('TinyHtmlScript: "defer" must be a boolean.');
      if (defer) {
        if (!src) throw new Error('TinyHtmlScript: "defer" requires a "src" attribute.');
        this.addProp('defer');
      }
    }

    // blocking
    if (blocking !== undefined) {
      const values = Array.isArray(blocking) ? blocking : String(blocking).trim().split(/\s+/);
      for (const v of values) {
        if (v !== 'render') throw new Error(`TinyHtmlScript: invalid blocking token "${v}".`);
      }
      this.setAttr('blocking', values.join(' '));
    }

    // crossorigin
    if (crossorigin !== undefined) {
      if (!['anonymous', 'use-credentials'].includes(crossorigin)) {
        throw new Error('TinyHtmlScript: "crossorigin" must be "anonymous" or "use-credentials".');
      }
      this.setAttr('crossorigin', crossorigin);
    }

    // fetchpriority
    if (!['auto', 'high', 'low'].includes(fetchpriority)) {
      throw new Error('TinyHtmlScript: "fetchpriority" must be "auto", "high", or "low".');
    }
    this.setAttr('fetchpriority', fetchpriority);

    // integrity (only with src)
    if (integrity !== undefined) {
      if (!src) throw new Error('TinyHtmlScript: "integrity" requires "src".');
      if (typeof integrity !== 'string')
        throw new TypeError('TinyHtmlScript: "integrity" must be a string.');
      this.setAttr('integrity', integrity);
    }

    // nomodule
    if (typeof nomodule !== 'boolean')
      throw new TypeError('TinyHtmlScript: "nomodule" must be a boolean.');
    if (nomodule) this.addProp('nomodule');

    // nonce
    if (nonce !== undefined) {
      if (typeof nonce !== 'string')
        throw new TypeError('TinyHtmlScript: "nonce" must be a string.');
      this.setAttr('nonce', nonce);
    }

    // referrerpolicy
    if (referrerpolicy !== undefined) {
      if (typeof referrerpolicy !== 'string')
        throw new TypeError('TinyHtmlScript: "referrerpolicy" must be a string.');
      this.setAttr('referrerpolicy', referrerpolicy);
    }

    // attributionsrc
    if (attributionsrc !== undefined) {
      if (attributionsrc === true) {
        this.addProp('attributionsrc');
      } else if (typeof attributionsrc === 'string') {
        this.setAttr('attributionsrc', attributionsrc);
      } else if (
        Array.isArray(attributionsrc) &&
        attributionsrc.every((v) => typeof v === 'string')
      ) {
        this.setAttr('attributionsrc', attributionsrc.join(' '));
      } else {
        throw new TypeError(
          'TinyHtmlScript: "attributionsrc" must be boolean, string, or string[].',
        );
      }
    }

    // inline content (only if no src)
    if (!src && content) {
      if (typeof content !== 'string')
        throw new TypeError('TinyHtmlScript: "content" must be a string.');
      this._preHtmlElem('TinyHtmlScript').textContent = content;
    }
  }

  /**
   * Updates inline script content.
   * @param {string} code - JavaScript code to set inside the script element.
   * @returns {this}
   */
  setContent(code) {
    if (typeof code !== 'string')
      throw new TypeError('TinyHtmlScript.setContent: "code" must be a string.');
    if (this.attr('src'))
      throw new Error(
        'TinyHtmlScript.setContent: Cannot set inline content when "src" is defined.',
      );
    this._preHtmlElem('setContent').textContent = code;
    return this;
  }
}

export default TinyHtmlScript;
