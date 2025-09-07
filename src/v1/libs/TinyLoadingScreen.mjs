/**
 * Represents the possible states of the loading screen.
 * - `'none'` → Not visible
 * - `'fadeIn'` → Appearing with fade-in animation
 * - `'active'` → Fully visible and active
 * - `'fadeOut'` → Disappearing with fade-out animation
 * @typedef {'none'|'active'|'fadeIn'|'fadeOut'} LoadingStatus
 */

/**
 * Configuration options for the loading screen.
 * @typedef {Object} LoadingSettings
 * @property {number|null} fadeIn - Duration of fade-in animation in milliseconds, or `null` to disable.
 * @property {number|null} fadeOut - Duration of fade-out animation in milliseconds, or `null` to disable.
 * @property {number} zIndex - CSS z-index of the overlay element.
 */

/**
 * TinyLoadingScreen
 *
 * A lightweight, fully-configurable loading overlay component that can be appended to any HTMLElement.
 *
 * Key features:
 * - Configurable fadeIn/fadeOut durations (milliseconds) and zIndex.
 * - Accepts string or HTMLElement messages.
 * - Optionally allows HTML inside string messages when `allowHtmlText` is enabled.
 * - Exposes `overlay`, `messageElement`, `status`, `options` and helpers for testing and integration.
 *
 * @class
 */
class TinyLoadingScreen {
  /** @type {HTMLDivElement|null} Overlay container element */
  #overlay = null;

  /** @returns {HTMLDivElement|null} The overlay element if active, otherwise `null`. */
  get overlay() {
    return this.#overlay;
  }

  /** @type {HTMLDivElement|null} Element containing the loading message */
  #messageElement = null;

  /** @returns {HTMLDivElement|null} The element used to render the message, or `null` if inactive. */
  get messageElement() {
    return this.#messageElement;
  }

  /** @type {HTMLElement} Container where the overlay will be attached */
  #container;

  /** @returns {HTMLElement} The container element that holds the overlay. */
  get container() {
    return this.#container;
  }

  /** @type {LoadingSettings} Internal configuration */
  #options = { fadeIn: null, fadeOut: null, zIndex: 9999 };

