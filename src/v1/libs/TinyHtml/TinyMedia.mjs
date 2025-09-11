import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/** @typedef {import('./TinyHtmlTemplate.mjs').ClassSetter} ClassSetter */

class TinyMedia extends TinyHtmlTemplate {
    /**
   * Creates a new TinyHtmlTemplate instance.
   * @param {string} tagName - The HTML tag name to create (e.g., 'div', 'span').
   * @param {ClassSetter} [tags=[]] - Initial CSS classes to apply.
   * @param {ClassSetter} [mainClass=[]] - Main CSS classes to apply.
   */
  constructor(tagName = '', tags = [], mainClass = []) {
    super(tagName, tags, mainClass);
  }

  /**
   * Plays all video elements.
   * @returns {Promise<void[]>}
   */
  playMedia() {
    /** @type {Promise<void>[]} */
    const plays = [];
    this.elements.forEach((element) =>
      element instanceof HTMLVideoElement ? plays.push(element.play()) : null,
    );
    return Promise.all(plays);
  }

  /**
   * Pauses all video elements.
   * @returns {this}
   */
  pauseMedia() {
    this.elements.forEach((element) =>
      element instanceof HTMLVideoElement ? element.pause() : null,
    );
    return this;
  }

  /** @returns {this} */
  togglePlayMedia() {
    this.elements.forEach((el) => {
      if (el instanceof HTMLVideoElement) {
        el.paused ? el.play() : el.pause();
      }
    });
    return this;
  }

  /** @returns {this} */
  stopMedia() {
    this.pauseMedia();
    this.currentTime = 0;
    return this;
  }

  /** @returns {boolean} */
  isPausedMedia() {
    const first = this.elements[0];
    return first instanceof HTMLVideoElement ? first.paused : true;
  }

  // ------------------------
  // Time controls
  // ------------------------

  /** @returns {number} */
  get currentTime() {
    const first = this.elements[0];
    return first instanceof HTMLVideoElement ? first.currentTime : 0;
  }

  /** @param {number} time */
  set currentTime(time) {
    this.elements.forEach((el) =>
      el instanceof HTMLVideoElement ? (el.currentTime = time) : null,
    );
  }

  /** @returns {number} */
  get duration() {
    const first = this.elements[0];
    return first instanceof HTMLVideoElement ? first.duration : 0;
  }


  /** @returns {TimeRanges|null} */
  get buffered() {
    const first = this.elements[0];
    return first instanceof HTMLVideoElement ? first.buffered : null;
  }

  /** @returns {TimeRanges|null} */
  get played() {
    const first = this.elements[0];
    return first instanceof HTMLVideoElement ? first.played : null;
  }


  // ------------------------
  // Speed controls
  // ------------------------

  /** @returns {number} */
  get playbackRate() {
    const first = this.elements[0];
    return first instanceof HTMLVideoElement ? first.playbackRate : 1;
  }

  /** @param {number} rate */
  set playbackRate(rate) {
    this.elements.forEach((el) =>
      el instanceof HTMLVideoElement ? (el.playbackRate = rate) : null,
    );
  }

  // ------------------------
  // Volume & mute
  // ------------------------

  /** @returns {number} Current volume level. */
  get volume() {
    return this.prop('volume');
  }

  /**
   * Sets the volume of the video (0.0–1.0).
   * @param {number} level
   */
  set volume(level) {
    if (typeof level !== 'number') throw new TypeError('Volume must be a number between 0 and 1');
    this.setProp('volume', Math.min(1, Math.max(0, level)));
  }

  /** @returns {boolean} */
  get muted() {
    const first = this.elements[0];
    return first instanceof HTMLVideoElement ? first.muted : false;
  }

  /** @param {boolean} state */
  set muted(state) {
    this.elements.forEach((el) => (el instanceof HTMLVideoElement ? (el.muted = state) : null));
  }

  /** @returns {this} */
  toggleMute() {
    this.elements.forEach((el) => (el instanceof HTMLVideoElement ? (el.muted = !el.muted) : null));
    return this;
  }
}

export default TinyMedia;
