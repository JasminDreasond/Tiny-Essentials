import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyForm is a lightweight helper class for managing <form> elements.
 * It simplifies form creation with attributes like action, method, and enctype.
 *
 * @example
 * const form = new TinyForm({ action: '/submit', method: 'post' });
 *
 * @extends TinyHtmlTemplate<HTMLFormElement>
 */
class TinyHtmlForm extends TinyHtmlTemplate {
  /**
   * Creates a new TinyForm instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.action=""] - The form submission URL.
   * @param {'get'|'post'} [config.method="get"] - HTTP method ("get" or "post").
   * @param {string} [config.enctype] - Form encoding type.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass='']
   */
  constructor({ action = '', method = 'get', enctype, tags = [], mainClass = '' }) {
    super(document.createElement('form'), tags, mainClass);

    const normalized = method.toLowerCase();
    if (normalized !== 'get' && normalized !== 'post')
      throw new TypeError('TinyForm: "method" must be "get" or "post".');

    this.setAttr('method', normalized);

    if (typeof action !== 'string') throw new TypeError('TinyForm: "action" must be a string.');
    if (enctype !== undefined && typeof enctype !== 'string')
      throw new TypeError('TinyForm: "enctype" must be a string.');
    if (action) this.setAttr('action', action);
    if (enctype) this.setAttr('enctype', enctype);
  }

  /**
   * Programmatically submits the form.
   * @returns {this}
   */
  submit() {
    this.elements.forEach((element) =>
      element instanceof HTMLFormElement ? element.submit() : null,
    );
    return this;
  }

  /**
   * Resets the form.
   * @returns {this}
   */
  reset() {
    this.elements.forEach((element) =>
      element instanceof HTMLFormElement ? element.reset() : null,
    );
    return this;
  }
}

export default TinyHtmlForm;
