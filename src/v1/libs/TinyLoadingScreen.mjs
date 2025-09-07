class TinyLoadingScreen {
  /** @type {HTMLDivElement|null} */
  #overlay = null;
  /** @type {HTMLDivElement|null} */
  #messageElement = null;
  /** @type {HTMLElement} */
  #container;

  /**
   * @param {HTMLElement} [container=document.body] - Where the loading screen should be attached.
   */
  constructor(container = document.body) {
    this.#container = container;
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

      this.#messageElement.textContent = message;
      return true;
    }

    if (this.#messageElement) this.#messageElement.textContent = message;
    return false;
  }

  /**
   * Updates the loading screen with a message.
   * @param {string} message
   * @returns {boolean}
   */
  update(message = 'Loading...') {
    if (this.#messageElement) {
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
      this.#overlay.remove();
      this.#overlay = null;
      this.#messageElement = null;
      return true;
    }
    return false;
  }
}

export default TinyLoadingScreen;
