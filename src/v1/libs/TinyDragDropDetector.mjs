/**
 * @typedef {Object} DragAndDropOptions
 * @property {HTMLElement} [target=document.body] - Element to attach the drag listeners.
 * @property {boolean} [fullscreen=true] - Whether to use the whole page.
 * @property {string} [hoverClass="dnd-hover"] - CSS class to apply when hovering.
 * @property {(files: FileList, event: DragEvent) => void} [onDrop] - Callback when files are dropped.
 * @property {(event: DragEvent) => void} [onEnter] - Optional callback when dragging enters.
 * @property {(event: DragEvent) => void} [onLeave] - Optional callback when dragging leaves.
 */

class TinyDragDropDetector {
  /** @type {HTMLElement} */
  #target;

  /** @type {boolean} */
  fullscreen;

  /** @type {string} */
  hoverClass;

  /** @type {(files: FileList, event: DragEvent) => void} */
  onDropCallback;

  /** @type {(event: DragEvent) => void} */
  onEnterCallback;

  /** @type {(event: DragEvent) => void} */
  onLeaveCallback;

  /** @type {boolean} */
  _isDragging;

  /** @type {boolean} */
  _bound;

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
    this.fullscreen = fullscreen;
    this.hoverClass = hoverClass;

    this.onDropCallback = onDrop || (() => {});
    this.onEnterCallback = onEnter;
    this.onLeaveCallback = onLeave;

    this._isDragging = false;
    this._bound = false;

    // Bind event handlers
    this._handleDragEnter = this._handleDragEnter.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrop = this._handleDrop.bind(this);

    this._bindEvents();
  }

  /**
   * @returns {HTMLElement}
   */
  getTarget() {
    return this.#target;
  }

  /**
   * @private
   * @returns {void}
   */
  _bindEvents() {
    if (this._bound) return;
    const target = this.getTarget();
    target.addEventListener('dragenter', this._handleDragEnter);
    target.addEventListener('dragover', this._handleDragOver);
    target.addEventListener('dragleave', this._handleDragLeave);
    target.addEventListener('drop', this._handleDrop);
    this._bound = true;
  }

  /**
   * @private
   * @returns {void}
   */
  _unbindEvents() {
    if (!this._bound) return;
    const target = this.getTarget();
    target.removeEventListener('dragenter', this._handleDragEnter);
    target.removeEventListener('dragover', this._handleDragOver);
    target.removeEventListener('dragleave', this._handleDragLeave);
    target.removeEventListener('drop', this._handleDrop);
    this._bound = false;
  }

  /**
   * @private
   * @param {DragEvent} event
   * @returns {void}
   */
  _handleDragEnter(event) {
    event.preventDefault();
    if (!this._isDragging) {
      const target = this.getTarget();
      this._isDragging = true;
      target.classList.add(this.hoverClass);
      if (this.onEnterCallback) this.onEnterCallback(event);
    }
  }

  /**
   * @private
   * @param {DragEvent} event
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
   * @private
   * @param {DragEvent} event
   * @returns {void}
   */
  _handleDragLeave(event) {
    event.preventDefault();
    const target = this.getTarget();
    // Check if you've completely left the area
    // @ts-ignore
    if (event.relatedTarget === null || !target.contains(event.relatedTarget)) {
      this._isDragging = false;
      target.classList.remove(this.hoverClass);
      if (this.onLeaveCallback) this.onLeaveCallback(event);
    }
  }

  /**
   * @private
   * @param {DragEvent} event
   * @returns {void}
   */
  _handleDrop(event) {
    event.preventDefault();
    if (!event.dataTransfer) {
      console.warn('[TinyDragDropDetector] [handleDrop] DragOver event missing dataTransfer.');
      return;
    }
    const target = this.getTarget();
    this._isDragging = false;
    target.classList.remove(this.hoverClass);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.onDropCallback(files, event);
    }
  }

  /**
   * Destroys the detector and unbinds all events.
   * @returns {void}
   */
  destroy() {
    this._unbindEvents();
    const target = this.getTarget();
    target.classList.remove(this.hoverClass);
  }
}

export default TinyDragDropDetector;
