import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/** @typedef {import('./TinyHtmlTemplate.mjs').ClassSetter} ClassSetter */

/**
 * TinyHtmlMedia is a base helper for <audio> and <video> elements.
 * It provides a consistent API to control media playback and access
 * standard {@link HTMLMediaElement} properties and methods.
 *
 * @beta
 */
class TinyHtmlMedia extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlMedia instance.
   * @param {string} tagName - The HTML tag name (e.g., 'audio', 'video').
   * @param {ClassSetter} [tags=[]] - Initial CSS classes to apply.
   * @param {ClassSetter} [mainClass=[]] - Main CSS classes to apply.
   */
  constructor(tagName = '', tags = [], mainClass = []) {
    super(tagName, tags, mainClass);
  }

  // ------------------------
  // Core playback controls
  // ------------------------

  /**
   * Plays all attached media elements.
   * @returns {Promise<void[]>} Resolves when all play calls complete.
   */
  playMedia() {
    /** @type {Promise<void>[]} */
    const plays = [];
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? plays.push(el.play()) : null));
    return Promise.all(plays);
  }

  /**
   * Pauses all attached media elements.
   * @returns {this}
   */
  pauseMedia() {
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? el.pause() : null));
    return this;
  }

  /**
   * Toggles play/pause state for all attached media elements.
   * @returns {this}
   */
  togglePlayMedia() {
    this.elements.forEach((el) => {
      if (el instanceof HTMLMediaElement) {
        el.paused ? el.play() : el.pause();
      }
    });
    return this;
  }

  /**
   * Stops all media by pausing and resetting the current time to `0`.
   * @returns {this}
   */
  stopMedia() {
    this.pauseMedia();
    this.currentTime = 0;
    return this;
  }

  /**
   * Reloads all attached media elements.
   * @returns {this}
   */
  loadMedia() {
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? el.load() : null));
    return this;
  }

  // ------------------------
  // Methods
  // ------------------------

  /**
   * Adds a new text track to the first media element.
   * @param {TextTrackKind} kind - A string representing the TextTrack.kind property (subtitles, captions, descriptions, chapters, or metadata).
   * @param {string} [label] - A string representing the TextTrack.label property.
   * @param {string} [language] - A string representing the TextTrack.language property.
   * @returns {TextTrack}
   */
  addTextTrack(kind, label, language) {
    const first = this.elements[0];
    if (!(first instanceof HTMLMediaElement)) throw new Error('No HTMLMediaElement found to add a text track');
    return first.addTextTrack(kind, label, language);
  }

  /**
   * Checks if a given MIME type can be played.
   * @param {string} type - MIME type (e.g., 'video/mp4').
   * @returns {CanPlayTypeResult} Either "", "probably", or "maybe".
   */
  canPlayType(type) {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.canPlayType(type) : '';
  }

  /**
   * Seeks quickly to a given time if supported.
   * @param {number} time - Target time in seconds.
   * @returns {this}
   */
  fastSeek(time) {
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? el.fastSeek(time) : null));
    return this;
  }

  /**
   * Sets custom MediaKeys on the first media element.
   * @param {MediaKeys|null} keys - Media keys to set.
   * @returns {Promise<void>}
   */
  setMediaKeys(keys) {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.setMediaKeys(keys) : Promise.reject();
  }

  /**
   * Assigns a sink ID (output device) to the first media element.
   * @param {string} id - The sink ID (device ID).
   * @returns {Promise<void>}
   */
  setSinkId(id) {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.setSinkId(id) : Promise.reject();
  }

  // ------------------------
  // Properties (wrappers)
  // ------------------------

  /** @type {boolean} Autoplay state of the media. */
  get autoplay() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.autoplay : false;
  }
  set autoplay(v) {
    this.setProp('autoplay', v);
  }

  /** @returns {TimeRanges} The buffered time ranges. */
  get buffered() {
    const first = this.elements[0];
    if (!(first instanceof HTMLMediaElement)) throw new Error('No HTMLMediaElement found to access buffered ranges');
    return first.buffered;
  }

  /** @type {boolean} Whether default controls are visible. */
  get controls() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.controls : false;
  }
  set controls(v) {
    this.setProp('controls', v);
  }

  /** @type {string|null} The list of controls available. */
  get controlsList() {
    return this.attr('controlsList');
  }
  set controlsList(v) {
    this.setAttr('controlsList', v);
  }

  /** @type {string|null} CORS setting for the media. */
  get crossOrigin() {
    return this.attr('crossOrigin');
  }
  set crossOrigin(v) {
    this.setAttr('crossOrigin', v);
  }

  /** @returns {string} The resolved source URL currently playing. */
  get currentSrc() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.currentSrc : '';
  }

  /** @type {number} The current playback position in seconds. */
  get currentTime() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.currentTime : 0;
  }
  set currentTime(t) {
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? (el.currentTime = t) : null));
  }

  /** @type {boolean} Whether media is muted by default. */
  get defaultMuted() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.defaultMuted : false;
  }
  set defaultMuted(v) {
    this.setProp('defaultMuted', v);
  }

  /** @type {number} Default playback rate (1 = normal speed). */
  get defaultPlaybackRate() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.defaultPlaybackRate : 1;
  }
  set defaultPlaybackRate(v) {
    this.elements.forEach((el) =>
      el instanceof HTMLMediaElement ? (el.defaultPlaybackRate = v) : null,
    );
  }

  /** @type {boolean} Whether remote playback is disabled. */
  get disableRemotePlayback() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.disableRemotePlayback : false;
  }
  set disableRemotePlayback(v) {
    this.setProp('disableRemotePlayback', v);
  }

  /** @returns {number} The duration of the media in seconds. */
  get duration() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.duration : 0;
  }

  /** @returns {boolean} Whether the media has ended. */
  get ended() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.ended : false;
  }

  /** @returns {MediaError|null} Error state if media failed to load. */
  get error() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.error : null;
  }

  /** @type {boolean} Whether the media should loop. */
  get loop() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.loop : false;
  }
  set loop(v) {
    this.setProp('loop', v);
  }

  /** @type {string|null} Media group name for synchronization. */
  get mediaGroup() {
    return this.attr('mediaGroup');
  }
  set mediaGroup(v) {
    this.setAttr('mediaGroup', v);
  }

  /** @returns {MediaKeys|null} The associated MediaKeys object. */
  get mediaKeys() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.mediaKeys : null;
  }

  /** @type {boolean} Whether the media is muted. */
  get muted() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.muted : false;
  }
  set muted(state) {
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? (el.muted = state) : null));
  }

  /** @returns {number} Network state (see `HTMLMediaElement.networkState`). */
  get networkState() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.networkState : 0;
  }

  /** @returns {boolean} Whether the media is currently paused. */
  get paused() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.paused : true;
  }

  /** @type {number} Current playback rate (1 = normal speed). */
  get playbackRate() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.playbackRate : 1;
  }
  set playbackRate(rate) {
    this.elements.forEach((el) =>
      el instanceof HTMLMediaElement ? (el.playbackRate = rate) : null,
    );
  }

  /** @returns {TimeRanges} Played time ranges. */
  get played() {
    const first = this.elements[0];
    if (!(first instanceof HTMLMediaElement)) throw new Error('No HTMLMediaElement found to access played ranges');
    return first.played;
  }

  /** @type {"" | "metadata" | "none" | "auto"} Preload strategy ('none', 'metadata', 'auto'). */
  get preload() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.preload : '';
  }
  set preload(v) {
    this.setAttr('preload', v);
  }

  /** @type {boolean} Whether pitch is preserved when rate changes. */
  get preservesPitch() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.preservesPitch : false;
  }
  set preservesPitch(v) {
    this.setProp('preservesPitch', v);
  }

  /** @returns {number} Ready state of the media. */
  get readyState() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.readyState : 0;
  }

  /** @returns {any} Remote playback interface. */
  get remote() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.remote : null;
  }

  /** @returns {TimeRanges} Seekable time ranges. */
  get seekable() {
    const first = this.elements[0];
    if (!(first instanceof HTMLMediaElement)) throw new Error('No HTMLMediaElement found to access seekable ranges');
    return first.seekable;
  }

  /** @returns {boolean} Whether the media is currently seeking. */
  get seeking() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.seeking : false;
  }

  /** @returns {string} Current sink ID (output device). */
  get sinkId() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.sinkId : '';
  }

  /** @type {string|null} Source URL of the media. */
  get src() {
    return this.attr('src');
  }
  set src(v) {
    this.setAttr('src', v);
  }

  /** @type {MediaProvider|null} Current `srcObject` (e.g., MediaStream). */
  get srcObject() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.srcObject : null;
  }
  set srcObject(v) {
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? (el.srcObject = v) : null));
  }

  /** @returns {TextTrackList} Available text tracks. */
  get textTracks() {
    const first = this.elements[0];
    if (!(first instanceof HTMLMediaElement)) throw new Error('No HTMLMediaElement found to access text tracks');
    return first.textTracks;
  }

  /**
   * Gets the current volume.
   * @returns {number} Value between 0.0 and 1.0.
   */
  get volume() {
    const first = this.elements[0];
    return first instanceof HTMLMediaElement ? first.volume : 1;
  }
  /**
   * Sets the volume level.
   * @param {number} level - Value between 0.0 and 1.0.
   * @throws {TypeError} If not a number.
   */
  set volume(level) {
    if (typeof level !== 'number') {
      throw new TypeError('Volume must be a number between 0 and 1');
    }
    const safe = Math.min(1, Math.max(0, level));
    this.elements.forEach((el) => (el instanceof HTMLMediaElement ? (el.volume = safe) : null));
  }
}

export default TinyHtmlMedia;
