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
   * @param {boolean} [config.allowHtml=false] - Whether to allow HTML inside the link.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ href, label, target = '', allowHtml = false, tags = [], mainClass = '' }) {
    super(document.createElement('a'), tags, mainClass);
    if (typeof href !== 'string' || !href.trim())
      throw new TypeError('TinyLink: "href" must be a non-empty string.');

    if (typeof target !== 'string') throw new TypeError('TinyLink: "target" must be a string.');

    if (typeof allowHtml !== 'boolean')
      throw new TypeError('TinyLink: "allowHtml" must be a boolean.');

    this.setAttr('href', href);
    if (target) this.setAttr('target', target);
    if (label) this.setLabel(label, allowHtml);
  }

  /**
   * Updates the button label with text, HTML, or an element.
   *
   * @param {string|Element|TinyHtml<any>} label - The new label to set.
   * - If a string is provided:
   *   - By default, the string is set as plain text.
   *   - If `allowHtml` is true, the string is interpreted as raw HTML.
   * - If an Element or TinyHtml is provided:
   *   - It is appended as a child, but only if `allowHtml` is true.
   *   - Otherwise, an error is thrown.
   * @param {boolean} [allowHtml=false] - Whether to allow raw HTML or DOM elements instead of plain text.
   * @returns {this} Returns the current instance for chaining.
   * @throws {TypeError} If `label` is not a string, Element, or TinyHtml.
   * @throws {Error} If an Element/TinyHtml is passed but `allowHtml` is false.
   *
   * @example
   * btn.setLabel("Save"); // plain text
   * btn.setLabel("<b>Save</b>", true); // raw HTML
   * btn.setLabel(document.createElement("span"), true); // DOM element
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
