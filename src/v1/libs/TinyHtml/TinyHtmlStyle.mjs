import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlStyle is a lightweight helper class for managing <style> elements.
 * It provides a simple API to configure attributes like `media`, `nonce`,
 * `blocking`, and `title`, while extending TinyHtmlTemplate for DOM operations.
 *
 * @example
 * const style = new TinyHtmlStyle({
 *   media: 'screen and (max-width: 600px)',
 *   blocking: 'render',
 * });
 * style.setContent('body { background: pink; }');
 *
 * @extends TinyHtmlTemplate<HTMLStyleElement>
 */
class TinyHtmlStyle extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlStyle instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.blocking=""] - Space-separated list of blocking tokens (currently only `"render"` is valid).
   * @param {string} [config.media="all"] - Media query that the stylesheet applies to. Defaults to `"all"`.
   * @param {string} [config.nonce=""] - Cryptographic nonce used in Content-Security-Policy for inline styles.
   * @param {string} [config.title=""] - Specifies an alternate style sheet set.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""] - Main CSS class to apply.
   */
  constructor({
    blocking = '',
    media = 'all',
    nonce = '',
    title = '',
    tags = [],
    mainClass = '',
  } = {}) {
    super(document.createElement('style'), tags, mainClass);

    // Validation for blocking (only "render" is allowed)
    if (blocking !== undefined) {
      if (typeof blocking !== 'string') {
        throw new TypeError('TinyHtmlStyle: "blocking" must be a string.');
      }
      const validTokens = ['render'];
      const tokens = blocking.trim().split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        if (!validTokens.includes(token)) {
          throw new Error(
            `TinyHtmlStyle: invalid blocking token "${token}". Only "render" is allowed.`,
          );
        }
      }
      if (tokens.length) this.setAttr('blocking', tokens.join(' '));
    }

    // Validation for media
    if (media !== undefined) {
      if (typeof media !== 'string') {
        throw new TypeError('TinyHtmlStyle: "media" must be a string.');
      }
      if (media.trim()) this.setAttr('media', media.trim());
    }

    // Validation for nonce
    if (nonce !== undefined) {
      if (typeof nonce !== 'string') {
        throw new TypeError('TinyHtmlStyle: "nonce" must be a string.');
      }
      if (nonce.trim()) this.setAttr('nonce', nonce.trim());
    }

    // Validation for title
    if (title !== undefined) {
      if (typeof title !== 'string') {
        throw new TypeError('TinyHtmlStyle: "title" must be a string.');
      }
      if (title.trim()) this.setAttr('title', title.trim());
    }
  }

  /**
   * Sets the content (CSS rules) of the <style> element.
   * @param {string} cssText - CSS string.
   * @returns {this}
   */
  setContent(cssText) {
    if (typeof cssText !== 'string') {
      throw new TypeError('TinyHtmlStyle.setContent: "cssText" must be a string.');
    }
    this.elements.forEach((el) =>
      el instanceof HTMLStyleElement ? (el.textContent = cssText) : null,
    );
    return this;
  }

  /**
   * Gets the content (CSS rules) of the <style> element.
   * @returns {string}
   */
  getContent() {
    const first = this.elements[0];
    return first instanceof HTMLStyleElement ? (first.textContent ?? '') : '';
  }
}

export default TinyHtmlStyle;
