import TinyHtmlMedia from '../TinyHtmlMedia.mjs';

/**
 * TinyVideo is a helper for managing <video> elements with extended support for
 * attributes like autoplay, controls, controlslist, crossorigin, loop, muted,
 * playsinline, poster, preload, disablepictureinpicture, and disableremoteplayback.
 * It also provides methods for controlling playback and volume.
 * @beta
 *
 * @extends TinyHtmlMedia<HTMLVideoElement>
 */
class TinyHtmlVideo extends TinyHtmlMedia {
  /**
   * Creates a new TinyVideo instance.
   * @param {Object} config
   * @param {string} [config.src=''] - The video file URL.
   * @param {string} [config.poster=''] - Image URL shown before playback starts.
   * @param {boolean} [config.controls=false] - Whether to show default controls.
   * @param {boolean} [config.autoplay=false] - Start playback automatically (muted may be required).
   * @param {boolean} [config.loop=false] - Replay automatically when finished.
   * @param {boolean} [config.muted=false] - Start playback muted.
   * @param {boolean} [config.playsinline=false] - Play inline instead of fullscreen (mobile devices).
   * @param {'nodownload'|'nofullscreen'|'noremoteplayback'|string} [config.controlslist] - Restrict controls visibility.
   * @param {'anonymous'|'use-credentials'} [config.crossorigin] - CORS setting for the video request.
   * @param {boolean} [config.disablepictureinpicture=false] - Disable Picture-in-Picture mode.
   * @param {boolean} [config.disableremoteplayback=false] - Disable casting / remote playback.
   * @param {'auto'|'metadata'|'none'} [config.preload] - Preload behavior suggestion.
   * @param {number} [config.width] - CSS pixel width of the video display.
   * @param {number} [config.height] - CSS pixel height of the video display.
   * @param {number} [config.volume] - Initial volume (0.0–1.0).
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""] - Main CSS class applied.
   */
  constructor({
    src = '',
    poster = '',
    controls = false,
    autoplay = false,
    loop = false,
    muted = false,
    playsinline = false,
    controlslist,
    crossorigin,
    disablepictureinpicture = false,
    disableremoteplayback = false,
    preload,
    width,
    height,
    volume,
    tags = [],
    mainClass = '',
  }) {
    super(document.createElement('video'), tags, mainClass);

    if (src) this.setAttr('src', src);
    if (poster) this.setAttr('poster', poster);
    if (preload) this.setAttr('preload', preload);

    if (controls) this.addProp('controls');
    if (autoplay) this.addProp('autoplay');
    if (loop) this.addProp('loop');
    if (muted) this.addProp('muted');
    if (playsinline) this.addProp('playsinline');
    if (disablepictureinpicture) this.addProp('disablepictureinpicture');
    if (disableremoteplayback) this.addProp('disableremoteplayback');

    if (controlslist) this.setAttr('controlslist', controlslist);
    if (crossorigin) this.setAttr('crossorigin', crossorigin);

    if (typeof volume === 'number') this.volume = volume;
    if (width !== undefined) this.setAttr('width', width);
    if (height !== undefined) this.setAttr('height', height);
  }

  // ------------------------
  // Fullscreen controls
  // ------------------------

  /** @returns {Promise<void>|undefined} */
  requestFullscreen() {
    const first = this.elements[0];
    if (first instanceof HTMLVideoElement) {
      return first.requestFullscreen();
    }
  }

  /** @returns {Promise<boolean>} */
  async exitFullscreen() {
    if (document.fullscreenElement === this.elements[0]) {
      await document.exitFullscreen();
      return true;
    }
    return false;
  }
}

export default TinyHtmlVideo;
