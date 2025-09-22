import TinyHtml from '../TinyHtml.mjs';
import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlAnchor is a helper class for managing <a> elements.
 * It provides strongly-typed getters and setters for attributes like href,
 * target, rel, hreflang, referrerpolicy, and more.
 *
 * @example
 * const link = new TinyHtmlAnchor({
 *   href: 'https://example.com',
 *   label: 'Visit Example',
 *   target: '_blank',
 *   rel: 'noopener noreferrer'
 * });
 *
 * @extends TinyHtmlTemplate<HTMLAnchorElement>
 */
class TinyHtmlAnchor extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlAnchor instance.
   * @param {Object} config - Configuration object.
   * @param {string} config.href - Link URL (required).
   * @param {string|Element|TinyHtml<any>} [config.label] - Link text or HTML.
   * @param {string} [config.target] - Target attribute.
   * @param {string} [config.rel] - Relationship of the linked resource.
   * @param {string} [config.hreflang] - Language of the linked resource.
   * @param {string|string[]} [config.ping] - URLs to send pings to.
   * @param {'no-referrer'|'no-referrer-when-downgrade'|'origin'|'origin-when-cross-origin'|'same-origin'|'strict-origin'|'strict-origin-when-cross-origin'|'unsafe-url'} [config.referrerpolicy] - Referrer policy.
   * @param {string} [config.type] - MIME type of the linked resource.
   * @param {boolean|string|string[]} [config.attributionsrc] - Enables Attribution Reporting.
   * @param {string|boolean} [config.download] - Download filename (or boolean to enable).
   * @param {boolean} [config.allowHtml=false] - Whether to allow HTML inside the link.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=''] - Main CSS class.
   * @throws {TypeError} If any attribute is invalid.
   */
  constructor({
    href,
    label,
    target,
    rel,
    hreflang,
    ping,
    referrerpolicy,
    type,
    attributionsrc,
    download,
    allowHtml = false,
    tags = [],
    mainClass = '',
  }) {
    super(document.createElement('a'), tags, mainClass);

    if (typeof href !== 'string' || !href.trim())
      throw new TypeError('TinyHtmlAnchor: "href" must be a non-empty string.');
    this.href = href;

    if (target !== undefined) this.target = target;
    if (rel !== undefined) this.rel = rel;
    if (hreflang !== undefined) this.hreflang = hreflang;
    if (ping !== undefined) this.ping = ping;
    if (referrerpolicy !== undefined) this.referrerpolicy = referrerpolicy;
    if (type !== undefined) this.type = type;
    if (attributionsrc !== undefined) this.attributionsrc = attributionsrc;
    if (download !== undefined) this.download = download;

    if (typeof allowHtml !== 'boolean')
      throw new TypeError('TinyHtmlAnchor: "allowHtml" must be a boolean.');

    if (label !== undefined) this.setLabel(label, allowHtml);
  }

  /** @param {string} href */
  set href(href) {
    if (typeof href !== 'string' || !href.trim())
      throw new TypeError('TinyHtmlAnchor: "href" must be a non-empty string.');
    this.setAttr('href', href);
  }
  /** @returns {string|null} */
  get href() {
    return this.attrString('href');
  }

  /** @param {string} target */
  set target(target) {
    if (typeof target !== 'string')
      throw new TypeError('TinyHtmlAnchor: "target" must be a string.');
    this.setAttr('target', target);
  }
  /** @returns {string|null} */
  get target() {
    return this.attrString('target');
  }

  /** @param {string} rel */
  set rel(rel) {
    if (typeof rel !== 'string')
      throw new TypeError('TinyHtmlAnchor: "rel" must be a string.');
    this.setAttr('rel', rel);
  }
  /** @returns {string|null} */
  get rel() {
    return this.attrString('rel');
  }

  /** @param {string} hreflang */
  set hreflang(hreflang) {
    if (typeof hreflang !== 'string')
      throw new TypeError('TinyHtmlAnchor: "hreflang" must be a string.');
    this.setAttr('hreflang', hreflang);
  }
  /** @returns {string|null} */
  get hreflang() {
    return this.attrString('hreflang');
  }

  /** @param {string|string[]} ping */
  set ping(ping) {
    if (Array.isArray(ping)) ping = ping.join(' ');
    if (typeof ping !== 'string')
      throw new TypeError('TinyHtmlAnchor: "ping" must be a string or string[].');
    this.setAttr('ping', ping);
  }
  /** @returns {string|null} */
  get ping() {
    return this.attrString('ping');
  }

  /** @param {'no-referrer'|'no-referrer-when-downgrade'|'origin'|'origin-when-cross-origin'|'same-origin'|'strict-origin'|'strict-origin-when-cross-origin'|'unsafe-url'} referrerpolicy */
  set referrerpolicy(referrerpolicy) {
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
      throw new TypeError(
        `TinyHtmlAnchor: "referrerpolicy" must be one of: ${valid.join(', ')}`
      );
    this.setAttr('referrerpolicy', referrerpolicy);
  }
  /** @returns {string|null} */
  get referrerpolicy() {
    return this.attrString('referrerpolicy');
  }

  /** @param {string} type */
  set type(type) {
    if (typeof type !== 'string')
      throw new TypeError('TinyHtmlAnchor: "type" must be a string (MIME type).');
    this.setAttr('type', type);
  }
  /** @returns {string|null} */
  get type() {
    return this.attrString('type');
  }

  /** @param {boolean|string|string[]} attributionsrc */
  set attributionsrc(attributionsrc) {
    if (attributionsrc === true) {
      this.addProp('attributionsrc');
    } else if (typeof attributionsrc === 'string') {
      this.setAttr('attributionsrc', attributionsrc);
    } else if (Array.isArray(attributionsrc)) {
      this.setAttr('attributionsrc', attributionsrc.join(' '));
    } else {
      throw new TypeError(
        'TinyHtmlAnchor: "attributionsrc" must be a boolean, string, or string[].'
      );
    }
  }
  /** @returns {string|null} */
  get attributionsrc() {
    return this.attrString('attributionsrc');
  }

  /** @param {string|boolean} download */
  set download(download) {
    if (typeof download !== 'string' && typeof download !== 'boolean')
      throw new TypeError('TinyHtmlAnchor: "download" must be a string or boolean.');
    if (typeof download === 'string') this.setAttr('download', download);
    else if (download) this.addProp('download');
    else this.removeProp('download');
  }
  /** @returns {string|boolean|null} */
  get download() {
    if (this.hasProp('download')) {
      return true;
    }
    return this.attrString('download');
  }

  /**
   * Updates the link label with text, HTML, or an element.
   *
   * @param {string|Element|TinyHtml<any>} label - The new label to set.
   * @param {boolean} [allowHtml=false] - Whether to allow raw HTML or DOM elements instead of plain text.
   * @returns {this}
   */
  setLabel(label, allowHtml = false) {
    if (typeof label === 'string') {
      if (!allowHtml) this.setText(label);
      else this.setHtml(label);
    } else if (label instanceof Element || label instanceof TinyHtml) {
      if (!allowHtml)
        throw new Error('setLabel: Passing an Element/TinyHtml requires allowHtml=true.');
      this.empty().append(label);
    } else {
      throw new TypeError(
        "setLabel: 'label' must be a string, Element, or TinyHtml instance."
      );
    }
    return this;
  }
}

export default TinyHtmlAnchor;
