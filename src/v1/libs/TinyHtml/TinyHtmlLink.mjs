import TinyHtml from '../TinyHtml.mjs';
import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyLink is a lightweight helper class for managing <a> elements.
 * It allows setting href, target, and link text or HTML.
 *
 * @extends TinyHtmlTemplate<HTMLAnchorElement>
 */
class TinyHtmlLink extends TinyHtmlTemplate {
  /**
   * Creates a new TinyLink instance.
   * @param {Object} config - Configuration object.
   * @param {string} config.href - Link URL.
   * @param {string|Element|TinyHtml<any>} [config.label] - Link text or HTML.
   * @param {string} [config.target=""] - Target attribute.
   * @param {string} [config.rel] - Relationship of the linked resource.
   * @param {string} [config.hreflang] - Language of the linked resource.
   * @param {string|string[]} [config.ping] - URLs to send pings to.
   * @param {'no-referrer'|'no-referrer-when-downgrade'|'origin'|'origin-when-cross-origin'|'same-origin'|'strict-origin'|'strict-origin-when-cross-origin'|'unsafe-url'} [config.referrerpolicy] - Referrer policy.
   * @param {string} [config.type] - MIME type of the linked resource.
   * @param {boolean|string|string[]} [config.attributionsrc] - Enables Attribution Reporting.
   * @param {string|boolean} [config.download] - Download filename (or empty string to just enable).
   * @param {boolean} [config.allowHtml=false] - Whether to allow HTML inside the link.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({
    href,
    label,
    target = '',
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

    // href
    if (typeof href !== 'string' || !href.trim())
      throw new TypeError('TinyLink: "href" must be a non-empty string.');
    this.setAttr('href', href);

    // target
    if (typeof target !== 'string') throw new TypeError('TinyLink: "target" must be a string.');
    if (target) this.setAttr('target', target);

    // rel
    if (rel !== undefined) {
      if (typeof rel !== 'string') throw new TypeError('TinyLink: "rel" must be a string.');
      this.setAttr('rel', rel);
    }

    // hreflang
    if (hreflang !== undefined) {
      if (typeof hreflang !== 'string')
        throw new TypeError('TinyLink: "hreflang" must be a string.');
      this.setAttr('hreflang', hreflang);
    }

    // ping
    if (ping !== undefined) {
      if (Array.isArray(ping)) ping = ping.join(' ');
      if (typeof ping !== 'string')
        throw new TypeError('TinyLink: "ping" must be a string or string[].');
      this.setAttr('ping', ping);
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
        throw new TypeError(`TinyLink: "referrerpolicy" must be one of: ${valid.join(', ')}`);
      this.setAttr('referrerpolicy', referrerpolicy);
    }

    // type
    if (type !== undefined) {
      if (typeof type !== 'string')
        throw new TypeError('TinyLink: "type" must be a string (MIME type).');
      this.setAttr('type', type);
    }

    // attributionsrc
    if (attributionsrc !== undefined) {
      if (attributionsrc === true) {
        this.setAttr('attributionsrc', '');
      } else if (typeof attributionsrc === 'string') {
        this.setAttr('attributionsrc', attributionsrc);
      } else if (Array.isArray(attributionsrc)) {
        this.setAttr('attributionsrc', attributionsrc.join(' '));
      } else {
        throw new TypeError('TinyLink: "attributionsrc" must be a boolean, string, or string[].');
      }
    }

    // download
    if (download !== undefined) {
      if (typeof download !== 'string' && typeof download !== 'boolean')
        throw new TypeError('TinyLink: "download" must be a string or boolean.');
      if (typeof download === 'string') this.setAttr('download', download);
      else if (download) this.addProp('download');
    }

    // allowHtml
    if (typeof allowHtml !== 'boolean')
      throw new TypeError('TinyLink: "allowHtml" must be a boolean.');

    // label
    if (label) this.setLabel(label, allowHtml);
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
    } else
      throw new TypeError("setLabel: 'label' must be a string, Element, or TinyHtml instance.");
    return this;
  }
}

export default TinyHtmlLink;
