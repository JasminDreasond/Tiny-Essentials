/**
 * @typedef {Object} DragAndDropOptions
 * @property {HTMLElement} [target=document.body] - The DOM element where drag listeners will be attached. Defaults to `document.body` if `fullscreen` is true or no target is provided.
 * @property {boolean} [fullscreen=true] - If true, listeners are attached to the entire page (`document.body`). If false, the `target` must be specified.
 * @property {string} [hoverClass="dnd-hover"] - CSS class applied to the target element while files are being dragged over it.
 * @property {(files: FileList, event: DragEvent) => void} [onDrop] - Callback function executed when files are dropped onto the target.
 * @property {(event: DragEvent) => void} [onEnter] - Optional callback triggered when dragging enters the target area.
 * @property {(event: DragEvent) => void} [onLeave] - Optional callback triggered when dragging leaves the target area.
 */

/**
 * TinyDragDropDetector
 *
 * A lightweight utility to detect drag-and-drop file operations on a specific DOM element or the entire page.
 * It handles the drag lifecycle (enter, over, leave, drop) and provides hooks for developers to handle file uploads or UI changes.
 *
 * @class
 */
class TinyDragDropDetector {
  /** @type {HTMLElement} */
  #target;

  /** @type {boolean} */
  #fullscreen;

  /** @type {string} */
  #hoverClass;

  /** @type {(files: FileList, event: DragEvent) => void} */
  #onDropCallback;

  /** @type {(event: DragEvent) => void} */
  #onEnterCallback;

  /** @type {(event: DragEvent) => void} */
  #onLeaveCallback;

  /** @type {boolean} */
  #isDragging;

  /** @type {boolean} */
  #bound;

  /**
   * Creates a new instance of TinyDragDropDetector to handle drag-and-drop file detection.
   *
   * @param {DragAndDropOptions} [options={}] - Configuration options for the detector.
   * @throws {TypeError} If `target` is not an HTMLElement.
   * @throws {TypeError} If `fullscreen` is not a boolean.
   * @throws {TypeError} If `hoverClass` is not a string.
   * @throws {TypeError} If `onDrop` is defined but not a function.
   * @throws {TypeError} If `onEnter` is defined but not a function.
   * @throws {TypeError} If `onLeave` is defined but not a function.
   */
  constructor(options = {}) {
    const {
      target,
      fullscreen = true,
      hoverClass = 'dnd-hover',
      onDrop,
      onEnter,
      onLeave,
    } = options;

    // Validate fullscreen
    if (typeof fullscreen !== 'boolean')
      throw new TypeError('The "fullscreen" option must be a boolean.');

    // Validate target
    const resolvedTarget = fullscreen ? document.body : target || document.body;
    if (!(resolvedTarget instanceof HTMLElement))
      throw new TypeError('The "target" option must be an instance of HTMLElement.');

    // Validate hoverClass
    if (typeof hoverClass !== 'string')
      throw new TypeError('The "hoverClass" option must be a string.');

    // Validate onDrop
    if (typeof onDrop !== 'function')
      throw new TypeError('The "onDrop" option must be a function.');

    // Validate onEnter
    if (typeof onEnter !== 'function')
      throw new TypeError('The "onEnter" option must be a function.');

    // Validate onLeave
    if (typeof onLeave !== 'function')
      throw new TypeError('The "onLeave" option must be a function.');

    // Store properties
    this.#target = resolvedTarget;
    this.#fullscreen = fullscreen;
    this.#hoverClass = hoverClass;

    this.#onDropCallback = onDrop || (() => {});
    this.#onEnterCallback = onEnter;
    this.#onLeaveCallback = onLeave;

    this.#isDragging = false;
    this.#bound = false;

    // Bind event handlers
    this._handleDragEnter = this._handleDragEnter.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrop = this._handleDrop.bind(this);

    this.#bindEvents();
  }

  /**
   * Returns the current target DOM element where the listeners are attached.
   * @returns {HTMLElement}
   */
  getTarget() {
    return this.#target;
  }

