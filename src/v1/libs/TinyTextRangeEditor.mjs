/**
 * A full-featured text range editor for <input> and <textarea> elements.
 */
class TinyTextRangeEditor {
  /** @type {HTMLInputElement | HTMLTextAreaElement} */
  #el;

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement} elem - The input or textarea element.
   */
  constructor(elem) {
    if (!(elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement))
      throw new Error('Element must be an input or textarea');
    this.#el = elem;
  }

  /**
   * Ensures the element has focus.
   */
  ensureFocus() {
    if (document.activeElement !== this.#el) this.#el.focus();
  }

  /**
   * @returns {{ start: number, end: number }} The current selection range.
   */
  getSelectionRange() {
    return {
      start: this.#el.selectionStart ?? NaN,
      end: this.#el.selectionEnd ?? NaN,
    };
  }

  /** @param {number} start
   *  @param {number} end
   *  @param {boolean} [preserveScroll]
   */
  setSelectionRange(start, end, preserveScroll = true) {
    const scrollTop = this.#el.scrollTop;
    const scrollLeft = this.#el.scrollLeft;
    this.#el.setSelectionRange(start, end);
    if (preserveScroll) {
      this.#el.scrollTop = scrollTop;
      this.#el.scrollLeft = scrollLeft;
    }
  }

  /**
   * @returns {string} The full value of the element.
   */
  getValue() {
    return this.#el.value;
  }

  /**
   * @param {string} value - Set new value for the element.
   */
  setValue(value) {
    this.#el.value = value;
  }

  /**
   * @returns {string} The currently selected text.
   */
  getSelectedText() {
    const { start, end } = this.getSelectionRange();
    return this.#el.value.slice(start, end);
  }

  /**
   * Inserts text at the current selection, replacing any selected content.
   *  @param {string} text
   *  @param {'start' | 'end' | 'preserve'} [newCursor='end']
   */
  insertText(text, newCursor = 'end') {
    const { start, end } = this.getSelectionRange();
    const value = this.#el.value;
    const newValue = value.slice(0, start) + text + value.slice(end);
    this.setValue(newValue);

    let cursorPos = start;
    if (newCursor === 'end') cursorPos = start + text.length;
    else if (newCursor === 'preserve') cursorPos = start;

    this.setSelectionRange(cursorPos, cursorPos);
  }

  /**
   * Deletes the selected text.
   */
  deleteSelection() {
    this.insertText('');
  }

  /**
   * Replaces selection with result of callback.
   *  @param {(selected: string) => string} transformer
   */
  transformSelection(transformer) {
    const { start, end } = this.getSelectionRange();
    const selected = this.getSelectedText();
    const transformed = transformer(selected);
    this.insertText(transformed);
    this.setSelectionRange(start, start + transformed.length);
  }

  /**
   * Surrounds selection with text.
   *  @param {string} prefix
   *  @param {string} suffix
   */
  surroundSelection(prefix, suffix) {
    const selected = this.getSelectedText();
    this.insertText(`${prefix}${selected}${suffix}`);
  }

  /**
   * Moves the caret by offset.
   *  @param {number} offset
   */
  moveCaret(offset) {
    const { start } = this.getSelectionRange();
    const pos = Math.max(0, start + offset);
    this.setSelectionRange(pos, pos);
  }

  /**
   * Selects the entire content.
   */
  selectAll() {
    this.setSelectionRange(0, this.#el.value.length);
  }

  /**
   * Expands selection by a number of characters.
   *  @param {number} before
   *  @param {number} after
   */
  expandSelection(before, after) {
    const { start, end } = this.getSelectionRange();
    const newStart = Math.max(0, start - before);
    const newEnd = Math.min(this.#el.value.length, end + after);
    this.setSelectionRange(newStart, newEnd);
  }

  /**
   * Replaces all matching substrings.
   *  @param {RegExp} regex
   *  @param {(match: string) => string} replacer
   */
  replaceAll(regex, replacer) {
    const newValue = this.#el.value.replace(regex, replacer);
    this.setValue(newValue);
  }
}

export default TinyTextRangeEditor;
