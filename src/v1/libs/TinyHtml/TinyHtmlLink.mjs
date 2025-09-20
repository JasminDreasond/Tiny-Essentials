import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlLink is a lightweight helper class for managing <link> elements.
 * It provides a strict API for configuring preload, stylesheets, icons,
 * and other external resource references.
 *
 * @example
 * const link = new TinyHtmlLink({
 *   rel: 'stylesheet',
 *   href: '/styles/main.css',
 *   media: 'screen',
 *   blocking: 'render',
 * });
 *
 * document.head.appendChild(link.el);
 *
 * @extends TinyHtmlTemplate<HTMLLinkElement>
 */
class TinyHtmlLink extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlLink instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.as] - Type of content being loaded (valid only for preload/modulepreload).
   * @param {string} [config.blocking] - Blocking behavior (only "render").
   * @param {string} [config.crossorigin] - CORS mode ("anonymous" or "use-credentials").
   * @param {boolean} [config.disabled=false] - Whether the stylesheet is disabled (rel=stylesheet only).
   * @param {string} [config.fetchpriority="auto"] - Fetch priority ("high", "low", "auto").
   * @param {string} [config.href] - URL of the linked resource.
   * @param {string} [config.hreflang] - Language of the linked resource (RFC 5646).
   * @param {string} [config.imagesizes] - Sizes attribute for preload images.
   * @param {string} [config.imagesrcset] - Srcset attribute for preload images.
   * @param {string} [config.integrity] - Subresource Integrity metadata.
   * @param {string} [config.media="all"] - Media query (mainly for stylesheets).
   * @param {string} [config.referrerpolicy] - Referrer policy ("no-referrer", etc.).
   * @param {string} [config.rel] - Relationship (stylesheet, preload, icon, etc.).
   * @param {string} [config.sizes] - Icon sizes.
   * @param {string} [config.title] - Title (alternate stylesheet sets).
   * @param {string} [config.type] - MIME type of the resource (e.g., "text/css").
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""] - Main CSS class.
   */
  constructor({
    as,
    blocking,
    crossorigin,
    disabled = false,
    fetchpriority = 'auto',
    href,
    hreflang,
    imagesizes,
    imagesrcset,
    integrity,
    media = 'all',
    referrerpolicy,
    rel,
    sizes,
    title,
    type,
    tags = [],
    mainClass = '',
  } = {}) {
    super(document.createElement('link'), tags, mainClass);

    // rel (required in practice)
    if (rel !== undefined) {
      if (typeof rel !== 'string' || !rel.trim()) {
        throw new TypeError('TinyHtmlLink: "rel" must be a non-empty string.');
      }
      this.setAttr('rel', rel.trim());
    }

    // as
    if (as !== undefined) {
      const validAs = [
        'audio',
        'document',
        'embed',
        'fetch',
        'font',
        'image',
        'object',
        'script',
        'style',
        'track',
        'video',
        'worker',
      ];
      if (typeof as !== 'string' || !validAs.includes(as)) {
        throw new Error(`TinyHtmlLink: "as" must be one of ${validAs.join(', ')}. Got: ${as}`);
      }
      this.setAttr('as', as);
    }

    // blocking
    if (blocking !== undefined) {
      if (blocking !== 'render') {
        throw new Error('TinyHtmlLink: "blocking" only accepts "render".');
      }
      this.setAttr('blocking', 'render');
    }

    // crossorigin
    if (crossorigin !== undefined) {
      const validCORS = ['anonymous', 'use-credentials'];
      if (!validCORS.includes(crossorigin)) {
        throw new Error(`TinyHtmlLink: "crossorigin" must be one of ${validCORS.join(', ')}.`);
      }
      this.setAttr('crossorigin', crossorigin);
    }

    // disabled
    if (typeof disabled !== 'boolean')
      throw new TypeError('TinyHtmlButton: "disabled" must be a boolean.');
    if (disabled) this.addProp('disabled');

    // fetchpriority
    if (fetchpriority !== undefined) {
      const validPriorities = ['auto', 'high', 'low'];
      if (!validPriorities.includes(fetchpriority)) {
        throw new Error(
          `TinyHtmlLink: "fetchpriority" must be one of ${validPriorities.join(', ')}.`,
        );
      }
      this.setAttr('fetchpriority', fetchpriority);
    }

    // href
    if (href !== undefined) {
      if (typeof href !== 'string') {
        throw new TypeError('TinyHtmlLink: "href" must be a string.');
      }
      this.setAttr('href', href);
    }

    // hreflang
    if (hreflang !== undefined) {
      if (typeof hreflang !== 'string') {
        throw new TypeError('TinyHtmlLink: "hreflang" must be a string.');
      }
      this.setAttr('hreflang', hreflang);
    }

    // imagesizes
    if (imagesizes !== undefined) {
      if (typeof imagesizes !== 'string') {
        throw new TypeError('TinyHtmlLink: "imagesizes" must be a string.');
      }
      this.setAttr('imagesizes', imagesizes);
    }

    // imagesrcset
    if (imagesrcset !== undefined) {
      if (typeof imagesrcset !== 'string') {
        throw new TypeError('TinyHtmlLink: "imagesrcset" must be a string.');
      }
      this.setAttr('imagesrcset', imagesrcset);
    }

    // integrity
    if (integrity !== undefined) {
      if (typeof integrity !== 'string') {
        throw new TypeError('TinyHtmlLink: "integrity" must be a string.');
      }
      this.setAttr('integrity', integrity);
    }

    // media
    if (media !== undefined) {
      if (typeof media !== 'string') {
        throw new TypeError('TinyHtmlLink: "media" must be a string.');
      }
      if (media.trim()) this.setAttr('media', media.trim());
    }

    // referrerpolicy
    if (referrerpolicy !== undefined) {
      const validPolicies = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'unsafe-url',
      ];
      if (!validPolicies.includes(referrerpolicy)) {
        throw new Error(
          `TinyHtmlLink: "referrerpolicy" must be one of ${validPolicies.join(', ')}.`,
        );
      }
      this.setAttr('referrerpolicy', referrerpolicy);
    }

    // sizes
    if (sizes !== undefined) {
      if (typeof sizes !== 'string') {
        throw new TypeError('TinyHtmlLink: "sizes" must be a string.');
      }
      this.setAttr('sizes', sizes);
    }

    // title
    if (title !== undefined) {
      if (typeof title !== 'string') {
        throw new TypeError('TinyHtmlLink: "title" must be a string.');
      }
      this.setAttr('title', title);
    }

    // type
    if (type !== undefined) {
      if (typeof type !== 'string') {
        throw new TypeError('TinyHtmlLink: "type" must be a string.');
      }
      this.setAttr('type', type);
    }
  }

  /**
   * Sets the href of the link.
   * @param {string} url
   * @returns {this}
   */
  setHref(url) {
    if (typeof url !== 'string') {
      throw new TypeError('TinyHtmlLink.setHref: "url" must be a string.');
    }
    this.setAttr('href', url);
    return this;
  }

  /**
   * Gets the href of the link.
   * @returns {string|null}
   */
  getHref() {
    return this.attr('href');
  }
}

export default TinyHtmlLink;
