/**
 * @typedef {{ extraHeight: number, extraWidth: number, rows: number }} OnResizeInfo
 */

class TinyTextarea {
  /**
   * @param {HTMLTextAreaElement} textarea - The target textarea element.
   * @param {{
   *   maxRows?: number,
   *   onResize?: (info: OnResizeInfo) => void,
   *   onInput?: () => void
   * }} [options]
   */
  constructor(textarea, options = {}) {
    if (!(textarea instanceof HTMLTextAreaElement)) {
      throw new Error('TinyTextarea: Provided element is not a <textarea>.');
    }

    this.textarea = textarea;
    this.maxRows = options.maxRows ?? 5;
    this.onResize = options.onResize ?? null;
    this.onInput = options.onInput ?? null;

    this._lastKnownRows = 1;
    this._lineHeight = this.#getLineHeight();
    this._baseHeight = this.#calculateBaseHeight();

    textarea.rows = 1;
    textarea.style.overflowY = 'hidden';
    textarea.style.resize = 'none';

    this._handleInput = () => this.#resize();
    textarea.addEventListener('input', this._handleInput);
  }

  /**
   * Calculate accurate base height including styles.
   * @returns {number}
   */
  #calculateBaseHeight() {
    const clone = this.textarea.cloneNode();
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
    const { textarea, maxRows, _lineHeight: lineHeight } = this;

    textarea.style.height = 'auto';

    const scrollHeight = textarea.scrollHeight;
    const maxHeight = lineHeight * maxRows;
    const newHeight = Math.min(scrollHeight, maxHeight);

    const rows = Math.round(newHeight / lineHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';

    if (rows !== this._lastKnownRows) {
      this._lastKnownRows = rows;
      if (typeof this.onResize === 'function') this.onResize(this.getExtraSize());
    }
    if (typeof this.onInput === 'function') this.onInput();
  }

  /**
   * Get computed line height from styles.
   * @returns {number}
   */
  #getLineHeight() {
    const style = window.getComputedStyle(this.textarea);
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
      extraHeight: this.textarea.offsetHeight - this._baseHeight,
      extraWidth: this.textarea.offsetWidth - this.textarea.clientWidth,
      rows: this._lastKnownRows,
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
    this.textarea.removeEventListener('input', this._handleInput);
  }
}

export default TinyTextarea;
