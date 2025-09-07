/**
 * @typedef {'none'|'active'|'fadeIn'|'fadeOut'} LoadingStatus
 */

class TinyLoadingScreen {
  /** @type {HTMLDivElement|null} */
  #overlay = null;

  /** @type {HTMLDivElement|null} */
  #messageElement = null;

  /** @type {HTMLElement} */
  #container;

  /** @type {{ fadeIn: number, fadeOut: number, zIndex: number }} */
  #options;

  /** @type {LoadingStatus} */
  #status = 'none';

  /** @type {string|null} */
  #message = null;

  /** @returns {string|null} */
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

  /**
   * @param {HTMLElement} [container=document.body] - Where the loading screen should be attached.
   * @param {{ fadeIn?: number, fadeOut?: number, zIndex?: number }} [options={}] - Config options (ms).
   */
  constructor(container = document.body, options = {}) {
    this.#container = container;
    this.#options = {
      fadeIn: options.fadeIn ?? 300, // default 300ms
      fadeOut: options.fadeOut ?? 300, // default 300ms
      zIndex: options.zIndex ?? 9999, // default overlay level
    };
  }

  /**
   * Starts or updates the loading screen with a message.
   * @param {string} message
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
      setTimeout(() => {
        this.#status = 'active';
        this.#overlay?.classList.remove('fadeIn');
        this.#overlay?.classList.add('active');
      }, this.#options.fadeIn);

      this.#message = message;
      this.#messageElement.textContent = message;
      return true;
    }

    if (this.#messageElement) {
      this.#message = message;
      this.#messageElement.textContent = message;
    }
    return false;
  }

  /**
   * Updates the loading screen with a message.
   * @param {string} message
   * @returns {boolean}
   */
  update(message = 'Loading...') {
    if (this.#messageElement) {
      this.#message = message;
      this.#messageElement.textContent = message;
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
      setTimeout(() => {
        this.#status = 'none';
        this.#overlay?.remove();
        this.#overlay = null;
        this.#messageElement = null;
        this.#message = null;
      }, this.#options.fadeOut);

      return true;
    }
    return false;
  }
}

export default TinyLoadingScreen;
