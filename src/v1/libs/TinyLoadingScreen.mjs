/**
 * @typedef {'none'|'active'|'fadeIn'|'fadeOut'} LoadingStatus
 */

/**
 * @typedef {{ fadeIn: number|null, fadeOut: number|null, zIndex: number }} LoadingSettings
 */

class TinyLoadingScreen {
  /** @type {HTMLDivElement|null} */
  #overlay = null;

  /** @type {HTMLDivElement|null} */
  get overlay() {
    return this.#overlay;
  }

  /** @type {HTMLDivElement|null} */
  #messageElement = null;

  /** @type {HTMLDivElement|null} */
  get messageElement() {
    return this.#messageElement;
  }

  /** @type {HTMLElement} */
  #container;

  /** @type {HTMLElement} */
  get container() {
    return this.#container;
  }

  /** @type {LoadingSettings} */
  #options = { fadeIn: null, fadeOut: null, zIndex: 9999 };

  /** @returns {LoadingSettings} */
  get options() {
    return { ...this.#options };
  }

  /** @param {LoadingSettings} value */
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

  /** @type {LoadingStatus} */
  #status = 'none';

  /** @type {LoadingStatus} */
  get status() {
    return this.#status;
  }

  /** @type {string|HTMLElement} */
  #defaultMessage = '';

  /** @returns {string|HTMLElement} */
  get defaultMessage() {
    return this.#defaultMessage;
  }

  /** @param {string|HTMLElement} value */
  set defaultMessage(value) {
    if (typeof value !== 'string' && !(value instanceof HTMLElement))
      throw new TypeError('defaultMessage must be a string or an HTMLElement');
    this.#defaultMessage = value;
  }

  /** @type {string|HTMLElement|null} */
  #message = null;

  /** @returns {string|HTMLElement|null} */
  get message() {
    return this.#message;
  }

  /** @type {boolean} */
  #allowHtmlText = false;

  /** @returns {boolean} */
  get allowHtmlText() {
    return this.#allowHtmlText;
  }

  /** @param {boolean} value */
  set allowHtmlText(value) {
    if (typeof value !== 'boolean') throw new TypeError('allowHtmlText must be a boolean');
    this.#allowHtmlText = value;
  }

  /**@type {NodeJS.Timeout|null} */
  #fadeInTimeout = null;

  /** @returns {boolean} */
  get fadeInTimeout() {
    return this.#fadeInTimeout !== null;
  }

  /**@type {NodeJS.Timeout|null} */
  #fadeOutTimeout = null;

  /** @returns {boolean} */
  get fadeOutTimeout() {
    return this.#fadeOutTimeout !== null;
  }

  /** @returns {boolean} */
  get visible() {
    return !!this.#overlay;
  }

  /**
   * @param {HTMLElement} [container=document.body] - Where the loading screen should be attached.
   * @param {{ fadeIn?: number, fadeOut?: number, zIndex?: number }} [options={}] - Config options (ms).
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
   * @param {string|HTMLElement} [message=this.#defaultMessage]
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
   * Starts or updates the loading screen with a message.
   * @param {string|HTMLElement} [message=this.#defaultMessage]
   * @returns {boolean}
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
   * Updates the loading screen with a message.
   * @param {string|HTMLElement} [message=this.#defaultMessage]
   * @returns {boolean}
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
   * @returns {boolean}
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
