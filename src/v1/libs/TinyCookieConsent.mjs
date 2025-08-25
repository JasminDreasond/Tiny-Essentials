/**
 * @typedef {Object} Category
 * @property {string} label - Category label displayed to the user
 * @property {boolean} required - If true, cannot be disabled
 * @property {boolean} default - Default state (true = enabled, false = disabled)
 */

/**
 * @typedef {Object} Config
 * @property {string} message - Consent message
 * @property {string} acceptText - Text for "Accept All" button
 * @property {string} rejectText - Text for "Reject All" button
 * @property {string} settingsText - Text for "Manage Settings" button
 * @property {Category[]} categories - List of cookie categories
 * @property {string} storageKey - Key used to store preferences
 * @property {(preferences: Object) => void} onSave - Callback when preferences are saved
 * @property {number} [animationDuration=400] - Animation duration in ms
 */

/**
 * CookieConsent
 *
 * A flexible and customizable cookie consent manager.
 * Features:
 * - Displays a consent bar with customizable text and buttons.
 * - Allows defining multiple cookie categories (required, analytics, ads, etc.).
 * - Stores user preferences in localStorage.
 * - Provides callbacks for when user accepts or denies categories.
 * - Fully customizable via configuration.
 */
class TinyCookieConsent {
  /** @type {Record<string, boolean>} */
  #preferences;

  /** @type {Config} */
  #config = {
    message: 'We use cookies to improve your experience.',
    acceptText: 'Accept All',
    rejectText: 'Reject All',
    settingsText: 'Manage Settings',
    categories: [],
    storageKey: 'cookie-consent-preferences',
    onSave: (prefs) => console.log('Preferences saved:', prefs),
    animationDuration: 400,
  };

  /** @type {Record<string, boolean>} */
  get preferences() {
    const saved = localStorage.getItem(this.#config.storageKey);
    return saved ? JSON.parse(saved) : {};
  }

  /** @type {Config} */
  get config() {
    return { ...this.#config, categories: [...this.#config.categories] };
  }

  /** @param {Config} value */
  set config(value) {
    this.#config = Object.assign(this.#config, value);
  }

  /**
   * @param {Config} config
   */
  constructor(config) {
    this.config = config;
    const prefs = this.loadPreferences();
    this.#preferences = prefs ?? {};
    if (!prefs) this.showConsentBar();
  }

  /**
   * Loads saved preferences from localStorage
   * @returns {Record<string, boolean>|null}
   */
  loadPreferences() {
    const saved = localStorage.getItem(this.#config.storageKey);
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Smoothly removes an element with fade-out/slide-out animation
   * @param {HTMLElement} el
   */
  removeWithAnimation(el) {
    el.classList.add('closing');
    setTimeout(() => el.remove(), this.#config.animationDuration);
  }

  /**
   * Saves preferences to localStorage
   *
   * @param {Record<string, boolean>} prefs
   */
  savePreferences(prefs) {
    localStorage.setItem(this.#config.storageKey, JSON.stringify(prefs));
    this.#config.onSave(prefs);
  }

  /** Shows the initial consent bar */
  showConsentBar() {
    const bar = document.createElement('div');
    bar.className = 'cookie-consent-bar';
    bar.innerHTML = `
      <div><p>${this.#config.message}</p></div>
      <div><button class="accept">${this.#config.acceptText}</button></div>
      <div><button class="reject">${this.#config.rejectText}</button></div>
      <div><button class="settings">${this.#config.settingsText}</button></div>
    `;

    document.body.appendChild(bar);

    const accept = bar.querySelector('.accept');
    if (!(accept instanceof HTMLElement)) throw new Error('');

    accept.onclick = () => {
      /** @type {Record<string, boolean>} */
      const prefs = {};
      this.#config.categories.forEach((cat) => (prefs[cat.label] = true));
      this.savePreferences(prefs);
      this.removeWithAnimation(bar);
    };

    const reject = bar.querySelector('.reject');
    if (!(reject instanceof HTMLElement)) throw new Error('');

    reject.onclick = () => {
      /** @type {Record<string, boolean>} */
      const prefs = {};
      this.#config.categories.forEach((cat) => (prefs[cat.label] = cat.required));
      this.savePreferences(prefs);
      this.removeWithAnimation(bar);
    };

    const settings = bar.querySelector('.settings');
    if (!(settings instanceof HTMLElement)) throw new Error('');

    settings.onclick = () => {
      this.showSettingsModal(bar);
    };
  }

  /**
   * Shows settings modal for fine-grained control
   *
   * @param {HTMLElement} bar
   */
  showSettingsModal(bar) {
    const modal = document.createElement('div');
    modal.className = 'cookie-consent-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Cookie Settings</h2>
        <form class="settings-form">
          ${this.#config.categories
            .map(
              (cat) => `
            <label>
              <input type="checkbox" name="${cat.label}" 
                ${cat.default ? 'checked' : ''} 
                ${cat.required ? 'disabled' : ''}>
              ${cat.label}
            </label>
          `,
            )
            .join('')}
        </form>
        <button class="save">Save Preferences</button>
      </div>
    `;

    document.body.appendChild(modal);

    const save = modal.querySelector('.save');
    if (!(save instanceof HTMLElement)) throw new Error('');

    save.onclick = () => {
      /** @type {Record<string, boolean>} */
      const prefs = {};
      modal.querySelectorAll('input[type=checkbox]').forEach((input) => {
        if (input instanceof HTMLInputElement) prefs[input.name] = input.checked;
      });
      this.savePreferences(prefs);
      this.removeWithAnimation(modal);
      if (bar) this.removeWithAnimation(bar);
    };
  }

  /**
   * Checks if a category is allowed
   * @param {string} category
   * @returns {boolean}
   */
  isAllowed(category) {
    if (!this.#preferences) return false;
    return !!this.#preferences[category];
  }
}

export default TinyCookieConsent;
