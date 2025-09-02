import { diffArrayList } from '../basics/array.mjs';
import { diffStrings } from '../basics/text.mjs';
import { parseStyle } from './TinyHtml/TinyHtmlUtils.mjs';

/**
 * Callback type used for element mutation detectors.
 *
 * @callback ElementDetectorsFn
 * @param {MutationRecord} mutation - Single mutation record being processed.
 * @param {number} index - Index of the current mutation in the batch.
 * @param {MutationRecord[]} mutations - Full list of mutation records from the observer callback.
 * @returns {void}
 */

class TinyElementObserver {
  /**
   * Configuration settings for the MutationObserver instance.
   *
   * @type {MutationObserverInit}
   */
  #settings = {
    attributeOldValue: true,
    attributes: true,
    subtree: true,
    attributeFilter: ['style', 'class'],
  };

  /**
   * Get the observer settings.
   * @returns {MutationObserverInit}
   */
  get settings() {
    return this.#settings;
  }

  /**
   * Set the observer settings.
   * @param {MutationObserverInit} settings
   */
  set settings(settings) {
    if (typeof settings !== 'object' || settings === null)
      throw new TypeError('settings must be a non-null object.');
    this.#settings = settings;
  }

  /**
   * Internal MutationObserver instance that tracks DOM attribute changes.
   * @type {MutationObserver|null}
   */
  #observer = null;

  /**
   * List of detectors executed on observed mutations.
   * Each detector is a tuple:
   * - name: string identifier
   * - handler: function processing MutationRecords
   *
   * @type {Array<[string, ElementDetectorsFn]>}
   */
  #detectors = [
    // Style Detector
    [
      'tinyStyleEvent',
      (mutation) => {
        if (
          mutation.type !== 'attributes' ||
          mutation.attributeName !== 'style' ||
          !(mutation.target instanceof HTMLElement)
        )
          return;
        const oldVal = mutation.oldValue || '';
        const newVal = mutation.target.getAttribute('style') || '';

        const oldStyles = parseStyle(oldVal);
        const newStyles = parseStyle(newVal);

        const changes = diffStrings(oldStyles, newStyles);

        if (
          Object.keys(changes.added).length ||
          Object.keys(changes.removed).length ||
          Object.keys(changes.modified).length
        ) {
          mutation.target.dispatchEvent(
            new CustomEvent('tinyhtml.stylechanged', {
              detail: changes,
            }),
          );
        }
      },
    ],

    // Class Detector
    [
      'tinyClassEvent',
      (mutation) => {
        if (
          mutation.type !== 'attributes' ||
          mutation.attributeName !== 'class' ||
          !(mutation.target instanceof HTMLElement)
        )
          return;
        const oldVal = mutation.oldValue || '';
        const newVal = mutation.target.className || '';

        const oldClasses = oldVal.split(/\s+/).filter(Boolean);
        const newClasses = newVal.split(/\s+/).filter(Boolean);

        const changes = diffArrayList(oldClasses, newClasses);

        if (changes.added.length || changes.removed.length) {
          mutation.target.dispatchEvent(
            new CustomEvent('tinyhtml.classchanged', {
              detail: changes,
            }),
          );
        }
      },
    ],
  ];

  /**
   * Get the element detectors.
   * @returns {Array<[string, ElementDetectorsFn]>}
   */
  get detectors() {
    return this.#detectors.map((item) => [item[0], item[1]]);
  }

  /**
   * Set the element detectors.
   * @param {Array<[string, ElementDetectorsFn]>} detectors
   */
  set detectors(detectors) {
    if (!Array.isArray(detectors)) throw new TypeError('detectors must be an array.');

    /** @type {Array<[string, ElementDetectorsFn]>} */
    const values = [];
    for (const [name, fn] of detectors) {
      if (typeof name !== 'string') throw new TypeError('Detector name must be a string.');
      if (typeof fn !== 'function')
        throw new TypeError(`Detector handler for "${name}" must be a function.`);
      values.push([name, fn]);
    }
    this.#detectors = values;
  }

  /**
   * Returns true if a MutationObserver is currently active.
   * @returns {boolean}
   */
  get isUsing() {
    return !!this.#observer;
  }

  /**
   * Start tracking changes on the whole document.
   */
  start() {
    if (this.#observer) return;
    this.#observer = new MutationObserver((mutations) => {
      mutations.forEach((value, index, array) =>
        this.#detectors.forEach((item) => item[1](value, index, array)),
      );
    });

    this.#observer.observe(document.documentElement, this.#settings);
  }

  /**
   * Stop tracking changes.
   */
  stop() {
    if (!this.#observer) return;
    this.#observer.disconnect();
    this.#observer = null;
  }

  // ================= Detectors Editor =================

  /**
   * Add a detector to the end of the array.
   * @param {string} name
   * @param {ElementDetectorsFn} handler
   */
  addEnd(name, handler) {
    this.#validateDetector(name, handler);
    this.#detectors.push([name, handler]);
  }

  /**
   * Add a detector to the start of the array.
   * @param {string} name
   * @param {ElementDetectorsFn} handler
   */
  addStart(name, handler) {
    this.#validateDetector(name, handler);
    this.#detectors.unshift([name, handler]);
  }

  /**
   * Insert a detector at a specific index.
   * @param {number} index
   * @param {string} name
   * @param {ElementDetectorsFn} handler
   * @param {'before'|'after'} position - Position relative to the index
   */
  insertAt(index, name, handler, position = 'after') {
    this.#validateDetector(name, handler);
    if (typeof index !== 'number' || index < 0 || index >= this.#detectors.length) {
      throw new RangeError('Invalid index for insertDetectorAt.');
    }
    const insertIndex = position === 'before' ? index : index + 1;
    this.#detectors.splice(insertIndex, 0, [name, handler]);
  }

  /**
   * Remove a detector at a specific index.
   * @param {number} index
   */
  removeAt(index) {
    if (typeof index !== 'number' || index < 0 || index >= this.#detectors.length) {
      throw new RangeError('Invalid index for removeDetectorAt.');
    }
    this.#detectors.splice(index, 1);
  }

  /**
   * Remove detectors relative to a specific index.
   * @param {number} index - Reference index
   * @param {number} before - Number of items before the index to remove
   * @param {number} after - Number of items after the index to remove
   */
  removeAround(index, before = 0, after = 0) {
    if (typeof index !== 'number' || index < 0 || index >= this.#detectors.length) {
      throw new RangeError('Invalid index for removeDetectorsAround.');
    }
    const start = Math.max(0, index - before);
    const deleteCount = before + 1 + after;
    this.#detectors.splice(start, deleteCount);
  }

  /**
   * Check if a detector exists at a specific index.
   * @param {number} index
   * @returns {boolean}
   */
  isIndexUsed(index) {
    return index >= 0 && index < this.#detectors.length;
  }

  /**
   * Check if a handler function already exists in the array.
   * @param {ElementDetectorsFn} handler
   * @returns {boolean}
   */
  hasHandler(handler) {
    if (typeof handler !== 'function') throw new TypeError('Handler must be a function.');
    return this.#detectors.some(([_, fn]) => fn === handler);
  }

  /**
   * Internal validation for detector entries.
   * @param {string} name
   * @param {ElementDetectorsFn} handler
   */
  #validateDetector(name, handler) {
    if (typeof name !== 'string' || !name.trim()) {
      throw new TypeError('Detector name must be a non-empty string.');
    }
    if (typeof handler !== 'function') {
      throw new TypeError(`Detector handler for "${name}" must be a function.`);
    }
  }
}

export default TinyElementObserver;
