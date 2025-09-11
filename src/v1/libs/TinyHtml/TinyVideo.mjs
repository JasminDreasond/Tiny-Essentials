import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyVideo is a helper for managing <video> elements
 * with attributes like src, controls, autoplay, loop, width, height, and volume.
 */
class TinyVideo extends TinyHtmlTemplate {
  /**
   * @param {Object} config
   * @param {string} [config.src='']
   * @param {boolean} [config.controls=true]
   * @param {boolean} [config.autoplay=false]
   * @param {boolean} [config.loop=false]
   * @param {boolean} [config.muted=false]
   * @param {number} [config.width]
   * @param {number} [config.height]
   * @param {number} [config.volume]
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""]
   */
  constructor({
    src = '',
    controls = true,
    autoplay = false,
    loop = false,
    muted = false,
    width,
    height,
    volume,
    tags = [],
    mainClass = '',
  }) {
    super('video', tags, mainClass);
    if (src) this.setAttr('src', src);
    if (controls) this.setAttr('controls', 'true');
    if (autoplay) this.setAttr('autoplay', 'true');
    if (loop) this.setAttr('loop', 'true');
    if (muted) this.setAttr('muted', 'true');
    if (width !== undefined) this.setAttr('width', String(width));
    if (height !== undefined) this.setAttr('height', String(height));
    if (typeof volume === 'number') this.setVolume(volume);
  }

  play() {
    /** @type {Promise<void>[]} */
    const plays = [];
    this.elements.forEach((element) =>
      element instanceof HTMLVideoElement ? plays.push(element.play()) : null,
    );
    return Promise.all(plays);
  }

  pause() {
    this.elements.forEach((element) =>
      element instanceof HTMLVideoElement ? element.pause() : null,
    );
    return this;
  }

  /**
   * @param {number} level
   */
  setVolume(level) {
    if (typeof level !== 'number') throw new TypeError('Volume must be a number between 0 and 1');
    this.setProp('volume', Math.min(1, Math.max(0, level)));
    return this;
  }

  getVolume() {
    return this.prop('volume');
  }
}

export default TinyVideo;
