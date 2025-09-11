import TinyHtmlMedia from '../TinyHtmlMedia.mjs';

/**
 * TinyAudio is a helper for managing <audio> elements with full support for
 * attributes and playback controls (play, pause, mute, seek, speed, etc).
 * @beta
 *
 * @extends TinyHtmlMedia<HTMLAudioElement>
 */
class TinyHtmlAudio extends TinyHtmlMedia {
  /**
   * @param {Object} config
   * @param {string} [config.src='']
   * @param {boolean} [config.controls=false]
   * @param {boolean} [config.autoplay=false]
   * @param {boolean} [config.loop=false]
   * @param {boolean} [config.muted=false]
   * @param {number} [config.volume]
   * @param {'auto'|'metadata'|'none'} [config.preload]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass=""]
   */
  constructor({
    src = '',
    preload,
    controls = false,
    autoplay = false,
    loop = false,
    muted = false,
    volume,
    tags = [],
    mainClass = '',
  }) {
    super(document.createElement('audio'), tags, mainClass);

    if (src) this.setAttr('src', src);
    if (preload) this.setAttr('preload', preload);

    if (controls) this.addProp('controls');
    if (autoplay) this.addProp('autoplay');
    if (loop) this.addProp('loop');
    if (muted) this.addProp('muted');

    if (typeof volume === 'number') this.volume = volume;
  }
}

export default TinyHtmlAudio;
