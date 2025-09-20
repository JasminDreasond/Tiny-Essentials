import TinyHtmlInput from '../../TinyHtmlInput.mjs';

/**
 * TinyButtonInput is a helper for managing <input type="button"> elements.
 */
class TinyHtmlButtonInput extends TinyHtmlInput {
  /**
   * Creates a new TinyButtonInput instance.
   * @param {Object} config
   * @param {string} [config.name]
   * @param {string} [config.placeholder]
   * @param {string} [config.popovertarget] - ID of popover (button type).
   * @param {"show"|"hide"|"toggle"} [config.popovertargetaction] - Action for popover.
   * @param {string} [config.value='Button'] - The text displayed on the button.
   * @param {boolean} [config.readonly] - Whether input is readonly.
   * @param {boolean} [config.required] - Whether input is required.
   * @param {string|string[]|Set<string>} [config.tags=[]] - CSS classes to apply.
   * @param {string} [config.mainClass=''] - Main CSS class applied.
   */
  constructor({
    value = 'Button',
    tags = [],
    placeholder,
    popovertarget,
    popovertargetaction,
    readonly,
    required,
    name,
    mainClass = '',
  }) {
    super({ name, placeholder, type: 'button', tags, mainClass, readonly, required });

    if (value !== undefined && typeof value !== 'string' && typeof value !== 'number')
      throw new TypeError('TinyHtmlInput: "value" must be a string or number.');
    if (value !== undefined) this.setAttr('value', value);

    // --- popovertarget / popovertargetaction ---
    if (popovertarget !== undefined) {
      if (typeof popovertarget !== 'string')
        throw new TypeError("TinyHtmlButtonInput: 'popovertarget' must be a string.");
      this.setAttr('popovertarget', popovertarget);
    }

    if (popovertargetaction !== undefined) {
      const allowed = ['show', 'hide', 'toggle'];
      if (!allowed.includes(popovertargetaction))
        throw new Error(`"popovertargetaction" must be one of ${allowed.join(', ')}.`);
      this.setAttr('popovertargetaction', popovertargetaction);
    }
  }
}

export default TinyHtmlButtonInput;
