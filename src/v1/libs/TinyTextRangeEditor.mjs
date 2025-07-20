/**
 * A full-featured text range editor for `<input>` and `<textarea>` elements,
 * including advanced utilities for BBCode or similar tag-based markup editing.
 */
class TinyTextRangeEditor {
  /** @type {HTMLInputElement | HTMLTextAreaElement} */
  #el;

  /** @type {string} */
  #openTag;

  /** @type {string} */
  #closeTag;

  /**
   * @param {HTMLInputElement | HTMLTextAreaElement} elem - The target editable input or textarea element.
   * @param {Object} [settings={}] - Optional tag symbol customization.
   * @param {string} [settings.openTag='['] - The character or symbol used to start a tag (e.g., `'['`).
   * @param {string} [settings.closeTag=']'] - The character or symbol used to end a tag (e.g., `']'`).
   */
  constructor(elem, { openTag = '[', closeTag = ']' } = {}) {
    if (!(elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement))
      throw new Error('Element must be an input or textarea.');
    if (typeof openTag !== 'string') throw new Error('openTag must be a string.');
    if (typeof closeTag !== 'string') throw new Error('closeTag must be a string.');
    this.#el = elem;
    this.#openTag = openTag;
    this.#closeTag = closeTag;
  }

  /** @returns {string} The current open tag symbol. */
  getOpenTag() {
    return this.#openTag;
  }

  /** @returns {string} The current close tag symbol. */
  getCloseTag() {
    return this.#closeTag;
  }

  /** @param {string} tag - New open tag symbol to use (e.g., `'['`). */
  setOpenTag(tag) {
    if (typeof tag !== 'string') throw new Error('Open tag must be a string.');
    this.#openTag = tag;
  }

  /** @param {string} tag - New close tag symbol to use (e.g., `']'`). */
  setCloseTag(tag) {
    if (typeof tag !== 'string') throw new Error('Close tag must be a string.');
    this.#closeTag = tag;
  }

  /** Ensures the element has focus. */
  ensureFocus() {
    if (document.activeElement !== this.#el) this.#el.focus();
  }

  /** @returns {{ start: number, end: number }} The current selection range. */
  getSelectionRange() {
    return {
      start: this.#el.selectionStart ?? NaN,
      end: this.#el.selectionEnd ?? NaN,
    };
  }

  /**
   * Sets the current selection range.
   * @param {number} start - Start index.
   * @param {number} end - End index.
   * @param {boolean} [preserveScroll=true] - Whether to preserve scroll position.
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

  /** @returns {string} The full current text value. */
  getValue() {
    return this.#el.value;
  }

  /**
   * Sets the full value of the element.
   * @param {string} value - The new value to assign.
   */
  setValue(value) {
    this.#el.value = value;
  }

  /** @returns {string} The currently selected text. */
  getSelectedText() {
    const { start, end } = this.getSelectionRange();
    return this.#el.value.slice(start, end);
  }

  /**
   * Inserts text at the current selection, replacing any selected content.
   * @param {string} text - The text to insert.
   * @param {'start' | 'end' | 'preserve'} [newCursor='end'] - Controls caret position after insertion.
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

  /** Deletes the currently selected text. */
  deleteSelection() {
    this.insertText('');
  }

  /**
   * Replaces the selection using a transformation function.
   * @param {(selected: string) => string} transformer - Function that modifies the selected text.
   */
  transformSelection(transformer) {
    const { start } = this.getSelectionRange();
    const selected = this.getSelectedText();
    const transformed = transformer(selected);
    this.insertText(transformed);
    this.setSelectionRange(start, start + transformed.length);
  }

  /**
   * Surrounds current selection with prefix and suffix.
   * @param {string} prefix - Text to insert before.
   * @param {string} suffix - Text to insert after.
   */
  surroundSelection(prefix, suffix) {
    const selected = this.getSelectedText();
    this.insertText(`${prefix}${selected}${suffix}`);
  }

  /**
   * Moves the caret by a given offset.
   * @param {number} offset - Characters to move.
   */
  moveCaret(offset) {
    const { start } = this.getSelectionRange();
    const pos = Math.max(0, start + offset);
    this.setSelectionRange(pos, pos);
  }

  /** Selects all content in the field. */
  selectAll() {
    this.setSelectionRange(0, this.#el.value.length);
  }

  /**
   * Expands the current selection by character amounts.
   * @param {number} before - Characters to expand to the left.
   * @param {number} after - Characters to expand to the right.
   */
  expandSelection(before, after) {
    const { start, end } = this.getSelectionRange();
    const newStart = Math.max(0, start - before);
    const newEnd = Math.min(this.#el.value.length, end + after);
    this.setSelectionRange(newStart, newEnd);
  }

  /**
   * Replaces all regex matches in the content.
   * @param {RegExp} regex - Regex to match.
   * @param {(match: string) => string} replacer - Replacement function.
   */
  replaceAll(regex, replacer) {
    const newValue = this.#el.value.replace(regex, replacer);
    this.setValue(newValue);
  }

  /**
   * Wraps the current selection with a tag.
   * @param {string} tagName - The tag name (e.g., `b`, `color`).
   */
  wrapWithTag(tagName) {
    this.surroundSelection(
      `${this.#openTag}${tagName}${this.#closeTag}`,
      `${this.#openTag}/${tagName}${this.#closeTag}`,
    );
  }

  /**
   * Inserts a tag with optional inner content.
   * @param {string} tagName - The tag to insert.
   * @param {string} [content] - Optional content between tags.
   */
  insertTag(tagName, content = '') {
    this.insertText(
      `${this.#openTag}${tagName}${this.#closeTag}${content}${this.#openTag}/${tagName}${this.#closeTag}`,
    );
  }

  /**
   * Inserts a self-closing tag.
   * @param {string} tagName - The tag name.
   * @param {Record<string,string>} [attributes={}] - Optional attributes to include.
   */
  insertSelfClosingTag(tagName, attributes = {}) {
    const attrStr = Object.entries(attributes)
      .map(([key, val]) => `${key}="${val}"`)
      .join(' ');
    const tag = attrStr
      ? `${this.#openTag}${tagName} ${attrStr}${this.#closeTag}`
      : `${this.#openTag}${tagName}${this.#closeTag}`;
    this.insertText(tag);
  }

  /**
   * Toggles a tag around the current selection.
   * If it's already wrapped, unwraps it.
   * @param {string} tagName - The tag to toggle.
   */
  toggleTag(tagName) {
    const selected = this.getSelectedText();
    const open = `${this.#openTag}${tagName}${this.#closeTag}`;
    const close = `${this.#openTag}/${tagName}${this.#closeTag}`;
    if (selected.startsWith(open) && selected.endsWith(close)) {
      const unwrapped = selected.slice(open.length, selected.length - close.length);
      this.insertText(unwrapped);
    } else {
      this.insertText(`${open}${selected}${close}`);
    }
  }
}

export default TinyTextRangeEditor;
