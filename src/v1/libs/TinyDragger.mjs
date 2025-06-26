import { getHtmlElBordersWidth } from '../basics/html.mjs';
import { isJsonObject } from '../basics/objFilter.mjs';

/**
 * @typedef {Object} VibrationPatterns
 * @property {number[]|false} start - Pattern to vibrate on start
 * @property {number[]|false} end - Pattern to vibrate on end
 * @property {number[]|false} collide - Pattern to vibrate on collision
 * @property {number[]|false} move - Pattern to vibrate while moving
 */

/**
 * TinyDragger enables drag-and-drop functionality for a DOM element.
 * It supports jail boundaries, optional collision detection, vibration feedback,
 * automatic reverting, proxy dragging, and event dispatching.
 */
class TinyDragger {
  #enabled = true;
  #destroyed = false;

  #offsetY = 0;
  #offsetX = 0;

  #lockInsideJail = false;
  #revertOnDrop = false;
  #dragging = false;
  #collisionByMouse = false;
  #dropInJailOnly = false;

  /** @type {HTMLElement|null} */
  #lastCollision = null;

  /** @type {HTMLElement[]} */
  #collidables = [];

  /** @type {HTMLElement|null} */
  #dragProxy = null;

  /** @type {Record<string, number[]|boolean>} */
  #vibration = { start: false, end: false, collide: false, move: false };

  /** @type {HTMLElement|null} */
  #jail = null;

  #target;

  #dragHiddenClass = 'drag-hidden';
  #classDragging = 'dragging';
  #classBodyDragging = 'drag-active';
  #classJailDragging = 'jail-drag-active';
  #classJailDragDisabled = 'jail-drag-disabled';
  #classDragCollision = 'dragging-collision';

  /** @typedef {(event: TouchEvent) => void} TouchDragEvent */

  /**
   * @param {HTMLElement} targetElement - The element to make draggable.
   * @param {Object} [options={}] - Configuration options.
   * @param {HTMLElement} [options.jail] - Optional container to restrict dragging within.
   * @param {boolean} [options.collisionByMouse=false] - Use mouse position for collision instead of element rect.
   * @param {string} [options.classDragging='dragging'] - CSS class applied to the clone during dragging.
   * @param {string} [options.classBodyDragging='drag-active'] - CSS class applied to <body> during dragging.
   * @param {string} [options.classJailDragging='jail-drag-active'] - CSS class applied to jail element during drag.
   * @param {string} [options.classJailDragDisabled='jail-drag-disabled'] - CSS class applied to jail element disabled.
   * @param {string} [options.classDragCollision='dragging-collision'] - CSS class applied to collision element.
   * @param {boolean} [options.lockInsideJail=false] - Restrict movement within the jail container.
   * @param {boolean} [options.dropInJailOnly=false] - Restrict drop within the jail container.
   * @param {VibrationPatterns|false} [options.vibration=false] - Vibration feedback configuration.
   * @param {boolean} [options.revertOnDrop=false] - Whether to return to original position on drop.
   * @param {string} [options.classHidden='drag-hidden'] - CSS class to hide original element during dragging.
   * @throws {Error} If any option has an invalid type.
   */
  constructor(targetElement, options = {}) {
    if (!(targetElement instanceof HTMLElement))
      throw new Error('TinyDragger requires a valid target HTMLElement to initialize.');

    this.#target = targetElement;

    // === Validations ===
    if (options.jail !== undefined && !(options.jail instanceof HTMLElement))
      throw new Error('The "jail" option must be an HTMLElement if provided.');

    if (
      options.vibration !== undefined &&
      options.vibration !== false &&
      !isJsonObject(options.vibration)
    )
      throw new Error('The "vibration" option must be an object or false.');

    /**
     * @param {any} val
     * @param {string} name
     */
    const validateBoolean = (val, name) => {
      if (val !== undefined && typeof val !== 'boolean') {
        throw new Error(`The "${name}" option must be a boolean.`);
      }
    };

    /**
     * @param {any} val
     * @param {string} name
     */
    const validateString = (val, name) => {
      if (val !== undefined && typeof val !== 'string') {
        throw new Error(`The "${name}" option must be a string.`);
      }
    };

    validateBoolean(options.collisionByMouse, 'collisionByMouse');
    validateBoolean(options.lockInsideJail, 'lockInsideJail');
    validateBoolean(options.dropInJailOnly, 'dropInJailOnly');
    validateBoolean(options.revertOnDrop, 'revertOnDrop');

    validateString(options.classDragging, 'classDragging');
    validateString(options.classBodyDragging, 'classBodyDragging');
    validateString(options.classJailDragging, 'classJailDragging');
    validateString(options.classJailDragDisabled, 'classJailDragDisabled');
    validateString(options.classDragCollision, 'classDragCollision');
    validateString(options.classHidden, 'classHidden');

    if (options.jail instanceof HTMLElement) this.#jail = options.jail;
    this.#vibration = Object.assign(
      { start: false, end: false, collide: false, move: false },
      options.vibration || {},
    );

