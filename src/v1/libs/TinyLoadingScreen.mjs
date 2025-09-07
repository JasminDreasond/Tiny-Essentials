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
  #messageElement = null;

  /** @type {HTMLElement} */
  #container;

  /** @type {LoadingSettings} */
  #options = { fadeIn: null, fadeOut: null, zIndex: 9999 };

  /** @type {LoadingStatus} */
  #status = 'none';

  /** @type {string|HTMLElement|null} */
  #message = null;

  /** @type {boolean} */
  #allowHtmlText = false;

  /**@type {NodeJS.Timeout|null} */
  #fadeInTimeout = null;

  /**@type {NodeJS.Timeout|null} */
  #fadeOutTimeout = null;

  /** @returns {boolean} */
  get allowHtmlText() {
    return this.#allowHtmlText;
  }

  /** @param {boolean} value */
  set allowHtmlText(value) {
    this.#allowHtmlText = value;
  }

  /** @returns {string|HTMLElement|null} */
  get message() {
    return this.#message;
  }

  /** @returns {boolean} */
  get visible() {
    return !!this.#overlay;
  }

  /** @type {LoadingStatus} */
  get status() {
    return this.#status;
  }

  /** @type {HTMLDivElement|null} */
  get overlay() {
    return this.#overlay;
  }

  /** @type {HTMLDivElement|null} */
  get messageElement() {
    return this.#messageElement;
  }

  /** @type {HTMLElement} */
  get container() {
    return this.#container;
  }

  /** @returns {LoadingSettings} */
  get options() {
    return { ...this.#options };
  }

  /** @param {LoadingSettings} value */
  set options(value) {
    this.#options = { ...value };
  }

  /**
   * @param {HTMLElement} [container=document.body] - Where the loading screen should be attached.
   * @param {{ fadeIn?: number, fadeOut?: number, zIndex?: number }} [options={}] - Config options (ms).
   */
  constructor(container = document.body, options = {}) {
    this.#container = container;
    this.options = {
      fadeIn: options.fadeIn ?? null, // default 300ms
      fadeOut: options.fadeOut ?? null, // default 300ms
      zIndex: options.zIndex ?? 9999, // default overlay level
    };
  }

  /**
   * @param {string|HTMLElement} message
   */
  _updateMessage(message) {
    if (!this.#messageElement) throw new Error('');
    this.#message = message;
    if (typeof message === 'string') {
      if (!this.#allowHtmlText) this.#messageElement.textContent = message;
      else this.#messageElement.innerHTML = message;
    } else {
      if (!this.#allowHtmlText) throw new Error('');
      this.#messageElement.textContent = '';
      this.#messageElement.appendChild(message);
    }
  }

  /**
   * Starts or updates the loading screen with a message.
   * @param {string|HTMLElement} message
   * @returns {boolean}
   */
  start(message = 'Loading...') {
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
      }
      else fadeIn();

      this._updateMessage(message);
      return true;
    }

    if (this.#messageElement) this._updateMessage(message);
    return false;
  }

  /**
   * Updates the loading screen with a message.
   * @param {string|HTMLElement} message
   * @returns {boolean}
   */
  update(message = 'Loading...') {
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
      }
      else fadeOut();

      return true;
    }
    return false;
  }
}

export default TinyLoadingScreen;