  /**
   * Returns the CSS class applied during drag hover.
   * @returns {string}
   */
  getHoverClass() {
    return this.#hoverClass;
  }

  /**
   * Indicates whether the detector is operating in fullscreen mode.
   * @returns {boolean}
   */
  isFullScreen() {
    return this.#fullscreen;
  }

  /**
   * Returns whether a drag operation is currently active over the target.
   * @returns {boolean}
   */
  isDragging() {
    return this.#isDragging;
  }

  /**
   * Returns whether the event listeners are currently bound to the target.
   * @returns {boolean}
   */
  bound() {
    return this.#bound;
  }

  /**
   * Binds the drag-and-drop event listeners to the target element.
   * Automatically called on instantiation.
   * @returns {void}
   */
  #bindEvents() {
    if (this.#bound) return;
    const target = this.getTarget();
    target.addEventListener('dragenter', this._handleDragEnter);
    target.addEventListener('dragover', this._handleDragOver);
    target.addEventListener('dragleave', this._handleDragLeave);
    target.addEventListener('drop', this._handleDrop);
    this.#bound = true;
  }

  /**
   * Removes all previously attached drag-and-drop event listeners from the target.
   * @returns {void}
   */
  #unbindEvents() {
    if (!this.#bound) return;
    const target = this.getTarget();
    target.removeEventListener('dragenter', this._handleDragEnter);
    target.removeEventListener('dragover', this._handleDragOver);
    target.removeEventListener('dragleave', this._handleDragLeave);
    target.removeEventListener('drop', this._handleDrop);
    this.#bound = false;
  }

  /**
   * Handles the `dragenter` event.
   * Adds the hover CSS class and triggers the `onEnter` callback if provided.
   * @private
   * @param {DragEvent} event - The dragenter event.
   * @returns {void}
   */
  _handleDragEnter(event) {
    event.preventDefault();
    if (!this.#isDragging) {
      const target = this.getTarget();
      this.#isDragging = true;
      target.classList.add(this.#hoverClass);
      this.#onEnterCallback(event);
    }
  }

  /**
   * Handles the `dragover` event.
   * Prevents default to allow drop and sets the drop effect.
   * @private
   * @param {DragEvent} event - The dragover event.
   * @returns {void}
   */
  _handleDragOver(event) {
    event.preventDefault(); // Required to allow drop
    if (!event.dataTransfer) {
      console.warn('[TinyDragDropDetector] [handleDragOver] DragOver event missing dataTransfer.');
      return;
    }
    event.dataTransfer.dropEffect = 'copy';
  }

  /**
   * Handles the `dragleave` event.
   * Removes the hover class and triggers the `onLeave` callback if provided.
   * @private
   * @param {DragEvent} event - The dragleave event.
   * @returns {void}
   */
  _handleDragLeave(event) {
    event.preventDefault();
    const target = this.getTarget();
    // Check if you've completely left the area
    // @ts-ignore
    if (event.relatedTarget === null || !target.contains(event.relatedTarget)) {
      this.#isDragging = false;
      target.classList.remove(this.#hoverClass);
      this.#onLeaveCallback(event);
    }
  }

  /**
   * Handles the `drop` event.
   * Removes the hover class, resets dragging state, and triggers the `onDrop` callback.
   * @private
   * @param {DragEvent} event - The drop event.
   * @returns {void}
   */
  _handleDrop(event) {
    event.preventDefault();
    if (!event.dataTransfer) {
      console.warn('[TinyDragDropDetector] [handleDrop] DragOver event missing dataTransfer.');
      return;
    }
    const target = this.getTarget();
    this.#isDragging = false;
    target.classList.remove(this.#hoverClass);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.#onDropCallback(files, event);
    }
  }

  /**
   * Destroys the detector instance, unbinding all event listeners and cleaning up.
   * Should be called when the detector is no longer needed to avoid memory leaks.
   * @returns {void}
   */
  destroy() {
    this.#unbindEvents();
    const target = this.getTarget();
    target.classList.remove(this.#hoverClass);
  }
}

export default TinyDragDropDetector;