    if (typeof options.classDragging === 'string') this.#classDragging = options.classDragging;
    if (typeof options.classBodyDragging === 'string')
      this.#classBodyDragging = options.classBodyDragging;
    if (typeof options.classJailDragging === 'string')
      this.#classJailDragging = options.classJailDragging;
    if (typeof options.classJailDragDisabled === 'string')
      this.#classJailDragDisabled = options.classJailDragDisabled;
    if (typeof options.classHidden === 'string') this.#dragHiddenClass = options.classHidden;
    if (typeof options.classDragCollision === 'string')
      this.#classDragCollision = options.classDragCollision;

    if (typeof options.collisionByMouse === 'boolean')
      this.#collisionByMouse = options.collisionByMouse;
    if (typeof options.revertOnDrop === 'boolean') this.#revertOnDrop = options.revertOnDrop;
    if (typeof options.lockInsideJail === 'boolean') this.#lockInsideJail = options.lockInsideJail;
    if (typeof options.dropInJailOnly === 'boolean') this.#dropInJailOnly = options.dropInJailOnly;

    this._onMouseDown = this.#startDrag.bind(this);
    this._onMouseMove = this.#drag.bind(this);
    this._onMouseUp = this.#endDrag.bind(this);

    /** @type {TouchDragEvent} */
    this._onTouchStart = (e) => this.#startDrag(e.touches[0]);

    /** @type {TouchDragEvent} */
    this._onTouchMove = (e) => this.#drag(e.touches[0]);

    /** @type {TouchDragEvent} */
    this._onTouchEnd = (e) => this.#endDrag(e.changedTouches[0]);

