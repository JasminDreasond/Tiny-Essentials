/**
 * @typedef {{ extraHeight: number, extraWidth: number, rows: number }} OnResizeInfo
 */

/**
 * @typedef {{ scrollHeight: number, maxHeight: number, lineHeight: number, maxRows: number, rows: number }} OnInputInfo
 */

class TinyTextarea {
  #lastKnownRows = 0;
  #lineHeight;
  #baseHeight;
  #maxRows;

  /** @type {HTMLTextAreaElement} */
  #textarea;

  /**
   * @param {HTMLTextAreaElement} textarea - The target textarea element.
   * @param {{
   *   maxRows?: number,
   *   onResize?: (info: OnResizeInfo) => void,
   *   onInput?: (info: OnInputInfo) => void
   * }} [options]
   */
  constructor(textarea, options = {}) {
    if (!(textarea instanceof HTMLTextAreaElement)) {
      throw new Error('TinyTextarea: Provided element is not a <textarea>.');
    }

    this.#textarea = textarea;
    this.#maxRows = options.maxRows ?? 5;
    this.onResize = options.onResize ?? null;
    this.onInput = options.onInput ?? null;

    this.#lineHeight = this.#getLineHeight();
    this.#baseHeight = this.#calculateBaseHeight();

    textarea.style.overflowY = 'hidden';
    textarea.style.resize = 'none';

    this._handleInput = () => this.#resize();
    textarea.addEventListener('input', this._handleInput);
    this.#resize();
  }

  /**
   * Calculate accurate base height including styles.
   * @returns {number}
   */
  #calculateBaseHeight() {
    const clone = this.#textarea.cloneNode();
    if (!(clone instanceof HTMLTextAreaElement))
      throw new Error('TinyTextarea: Provided element clone is not a <textarea>.');

    clone.style.visibility = 'hidden';
    clone.style.position = 'absolute';
    clone.style.height = 'auto';
    clone.style.minHeight = '0';
    clone.rows = 1;

    document.body.appendChild(clone);
    const height = clone.scrollHeight;
    document.body.removeChild(clone);
    return height;
  }

  /**
   * Resize the textarea based on its content.
   */
  #resize() {
    this.#textarea.style.height = 'auto';
    const style = window.getComputedStyle(this.#textarea);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;

    const scrollHeight = this.#textarea.scrollHeight;
    const maxHeight = this.#lineHeight * this.#maxRows;
    const newHeight =
      Math.min(scrollHeight, maxHeight) - paddingTop - paddingBottom - marginTop - marginBottom;

    const rows = Math.round(newHeight / this.#lineHeight);
    this.#textarea.style.height = `${newHeight}px`;
    this.#textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';

    if (rows !== this.#lastKnownRows) {
      this.#lastKnownRows = rows;
      if (typeof this.onResize === 'function') this.onResize(this.getExtraSize());
    }
    if (typeof this.onInput === 'function')
      this.onInput({
        rows,
        scrollHeight,
        maxHeight,
        lineHeight: this.#lineHeight,
        maxRows: this.#maxRows,
      });
  }

  /**
   * Get computed line height from styles.
   * @returns {number}
   */
  #getLineHeight() {
    const style = window.getComputedStyle(this.#textarea);
    const line = parseFloat(style.lineHeight);
    if (!Number.isNaN(line)) return line;
    return parseFloat(style.fontSize) * 1.2;
  }

  /**
   * Return extra size compared to the base height.
   * @returns {OnResizeInfo}
   */
  getExtraSize() {
    return {
      extraHeight: this.#textarea.offsetHeight - this.#baseHeight,
      extraWidth: this.#textarea.offsetWidth - this.#textarea.clientWidth,
      rows: this.#lastKnownRows,
    };
  }

  /**
   * Force a manual size check.
   */
  refresh() {
    this.#resize();
  }

  /**
   * Remove all listeners and restore behavior.
   */
  destroy() {
    this.#textarea.removeEventListener('input', this._handleInput);
  }
}

export default TinyTextarea;
