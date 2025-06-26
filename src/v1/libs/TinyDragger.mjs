import { getHtmlElBordersWidth } from '../basics/html.mjs';

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
  /**
   * @param {HTMLElement} targetElement - The element to make draggable.
   * @param {Object} [options={}] - Configuration options.
   * @param {HTMLElement} [options.jail] - Optional container to restrict dragging within.
   * @param {boolean} [options.collisionByMouse=false] - Use mouse position for collision instead of element rect.
   * @param {string} [options.classDragging='dragging'] - CSS class applied to the clone during dragging.
   * @param {string} [options.classBodyDragging='drag-active'] - CSS class applied to <body> during dragging.
   * @param {string} [options.classJailDragging='jail-drag-active'] - CSS class applied to jail element during drag.
   * @param {boolean} [options.lockInsideJail=false] - Restrict movement within the jail container.
   * @param {VibrationPatterns|false} [options.vibration=false] - Vibration feedback configuration.
   * @param {boolean} [options.revertOnDrop=false] - Whether to return to original position on drop.
   * @param {string} [options.classHidden='drag-hidden'] - CSS class to hide original element during dragging.
   */
  constructor(targetElement, options = {}) {
    this.target = targetElement;
    this.jail = options.jail || null;
    this.classDragging = options.classDragging || 'dragging';
    this.classBodyDragging = options.classBodyDragging || 'drag-active';
    this.classJailDragging = options.classJailDragging || 'jail-drag-active';
    this.lockInsideJail = options.lockInsideJail || false;
    this.collisionByMouse = options.collisionByMouse || false;
    this.vibration = Object.assign(
      { start: false, end: false, collide: false, move: false },
      options.vibration || {},
    );

    this.revertOnDrop = options.revertOnDrop || false;
    this.dragHiddenClass = options.classHidden || 'drag-hidden';
    this.dragProxy = null;
    this.originalPos = { left: 0, top: 0 };

    this.collidables = [];
    this.dragging = false;
    this.lastCollision = null;

    this._onMouseDown = this._startDrag.bind(this);
    this._onMouseMove = this._drag.bind(this);
    this._onMouseUp = this._endDrag.bind(this);

    this._onTouchStart = (e) => this._startDrag(e.touches[0]);
    this._onTouchMove = (e) => this._drag(e.touches[0]);
    this._onTouchEnd = (e) => this._endDrag(e.changedTouches[0]);

    this.target.addEventListener('mousedown', this._onMouseDown);
    this.target.addEventListener('touchstart', this._onTouchStart, { passive: false });
  }

  /**
   * Adds an element to be considered for collision detection.
   * @param {HTMLElement} element - The element to track collisions with.
   */
  addCollidable(element) {
    if (!this.collidables.includes(element)) this.collidables.push(element);
  }

  /**
   * Removes a collidable element from the tracking list.
   * @param {HTMLElement} element - The element to remove.
   */
  removeCollidable(element) {
    this.collidables = this.collidables.filter((el) => el !== element);
  }

  /**
   * Sets vibration patterns for drag events.
   * @param {Object} [param0={}] - Vibration pattern configuration.
   * @param {number[]|false} [param0.startPattern=false] - Vibration on drag start.
   * @param {number[]|false} [param0.endPattern=false] - Vibration on drag end.
   * @param {number[]|false} [param0.collidePattern=false] - Vibration on collision.
   * @param {number[]|false} [param0.movePattern=false] - Vibration during movement.
   */
  setVibrationPattern({
    startPattern = false,
    endPattern = false,
    collidePattern = false,
    movePattern = false,
  } = {}) {
    this.vibration = {
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
    this.vibration = { start: false, end: false, collide: false, move: false };
  }

  /**
   * Calculates the cursor offset relative to the top-left of the target element.
   * @param {MouseEvent|Touch} event - The mouse or touch event.
   * @returns {{x: number, y: number}} The offset in pixels.
   */
  getOffset(event) {
    const targetRect = this.target.getBoundingClientRect();
    const { left: borderLeft, top: borderTop } = getHtmlElBordersWidth(this.target);
    return {
      x: event.clientX - targetRect.left + borderLeft,
      y: event.clientY - targetRect.top + borderTop,
    };
  }

  /**
   * Handles the start of a drag event.
   * @param {MouseEvent|Touch} event - The initiating event.
   * @private
   */
  _startDrag(event) {
    event.preventDefault();
    this.dragging = true;

    const rect = this.target.getBoundingClientRect();
    this.originalPos = {
      left: this.target.offsetLeft,
      top: this.target.offsetTop,
    };

    this.dragProxy = this.target.cloneNode(true);
    Object.assign(this.dragProxy.style, {
      position: 'absolute',
      pointerEvents: 'none',
      left: `${this.target.offsetLeft}px`,
      top: `${this.target.offsetTop}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: 9999,
    });

    this.target.classList.add(this.dragHiddenClass);
    this.target.parentElement.appendChild(this.dragProxy);

    const { x: offsetX, y: offsetY } = this.getOffset(event);
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.dragProxy.classList.add(this.classDragging);
    document.body.classList.add(this.classBodyDragging);
    if (this.jail) this.jail.classList.add(this.classJailDragging);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);

    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend', this._onTouchEnd);

    if (navigator.vibrate && this.vibration.start) {
      navigator.vibrate(this.vibration.start);
    }

    this._dispatchEvent('drag');
  }

  /**
   * Handles dragging movement.
   * @param {MouseEvent|Touch} event - The drag event.
   * @private
   */
  _drag(event) {
    if (!this.dragging) return;

    const parent = this.dragProxy.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();

    let x = event.clientX - parentRect.left - this.offsetX;
    let y = event.clientY - parentRect.top - this.offsetY;

    if (this.lockInsideJail && this.jail) {
      const jailRect = this.jail.getBoundingClientRect();
      const targetRect = this.dragProxy.getBoundingClientRect();

      const jailLeft = jailRect.left - parentRect.left;
      const jailTop = jailRect.top - parentRect.top;

      const { x: borderX, y: borderY } = getHtmlElBordersWidth(this.jail);
      const maxX = jailLeft + jailRect.width - targetRect.width - borderY;
      const maxY = jailTop + jailRect.height - targetRect.height - borderX;

      x = Math.max(jailLeft, Math.min(x, maxX));
      y = Math.max(jailTop, Math.min(y, maxY));
    }

    this.dragProxy.style.position = 'absolute';
    this.dragProxy.style.left = `${x}px`;
    this.dragProxy.style.top = `${y}px`;

    if (navigator.vibrate && this.vibration.move) {
      navigator.vibrate(this.vibration.move);
    }

    const collided = this._getCollidedElement(event.clientX, event.clientY);
    if (collided && collided !== this.lastCollision) {
      if (navigator.vibrate && this.vibration.collide) {
        navigator.vibrate(this.vibration.collide);
      }
      this.lastCollision = collided;
    } else if (!collided) {
      this.lastCollision = null;
    }

    this._dispatchEvent('dragging');
  }

  /**
   * Handles the end of a drag.
   * @param {MouseEvent|Touch} event - The release event.
   * @private
   */
  _endDrag(event) {
    if (!this.dragging) return;

    this.dragging = false;

    this.target.classList.remove(this.classDragging);
    document.body.classList.remove(this.classBodyDragging);
    if (this.jail) this.jail.classList.remove(this.classJailDragging);

    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);

    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);

    let collidedElement;
    let inJail = true;
    const jailRect = this.jail?.getBoundingClientRect();
    if (this.collisionByMouse) {
      const x = event.clientX;
      const y = event.clientY;
      if (this.jail && jailRect) {
        inJail =
          x >= jailRect.left && x <= jailRect.right && y >= jailRect.top && y <= jailRect.bottom;
      }

      collidedElement = inJail ? this._getCollidedElement(x, y) : null;
    } else {
      const targetRect = this.dragProxy.getBoundingClientRect();
      if (this.jail && jailRect) {
        inJail =
          targetRect.left >= jailRect.left &&
          targetRect.right <= jailRect.right &&
          targetRect.top >= jailRect.top &&
          targetRect.bottom <= jailRect.bottom;
      }

      collidedElement = inJail ? this._getCollidedElementByRect(targetRect) : null;
    }

    if (navigator.vibrate && this.vibration.end) {
      navigator.vibrate(this.vibration.end);
    }

    const newX = this.dragProxy.style.left;
    const newY = this.dragProxy.style.top;
    if (this.dragProxy) {
      this.dragProxy.remove();
      this.dragProxy = null;
    }

    this.target.classList.remove(this.dragHiddenClass);
    if (!this.revertOnDrop) {
      this.target.style.left = newX;
      this.target.style.top = newY;
    }

    const dropEvent = new CustomEvent('drop', {
      detail: {
        target: collidedElement,
      },
    });

    this.target.dispatchEvent(dropEvent);
  }

  /**
   * Detects collision based on rectangle intersection.
   * @param {DOMRect} rect - Bounding rectangle of the dragged proxy.
   * @returns {HTMLElement|null} The collided element or null.
   * @private
   */
  _getCollidedElementByRect(rect) {
    return (
      this.collidables.find((el) => {
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
   * @private
   */
  _getCollidedElement(x, y) {
    return (
      this.collidables.find((el) => {
        const rect = el.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      }) || null
    );
  }

  /**
   * Dispatches a custom event from the target element.
   * @param {string} type - The event name.
   * @private
   */
  _dispatchEvent(type) {
    const event = new CustomEvent(type);
    this.target.dispatchEvent(event);
  }
}

export default TinyDragger;