    this.#target.addEventListener('mousedown', this._onMouseDown);
    this.#target.addEventListener('touchstart', this._onTouchStart, { passive: false });
  }

  /**
   * Enables the drag functionality.
   */
  enable() {
    this.#checkDestroy();
    if (this.#jail) this.#jail.classList.add(this.#classJailDragDisabled);
    this.#enabled = true;
  }

  /**
   * Disables the drag functionality.
   */
  disable() {
    if (this.#jail) this.#jail.classList.remove(this.#classJailDragDisabled);
    this.#enabled = false;
  }

  /**
   * Adds an element to be considered for collision detection.
   * @param {HTMLElement} element - The element to track collisions with.
   * @throws {Error} If the element is not a valid HTMLElement.
   */
  addCollidable(element) {
    this.#checkDestroy();
    if (!(element instanceof HTMLElement))
      throw new Error('addCollidable expects an HTMLElement as argument.');
    if (!this.#collidables.includes(element)) this.#collidables.push(element);
  }

  /**
   * Removes a collidable element from the tracking list.
   * @param {HTMLElement} element - The element to remove.
   * @throws {Error} If the element is not a valid HTMLElement.
   */
  removeCollidable(element) {
    this.#checkDestroy();
    if (!(element instanceof HTMLElement))
      throw new Error('removeCollidable expects an HTMLElement as argument.');
    this.#collidables = this.#collidables.filter((el) => el !== element);
  }

  /**
   * Sets vibration patterns for drag events.
   * @param {Object} [param0={}] - Vibration pattern configuration.
   * @param {number[]|false} [param0.startPattern=false] - Vibration on drag start.
   * @param {number[]|false} [param0.endPattern=false] - Vibration on drag end.
   * @param {number[]|false} [param0.collidePattern=false] - Vibration on collision.
   * @param {number[]|false} [param0.movePattern=false] - Vibration during movement.
   * @throws {Error} If any pattern is not false or an array of numbers.
   */
  setVibrationPattern({
    startPattern = false,
    endPattern = false,
    collidePattern = false,
    movePattern = false,
  } = {}) {
    this.#checkDestroy();

    /** @param {any} value */
    const isValidPattern = (value) =>
      value === false || (Array.isArray(value) && value.every((n) => typeof n === 'number'));

    if (!isValidPattern(startPattern))
      throw new Error('Invalid "startPattern": must be false or an array of numbers.');
    if (!isValidPattern(endPattern))
      throw new Error('Invalid "endPattern": must be false or an array of numbers.');
    if (!isValidPattern(collidePattern))
      throw new Error('Invalid "collidePattern": must be false or an array of numbers.');
    if (!isValidPattern(movePattern))
      throw new Error('Invalid "movePattern": must be false or an array of numbers.');

    this.#vibration = {
      start: startPattern,
      end: endPattern,
      collide: collidePattern,
      move: movePattern,
    };
  }

  /**
   * Disables all vibration feedback.
   */
  disableVibration() {
    this.#checkDestroy();
    this.#vibration = { start: false, end: false, collide: false, move: false };
  }

  /**
   * Calculates the cursor offset relative to the top-left of the target element.
   * @param {MouseEvent|Touch} event - The mouse or touch event.
   * @returns {{x: number, y: number}} The offset in pixels.
   * @throws {Error} If event is not a MouseEvent or Touch with clientX/clientY.
   */
  getOffset(event) {
    this.#checkDestroy();
    if (
      (!(event instanceof MouseEvent) && !(event instanceof Touch)) ||
      typeof event.clientX !== 'number' ||
      typeof event.clientY !== 'number'
    )
      throw new Error('getOffset expects an event with valid clientX and clientY coordinates.');

    const targetRect = this.#target.getBoundingClientRect();
    const { left: borderLeft, top: borderTop } = getHtmlElBordersWidth(this.#target);
    return {
      x: event.clientX - targetRect.left + borderLeft,
      y: event.clientY - targetRect.top + borderTop,
    };
  }

  /**
   * Handles the start of a drag event.
   * @param {MouseEvent|Touch} event - The initiating event.
   */
  #startDrag(event) {
    if (event instanceof MouseEvent) event.preventDefault();
    if (this.#destroyed || !this.#enabled || !this.#target.parentElement) return;

    const dragProxy = this.#target.cloneNode(true);
    if (!(dragProxy instanceof HTMLElement)) return;
    this.#dragProxy = dragProxy;

    this.#dragging = true;

    const rect = this.#target.getBoundingClientRect();

    Object.assign(this.#dragProxy.style, {
      position: 'absolute',
      pointerEvents: 'none',
      left: `${this.#target.offsetLeft}px`,
      top: `${this.#target.offsetTop}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: 9999,
    });

    this.#target.classList.add(this.#dragHiddenClass);
    this.#target.parentElement.appendChild(this.#dragProxy);

    const { x: offsetX, y: offsetY } = this.getOffset(event);
    this.#offsetX = offsetX;
    this.#offsetY = offsetY;

    this.#dragProxy.classList.add(this.#classDragging);
    document.body.classList.add(this.#classBodyDragging);
    if (this.#jail) this.#jail.classList.add(this.#classJailDragging);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);

    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend', this._onTouchEnd);

    if (navigator.vibrate && Array.isArray(this.#vibration.start)) {
      navigator.vibrate(this.#vibration.start);
    }

    this.#checkDragCollision(event);
    this.#dispatchEvent('drag');
  }

  /**
   * Handles dragging collision.
   * @param {MouseEvent|Touch} event - The drag event.
   */
  #checkDragCollision(event) {
    const { collidedElement: collided } = this.#execCollision(event);
    if (collided && collided !== this.#lastCollision) {
      if (navigator.vibrate && Array.isArray(this.#vibration.collide)) {
        navigator.vibrate(this.#vibration.collide);
      }
      this.#lastCollision = collided;
      if (this.#lastCollision) this.#lastCollision.classList.add(this.#classDragCollision);
    } else if (!collided) {
      if (this.#lastCollision) this.#lastCollision.classList.remove(this.#classDragCollision);
      this.#lastCollision = null;
    }
  }

  /**
   * Handles dragging movement.
   * @param {MouseEvent|Touch} event - The drag event.
   */
  #drag(event) {
    if (event instanceof MouseEvent) event.preventDefault();
    if (this.#destroyed || !this.#dragging || !this.#enabled || !this.#dragProxy) return;

    const parent = this.#dragProxy.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();

    let x = event.clientX - parentRect.left - this.#offsetX;
    let y = event.clientY - parentRect.top - this.#offsetY;

    if (this.#lockInsideJail && this.#jail) {
      const jailRect = this.#jail.getBoundingClientRect();
      const targetRect = this.#dragProxy.getBoundingClientRect();

      const jailLeft = jailRect.left - parentRect.left;
      const jailTop = jailRect.top - parentRect.top;

      const { x: borderX, y: borderY } = getHtmlElBordersWidth(this.#jail);
      const maxX = jailLeft + jailRect.width - targetRect.width - borderY;
      const maxY = jailTop + jailRect.height - targetRect.height - borderX;

      x = Math.max(jailLeft, Math.min(x, maxX));
      y = Math.max(jailTop, Math.min(y, maxY));
    }

    this.#dragProxy.style.position = 'absolute';
    this.#dragProxy.style.left = `${x}px`;
    this.#dragProxy.style.top = `${y}px`;

    if (navigator.vibrate && Array.isArray(this.#vibration.move)) {
      navigator.vibrate(this.#vibration.move);
    }

    this.#checkDragCollision(event);
    this.#dispatchEvent('dragging');
  }

  /**
   * Handles the collision of a drag.
   * @param {MouseEvent|Touch} event - The release event.
   * @returns {{ inJail: boolean; collidedElement: HTMLElement|null }}
   */
  #execCollision(event) {
    if (this.#destroyed || !this.#dragProxy) return { inJail: false, collidedElement: null };

    let collidedElement;
    let inJail = true;
    const jailRect = this.#jail?.getBoundingClientRect();
    if (this.#collisionByMouse) {
      const x = event.clientX;
      const y = event.clientY;
      if (this.#dropInJailOnly && this.#jail && jailRect) {
        inJail =
          x >= jailRect.left && x <= jailRect.right && y >= jailRect.top && y <= jailRect.bottom;
      }

      collidedElement = inJail ? this.getCollidedElement(x, y) : null;
    } else {
      const targetRect = this.#dragProxy.getBoundingClientRect();
      if (this.#dropInJailOnly && this.#jail && jailRect) {
        inJail =
          targetRect.left >= jailRect.left &&
          targetRect.right <= jailRect.right &&
          targetRect.top >= jailRect.top &&
          targetRect.bottom <= jailRect.bottom;
      }

      collidedElement = inJail ? this.getCollidedElementByRect(targetRect) : null;
    }

    return { inJail, collidedElement };
  }

  /**
   * Handles the end of a drag.
   * @param {MouseEvent|Touch} event - The release event.
   */
  #endDrag(event) {
    if (event instanceof MouseEvent) event.preventDefault();
    if (this.#destroyed || !this.#dragging) return;

    this.#dragging = false;
    if (!this.#dragProxy) return;

    this.#target.classList.remove(this.#classDragging);
    document.body.classList.remove(this.#classBodyDragging);
    if (this.#jail) this.#jail.classList.remove(this.#classJailDragging);

    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);

    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);
    const { collidedElement } = this.#execCollision(event);

    if (navigator.vibrate && Array.isArray(this.#vibration.end)) {
      navigator.vibrate(this.#vibration.end);
    }

    const newX = this.#dragProxy.style.left;
    const newY = this.#dragProxy.style.top;
    if (this.#dragProxy) {
      this.#dragProxy.remove();
      this.#dragProxy = null;
    }

    if (this.#lastCollision) this.#lastCollision.classList.remove(this.#classDragCollision);
    this.#lastCollision = null;

    this.#target.classList.remove(this.#dragHiddenClass);
    if (!this.#revertOnDrop) {
      this.#target.style.left = newX;
      this.#target.style.top = newY;
    }

    const dropEvent = new CustomEvent('drop', {
      detail: {
        target: collidedElement,
      },
    });

    this.#target.dispatchEvent(dropEvent);
  }

  /**
   * Detects collision based on rectangle intersection.
   * @param {DOMRect} rect - Bounding rectangle of the dragged proxy.
   * @returns {HTMLElement|null} The collided element or null.
   * @throws {Error} If rect is not a DOMRect with valid numeric properties.
   */
  getCollidedElementByRect(rect) {
    this.#checkDestroy();
    if (
      !(rect instanceof DOMRect) ||
      typeof rect.left !== 'number' ||
      typeof rect.right !== 'number' ||
      typeof rect.top !== 'number' ||
      typeof rect.bottom !== 'number'
    )
      throw new Error('getCollidedElementByRect expects a valid DOMRect object.');

    return (
      this.#collidables.find((el) => {
        const elRect = el.getBoundingClientRect();
        return !(
          rect.right < elRect.left ||
          rect.left > elRect.right ||
          rect.bottom < elRect.top ||
          rect.top > elRect.bottom
        );
      }) || null
    );
  }

  /**
   * Detects collision with a point using element bounding rectangles.
   * @param {number} x - Horizontal screen coordinate.
   * @param {number} y - Vertical screen coordinate.
   * @returns {HTMLElement|null} The collided element or null.
   */
  getCollidedElement(x, y) {
    this.#checkDestroy();
    if (typeof x !== 'number' || typeof y !== 'number')
      throw new Error('getCollidedElement expects numeric x and y coordinates.');

    return (
      this.#collidables.find((el) => {
        const rect = el.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      }) || null
    );
  }

  /**
   * Dispatches a custom event from the target element.
   * @param {string} type - The event name.
   */
  #dispatchEvent(type) {
    const event = new CustomEvent(type);
    this.#target.dispatchEvent(event);
  }

  /**
   * Internal method to verify if the instance has been destroyed.
   * Throws an error if any operation is attempted after destruction.
   */
  #checkDestroy() {
    if (this.#destroyed)
      throw new Error('This TinyDragger instance has been destroyed and can no longer be used.');
  }

  /**
   * Completely disables drag-and-drop and cleans up all event listeners.
   * Does NOT remove the original HTML element.
   */
  destroy() {
    if (this.#destroyed) return;
    this.disable();

    this.#target.removeEventListener('mousedown', this._onMouseDown);
    this.#target.removeEventListener('touchstart', this._onTouchStart);

    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);

    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);

    if (this.#lastCollision) this.#lastCollision.classList.remove(this.#classDragCollision);
    if (this.#dragProxy) {
      this.#dragProxy.remove();
      this.#dragProxy = null;
    }

    this.#collidables = [];
    this.#dragging = false;
    this.#lastCollision = null;

    this.#target.classList.remove(this.#dragHiddenClass, this.#classDragging);
    document.body.classList.remove(this.#classBodyDragging);
    if (this.#jail)
      this.#jail.classList.remove(this.#classJailDragging, this.#classJailDragDisabled);

    this.#destroyed = true;
  }
}

export default TinyDragger;
