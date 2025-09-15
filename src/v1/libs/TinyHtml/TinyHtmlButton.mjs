import TinyHtml from '../TinyHtml.mjs';
import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlButton is a helper class for <button> elements with full attribute support and validation.
 * It extends TinyHtmlTemplate for direct DOM manipulation.
 *
 * Supported attributes:
 * - autofocus
 * - command, commandfor
 * - disabled
 * - form, formaction, formenctype, formmethod, formnovalidate, formtarget
 * - name
 * - popovertarget, popovertargetaction
 * - type (button|submit|reset)
 * - value
 *
 * @extends TinyHtmlTemplate<HTMLButtonElement>
 */
class TinyHtmlButton extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlButton instance.
   *
   * @param {Object} config - Configuration object for the button.
   * @param {string|Element|TinyHtml<any>} config.label - The text/HTML/element to place inside the button.
   *   If a non-string Element/TinyHtml is provided, `allowHtml` must be true.
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes to apply.
   * @param {boolean} [config.allowHtml=false] - Whether to allow HTML or DOM nodes as label.
   * @param {'button'|'submit'|'reset'} [config.type='button'] - Button type. Allowed values: "button", "submit", "reset".
   * @param {boolean} [config.autofocus=false] - Whether the button should autofocus on load.
   * @param {string} [config.command] - Command action (built-ins: "show-modal","close","request-close","show-popover","hide-popover","toggle-popover")
   *   or a custom command which MUST start with `--` (two hyphens).
   * @param {string} [config.commandfor] - ID of the element controlled by the command. Must be a non-empty string.
   * @param {boolean} [config.disabled=false] - Whether the button is disabled.
   * @param {string} [config.form] - ID of the associated <form>. Must be a non-empty string if provided.
   * @param {string} [config.formaction] - URL that overrides the form action when this button is used to submit.
   * @param {'application/x-www-form-urlencoded'|'multipart/form-data'|'text/plain'} [config.formenctype]
   *   - Encoding type used when the button submits the form.
   * @param {'get'|'post'|'dialog'} [config.formmethod] - HTTP method used for this button submission.
   * @param {boolean} [config.formnovalidate=false] - If true, disables validation when this button submits.
   * @param {string} [config.formtarget] - Target browsing context for this button's submission (keywords or name).
   * @param {string} [config.name] - Button name (sent with value when submitting).
   * @param {string} [config.popovertarget] - ID of the popover to control (non-empty string).
   * @param {'show'|'hide'|'toggle'} [config.popovertargetaction] - Action for popovertarget.
   * @param {string} [config.value] - Value submitted with the form when this button is used.
   * @param {string} [config.mainClass=''] - Main CSS class to append to the element.
   *
   * @throws {TypeError} If `label` is not a string, Element, or TinyHtml instance.
   * @throws {Error} If an Element/TinyHtml `label` is passed but `allowHtml` is false.
   * @throws {TypeError} If `type` is not one of "button", "submit", "reset".
   * @throws {TypeError} If `allowHtml` is not a boolean.
   * @throws {TypeError} If `autofocus`, `disabled` or `formnovalidate` are not booleans.
   * @throws {TypeError} If `command` is not a valid builtin command nor a custom `--*` token.
   * @throws {TypeError} If `commandfor`, `form`, `formaction`, `name`, `popovertarget`, or `value` are not strings.
   * @throws {TypeError} If `formenctype` is not one of the allowed encodings.
   * @throws {TypeError} If `formmethod` is not one of 'get','post','dialog'.
   * @throws {TypeError} If `formtarget` is not a valid keyword or browsing context name.
   */
  constructor({
    label,
    tags = [],
    allowHtml = false,
    type = 'button',
    autofocus = false,
    command,
    commandfor,
    disabled = false,
    form,
    formaction,
    formenctype,
    formmethod,
    formnovalidate = false,
    formtarget,
    name,
    popovertarget,
    popovertargetaction,
    value,
    mainClass = '',
  }) {
    super(document.createElement('button'), tags, mainClass);

    // === allowHtml validation ===
    if (typeof allowHtml !== 'boolean')
      throw new TypeError('TinyHtmlButton: "allowHtml" must be a boolean.');

    // === label validation (basic) ===
    if (label === undefined || label === null)
      throw new TypeError(
        'TinyHtmlButton: "label" is required and must be a string, Element or TinyHtml.',
      );
    if (typeof label !== 'string' && !(label instanceof Element) && !(label instanceof TinyHtml))
      throw new TypeError(
        'TinyHtmlButton: "label" must be a string, Element, or TinyHtml instance.',
      );

    // === type ===
    if (typeof type !== 'string') throw new TypeError('TinyHtmlButton: "type" must be a string.');
    const allowedTypes = ['button', 'submit', 'reset'];
    if (!allowedTypes.includes(type))
      throw new TypeError(`TinyHtmlButton: "type" must be one of: ${allowedTypes.join(', ')}.`);

    this.setAttr('type', type);

    // === autofocus / disabled / formnovalidate booleans ===
    if (typeof autofocus !== 'boolean')
      throw new TypeError('TinyHtmlButton: "autofocus" must be a boolean.');
    if (autofocus) this.addProp('autofocus');

    if (typeof disabled !== 'boolean')
      throw new TypeError('TinyHtmlButton: "disabled" must be a boolean.');
    if (disabled) this.addProp('disabled');

    if (typeof formnovalidate !== 'boolean')
      throw new TypeError('TinyHtmlButton: "formnovalidate" must be a boolean.');
    if (formnovalidate) this.addProp('formnovalidate');

    // === command ===
    if (command !== undefined) {
      if (typeof command !== 'string')
        throw new TypeError('TinyHtmlButton: "command" must be a string.');
      const builtins = [
        'show-modal',
        'close',
        'request-close',
        'show-popover',
        'hide-popover',
        'toggle-popover',
      ];
      const isCustom = command.startsWith('--');
      if (!builtins.includes(command) && !isCustom)
        throw new TypeError(
          'TinyHtmlButton: "command" must be one of the built-ins or a custom command starting with "--".',
        );
      this.setAttr('command', command);
    }

    // === commandfor ===
    if (commandfor !== undefined) {
      if (typeof commandfor !== 'string' || !commandfor.trim())
        throw new TypeError(
          'TinyHtmlButton: "commandfor" must be a non-empty string (element id).',
        );
      this.setAttr('commandfor', commandfor);
    }

    // === form-related attributes ===
    if (form !== undefined) {
      if (typeof form !== 'string' || !form.trim())
        throw new TypeError('TinyHtmlButton: "form" must be a non-empty string (form id).');
      this.setAttr('form', form);
    }

    if (formaction !== undefined) {
      if (typeof formaction !== 'string' || !formaction.trim())
        throw new TypeError('TinyHtmlButton: "formaction" must be a non-empty string (URL).');
      this.setAttr('formaction', formaction);
    }

    if (formenctype !== undefined) {
      const validEnctypes = [
        'application/x-www-form-urlencoded',
        'multipart/form-data',
        'text/plain',
      ];
      if (!validEnctypes.includes(formenctype))
        throw new TypeError(
          `TinyHtmlButton: "formenctype" must be one of: ${validEnctypes.join(', ')}.`,
        );
      this.setAttr('formenctype', formenctype);
    }

    if (formmethod !== undefined) {
      if (typeof formmethod !== 'string')
        throw new TypeError('TinyHtmlButton: "formmethod" must be a string.');
      const normalized = formmethod.toLowerCase();
      const valid = ['get', 'post', 'dialog'];
      if (!valid.includes(normalized))
        throw new TypeError(`TinyHtmlButton: "formmethod" must be one of: ${valid.join(', ')}.`);
      this.setAttr('formmethod', normalized);
    }

    if (formtarget !== undefined) {
      if (typeof formtarget !== 'string')
        throw new TypeError('TinyHtmlButton: "formtarget" must be a string.');
      const validTargets = ['_self', '_blank', '_parent', '_top', '_unfencedTop'];
      const validName = /^[a-zA-Z_][\w-]*$/;
      if (!validTargets.includes(formtarget) && !validName.test(formtarget))
        throw new TypeError(
          `TinyHtmlButton: "formtarget" must be a keyword (${validTargets.join(', ')}) or a valid browsing context name.`,
        );
      this.setAttr('formtarget', formtarget);
    }

    // === name ===
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '')
        throw new TypeError('TinyHtmlButton: "name" must be a non-empty string.');
      this.setAttr('name', name);
    }

    // === popover ===
    if (popovertarget !== undefined) {
      if (typeof popovertarget !== 'string' || !popovertarget.trim())
        throw new TypeError(
          'TinyHtmlButton: "popovertarget" must be a non-empty string (element id).',
        );
      this.setAttr('popovertarget', popovertarget);
    }

    if (popovertargetaction !== undefined) {
      const allowedActions = ['show', 'hide', 'toggle'];
      if (typeof popovertargetaction !== 'string' || !allowedActions.includes(popovertargetaction))
        throw new TypeError(
          `TinyHtmlButton: "popovertargetaction" must be one of ${allowedActions.join(', ')}.`,
        );
      this.setAttr('popovertargetaction', popovertargetaction);
    }

    // === value ===
    if (value !== undefined) {
      if (typeof value !== 'string')
        throw new TypeError('TinyHtmlButton: "value" must be a string.');
      this.setAttr('value', value);
    }

    // finally set the label (per allowHtml)
    this.setLabel(label, allowHtml);
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
    } else {
      throw new TypeError("setLabel: 'label' must be a string, Element, or TinyHtml instance.");
    }
    return this;
  }

  // -- small validated setters/getters for later changes --

  /** @param {string} val */
  setType(val) {
    if (typeof val !== 'string')
      throw new TypeError('TinyHtmlButton.setType: "type" must be a string.');
    const allowed = ['button', 'submit', 'reset'];
    if (!allowed.includes(val))
      throw new TypeError(`TinyHtmlButton.setType: type must be one of ${allowed.join(', ')}`);
    this.setAttr('type', val);
    return this;
  }

  /** @param {boolean} state */
  setDisabled(state) {
    if (typeof state !== 'boolean')
      throw new TypeError('TinyHtmlButton.setDisabled: value must be boolean.');
    if (state) this.addProp('disabled');
    else this.removeProp('disabled');
    return this;
  }

  /** @param {boolean} state */
  setAutofocus(state) {
    if (typeof state !== 'boolean')
      throw new TypeError('TinyHtmlButton.setAutofocus: value must be boolean.');
    if (state) this.addProp('autofocus');
    else this.removeProp('autofocus');
    return this;
  }

  /** @param {string} cmd */
  setCommand(cmd) {
    if (typeof cmd !== 'string')
      throw new TypeError('TinyHtmlButton.setCommand: "command" must be a string.');
    const builtins = [
      'show-modal',
      'close',
      'request-close',
      'show-popover',
      'hide-popover',
      'toggle-popover',
    ];
    if (!builtins.includes(cmd) && !cmd.startsWith('--'))
      throw new TypeError(
        'TinyHtmlButton.setCommand: invalid command. Use built-in or custom starting with "--".',
      );
    this.setAttr('command', cmd);
    return this;
  }

  /** @param {'get'|'post'|'dialog'} method */
  setFormMethod(method) {
    if (typeof method !== 'string')
      throw new TypeError('TinyHtmlButton.setFormMethod: must be a string.');
    const normalized = method.toLowerCase();
    const valid = ['get', 'post', 'dialog'];
    if (!valid.includes(normalized))
      throw new TypeError('TinyHtmlButton.setFormMethod: invalid method.');
    this.setAttr('formmethod', normalized);
    return this;
  }

  /** @param {'show'|'hide'|'toggle'} action */
  setPopovertargetAction(action) {
    const allowed = ['show', 'hide', 'toggle'];
    if (!allowed.includes(action))
      throw new TypeError('TinyHtmlButton.setPopovertargetAction: invalid action.');
    this.setAttr('popovertargetaction', action);
    return this;
  }

  // small property accessors
  get disabled() {
    return this.hasProp('disabled');
  }
  get type() {
    return this.attr('type');
  }
  get name() {
    return this.attr('name');
  }
}

export default TinyHtmlButton;
