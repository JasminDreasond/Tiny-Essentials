import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyLink is a lightweight helper class for managing <a> elements.
 * It allows setting href, target, and link text or HTML.
 *
 * @example
 * const link = new TinyLink({ href: 'https://puddy.club', label: 'Visit Puddy Club' });
 *
 * @extends TinyHtmlTemplate<HTMLAnchorElement>
 */
class TinyHtmlLink extends TinyHtmlTemplate {
  /**
   * Creates a new TinyLink instance.
   * @param {Object} config - Configuration object.
   * @param {string} config.href - Link URL.
   * @param {string} [config.label] - Link text or HTML.
   * @param {string} [config.target="_self"] - Target attribute.
   * @param {boolean} [config.allowHtml=false] - Whether to allow HTML inside the link.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ href, label, target = '_self', allowHtml = false, tags = [], mainClass = '' }) {
    super(document.createElement('a'), tags, mainClass);
    if (typeof href !== 'string' || !href.trim())
      throw new TypeError(`TinyLink: 'href' must be a non-empty string. Got: ${href}`);

    this.setAttr('href', href);
    this.setAttr('target', target);

    if (label) {
      if (allowHtml) this.setHtml(label);
      else this.setText(label);
    }
  }
}

export default TinyHtmlLink;
