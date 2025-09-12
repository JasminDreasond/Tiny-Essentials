import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyIcon is a lightweight helper class for managing icon-like elements
 * (such as `<i>` or `<span>` tags) with class-based styling.
 * It extends TinyHtml to provide direct DOM element manipulation.
 *
 * @extends TinyHtmlTemplate<HTMLElement>
 */
class TinyHtmlIcon extends TinyHtmlTemplate {
  /** @type {string} */
  static #defaultTag = 'i';

  /** @returns {string} */
  get defaultTag() {
    return TinyHtmlIcon.#defaultTag;
  }

  /** @param {string} value */
  set defaultTag(value) {
    if (typeof value !== 'string') throw new TypeError('defaultTag must be a string');
    TinyHtmlIcon.#defaultTag = value;
  }

  /**
   * Creates a new TinyIcon instance.
   * @param {string|string[]|Set<string>} tags - Initial icon classes to apply.
   * @param {string} [tagName=TinyHtmlIcon.#defaultTag] - The HTML tag to use for the element (e.g., `i`, `span`).
   */
  constructor(tags, tagName = TinyHtmlIcon.#defaultTag) {
    super(document.createElement(tagName), tags);
  }
}

export default TinyHtmlIcon;
