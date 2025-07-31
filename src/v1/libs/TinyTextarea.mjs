/**
 * @typedef {{ breakLines: number, height: number, scrollHeight: number, maxHeight: number, lineHeight: number, maxRows: number, rows: number }} OnInputInfo
 */

class TinyTextarea {
  #lineHeight;
  #maxRows;
  #extraHeight;

  #lastKnownHeight = 0;
  #lastKnownRows = 0;

  /** @type {HTMLTextAreaElement} */
  #textarea;

  /**
   * @param {HTMLTextAreaElement} textarea - The target textarea element.
   * @param {{
   *   maxRows?: number,
   *   extraHeight?: number,
   *   onResize?: (info: OnInputInfo) => void,
   *   onInput?: (info: OnInputInfo) => void
   * }} [options]
   */
  constructor(textarea, options = {}) {
    if (!(textarea instanceof HTMLTextAreaElement)) {
      throw new Error('TinyTextarea: Provided element is not a <textarea>.');
    }

    this.#textarea = textarea;
    this.#maxRows = (options.maxRows ?? 5) + 1;
    this.#extraHeight = options.extraHeight ?? 0;
    this.onResize = options.onResize ?? null;
    this.onInput = options.onInput ?? null;

    this.#lineHeight = this.#getLineHeight();

    textarea.style.overflowY = 'hidden';
    textarea.style.resize = 'none';

    this._handleInput = () => this.#resize();
    textarea.addEventListener('input', this._handleInput);
    this.#resize();
  }

  /**
   * Resize the textarea based on its content.
   */
  #resize() {
    this.#textarea.style.height = 'auto';
    const style = window.getComputedStyle(this.#textarea);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;

    const breakLines = (this.#textarea.value.match(/\n/g) || []).length;
    const scrollHeight = this.#textarea.scrollHeight;
    const maxHeight = this.#lineHeight * this.#maxRows;
    const newHeight = Math.ceil(
      Math.min(scrollHeight, maxHeight) - paddingTop - paddingBottom + this.#extraHeight,
    );

    // const rows = Math.round(newHeight / this.#lineHeight);
    const maxRows = this.#maxRows - 1;
    const rows = breakLines < maxRows ? breakLines + 1 : maxRows;
    this.#textarea.style.height = `${newHeight}px`;
    this.#textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    this.#lastKnownHeight = newHeight;

    if (rows !== this.#lastKnownRows) {
      this.#lastKnownRows = rows;
      if (typeof this.onResize === 'function')
        this.onResize({
          breakLines,
          rows,
          height: newHeight,
          scrollHeight,
          maxHeight,
          lineHeight: this.#lineHeight,
          maxRows,
        });
    }
    if (typeof this.onInput === 'function')
      this.onInput({
        breakLines,
        rows,
        height: newHeight,
        scrollHeight,
        maxHeight,
        lineHeight: this.#lineHeight,
        maxRows,
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
   * @returns {{ height: number, rows: number }}
   */
  getData() {
    return {
      rows: this.#lastKnownRows,
      height: this.#lastKnownHeight,
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