  /** @returns {LoadingSettings} A copy of the current configuration options. */
  get options() {
    return { ...this.#options };
  }

  /**
   * Updates the loading screen options.
   * @param {LoadingSettings} value - New configuration values.
   * @throws {TypeError} If any option has an invalid type or value.
   */
  set options(value) {
    if (typeof value !== 'object' || value === null)
      throw new TypeError('options must be an object');
    if (value.fadeIn !== null && (typeof value.fadeIn !== 'number' || value.fadeIn < 0))
      throw new TypeError('fadeIn must be a non-negative number or null');
    if (value.fadeOut !== null && (typeof value.fadeOut !== 'number' || value.fadeOut < 0))
      throw new TypeError('fadeOut must be a non-negative number or null');
    if (typeof value.zIndex !== 'number' || !Number.isInteger(value.zIndex))
      throw new TypeError('zIndex must be an integer number');

    this.#options = { ...value };
  }

  /** @type {LoadingStatus} Current status of the loading screen */
  #status = 'none';

  /** @returns {LoadingStatus} The current loading screen status. */
  get status() {
    return this.#status;
  }

  /** @type {string|HTMLElement} Default message shown when no custom message is provided */
  #defaultMessage = '';

  /** @returns {string|HTMLElement} The default message. */
  get defaultMessage() {
    return this.#defaultMessage;
  }

  /**
   * @param {string|HTMLElement} value - New default message.
   * @throws {TypeError} If the value is neither a string nor an HTMLElement.
   */
  set defaultMessage(value) {
    if (typeof value !== 'string' && !(value instanceof HTMLElement))
      throw new TypeError('defaultMessage must be a string or an HTMLElement');
    this.#defaultMessage = value;
  }

  /** @type {string|HTMLElement|null} Current active message */
  #message = null;

  /** @returns {string|HTMLElement|null} The currently displayed message. */
  get message() {
    return this.#message;
  }

  /** @type {boolean} Whether HTML is allowed in string messages */
  #allowHtmlText = false;

  /** @returns {boolean} True if HTML is allowed inside string messages. */
  get allowHtmlText() {
    return this.#allowHtmlText;
  }

  /**
   * Enables or disables HTML rendering in string messages.
   * @param {boolean} value - Whether to allow HTML.
   * @throws {TypeError} If value is not a boolean.
   */
  set allowHtmlText(value) {
    if (typeof value !== 'boolean') throw new TypeError('allowHtmlText must be a boolean');
    this.#allowHtmlText = value;
  }

  /** @type {NodeJS.Timeout|null} Timeout handler for fadeIn */
  #fadeInTimeout = null;

  /** @returns {boolean} Whether a fadeIn timeout is currently pending. */
  get fadeInTimeout() {
    return this.#fadeInTimeout !== null;
  }

  /** @type {NodeJS.Timeout|null} Timeout handler for fadeOut */
  #fadeOutTimeout = null;

  /** @returns {boolean} Whether a fadeOut timeout is currently pending. */
  get fadeOutTimeout() {
    return this.#fadeOutTimeout !== null;
  }

  /** @returns {boolean} True if the overlay is currently visible. */
  get visible() {
    return !!this.#overlay;
  }

  /**
   * Creates a new TinyLoadingScreen instance.
   * @param {HTMLElement} [container=document.body] - The container element where the overlay should be appended.
   * @param {{ fadeIn?: number, fadeOut?: number, zIndex?: number }} [options={}] - Initial configuration options.
   * @throws {TypeError} If container is not an HTMLElement or options is not an object.
   */
  constructor(container = document.body, options = {}) {
    if (!(container instanceof HTMLElement))
      throw new TypeError('container must be an HTMLElement');
    if (typeof options !== 'object' || options === null)
      throw new TypeError('options must be an object');

    this.#container = container;
    this.options = {
      fadeIn: options.fadeIn ?? null,
      fadeOut: options.fadeOut ?? null,
      zIndex: options.zIndex ?? 9999,
    };
  }

  /**
   * Internal helper to update the displayed message.
   * @param {string|HTMLElement} [message=this.#defaultMessage] - The new message.
   * @throws {TypeError} If the message is not a string or HTMLElement.
   * @throws {Error} If trying to use HTMLElement without allowHtmlText enabled.
   * @private
   */
  _updateMessage(message = this.#defaultMessage) {
    if (!this.#messageElement) throw new Error('messageElement is not initialized');
    if (typeof message !== 'string' && !(message instanceof HTMLElement))
      throw new TypeError('message must be a string or an HTMLElement');

    this.#message = message;

    if (typeof message === 'string') {
      if (!this.#allowHtmlText) this.#messageElement.textContent = message;
      else this.#messageElement.innerHTML = message;
    } else {
      if (!this.#allowHtmlText)
        throw new Error('HTMLElement messages require allowHtmlText = true');
      this.#messageElement.textContent = '';
      this.#messageElement.appendChild(message);
    }
  }

  /**
   * Starts the loading screen or updates its message if already active.
   * @param {string|HTMLElement} [message=this.#defaultMessage] - Message to display.
   * @returns {boolean} `true` if the overlay was created, `false` if only the message was updated.
   * @throws {TypeError} If message is not a string or HTMLElement.
   */
  start(message = this.#defaultMessage) {
    if (typeof message !== 'string' && !(message instanceof HTMLElement))
      throw new TypeError('message must be a string or an HTMLElement');

    if (!this.#overlay) {
      this.#overlay = document.createElement('div');
      this.#overlay.classList.add('loading-overlay');
      this.#overlay.style.zIndex = String(this.#options.zIndex);

      const content = document.createElement('div');
      content.classList.add('loading-content');

      const spinner = document.createElement('div');
      spinner.classList.add('loading-spinner');

      this.#messageElement = document.createElement('div');
      this.#messageElement.classList.add('loading-message');

      content.appendChild(spinner);
      content.appendChild(this.#messageElement);
      this.#overlay.appendChild(content);
      this.#container.appendChild(this.#overlay);

      // trigger fade in
      this.#status = 'fadeIn';
      this.#overlay.classList.add('fadeIn');
      const fadeIn = () => {
        this.#fadeInTimeout = null;
        this.#status = 'active';
        this.#overlay?.classList.remove('fadeIn');
        this.#overlay?.classList.add('active');
      };

      if (typeof this.#options.fadeIn === 'number') {
        if (this.#fadeInTimeout) clearTimeout(this.#fadeInTimeout);
        this.#fadeInTimeout = setTimeout(fadeIn, this.#options.fadeIn);
      } else fadeIn();

      this._updateMessage(message);
      return true;
    }

    if (this.#messageElement) this._updateMessage(message);
    return false;
  }

  /**
   * Updates the loading screen with a new message.
   * @param {string|HTMLElement} [message=this.#defaultMessage] - The new message.
   * @returns {boolean} `true` if the message was updated, `false` if overlay is not active.
   * @throws {TypeError} If message is not a string or HTMLElement.
   */
  update(message = this.#defaultMessage) {
    if (typeof message !== 'string' && !(message instanceof HTMLElement))
      throw new TypeError('message must be a string or an HTMLElement');

    if (this.#messageElement) {
      this._updateMessage(message);
      return true;
    }
    return false;
  }

  /**
   * Stops and removes the loading screen.
   * @returns {boolean} `true` if the overlay was removed, `false` if not active.
   */
  stop() {
    if (this.#overlay) {
      this.#status = 'fadeOut';
      this.#overlay.classList.remove('active');
      this.#overlay.classList.add('fadeOut');

      // trigger fade out
      const fadeOut = () => {
        this.#fadeOutTimeout = null;
        this.#status = 'none';
        this.#overlay?.remove();
        this.#overlay = null;
        this.#messageElement = null;
        this.#message = null;
      };

      if (typeof this.#options.fadeOut === 'number') {
        if (this.#fadeOutTimeout) clearTimeout(this.#fadeOutTimeout);
        this.#fadeOutTimeout = setTimeout(fadeOut, this.#options.fadeOut);
      } else fadeOut();

      return true;
    }
    return false;
  }
}

export default TinyLoadingScreen;
