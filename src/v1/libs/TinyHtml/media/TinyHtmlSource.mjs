import TinyHtmlTemplate from '../TinyHtmlTemplate.mjs';

/**
 * TinyHtmlSource is a helper class for creating and validating <source> elements.
 * The <source> tag has contextual rules depending on its parent:
 *
 * - If inside <audio> or <video>, `src` is required, and `srcset`, `sizes`, `height`, `width` are forbidden.
 * - If inside <picture>, `srcset` is required, `sizes` is allowed, and `src` is forbidden.
 *
 * @example
 * // For <video>
 * const sourceVideo = new TinyHtmlSource({ src: 'movie.mp4', type: 'video/mp4' });
 *
 * // For <picture>
 * const sourcePicture = new TinyHtmlSource({
 *   srcset: 'image-200.jpg 200w, image-400.jpg 400w',
 *   sizes: '(max-width: 600px) 200px, 400px',
 *   type: 'image/jpeg',
 * });
 *
 * @extends TinyHtmlTemplate<HTMLSourceElement>
 */
class TinyHtmlSource extends TinyHtmlTemplate {
  /**
   * Creates a new TinyHtmlSource instance.
   * @param {Object} config - Configuration object.
   * @param {string} [config.type] - MIME type (optionally with codecs).
   * @param {string} [config.src] - Resource URL (required in audio/video, forbidden in picture).
   * @param {string} [config.srcset] - Comma-separated list of image candidates (required in picture).
   * @param {string} [config.sizes] - List of source sizes (only valid in picture with srcset).
   * @param {string} [config.media] - Media query for conditional loading.
   * @param {number} [config.height] - Intrinsic image height (only valid in picture).
   * @param {number} [config.width] - Intrinsic image width (only valid in picture).
   * @param {string|string[]|Set<string>} [config.tags=[]] - Initial CSS classes.
   * @param {string} [config.mainClass=""] - Main CSS class.
   * @param {"audio"|"video"|"picture"} [config.context] - Parent context type (used for validation).
   */
  constructor({
    type,
    src,
    srcset,
    sizes,
    media,
    height,
    width,
    tags = [],
    mainClass = '',
    context,
  } = {}) {
    super(document.createElement('source'), tags, mainClass);

    // --- type ---
    if (type !== undefined) {
      if (typeof type !== 'string') {
        throw new TypeError('TinyHtmlSource: "type" must be a string.');
      }
      this.setAttr('type', type);
    }

    // --- context validation ---
    if (context !== undefined && !['audio', 'video', 'picture'].includes(context)) {
      throw new Error(
        `TinyHtmlSource: "context" must be "audio", "video", or "picture". Got: ${context}`,
      );
    }

    // --- src / srcset rules ---
    if (context === 'audio' || context === 'video') {
      if (!src) {
        throw new Error(`TinyHtmlSource: "src" is required for <${context}> context.`);
      }
      if (
        srcset !== undefined ||
        sizes !== undefined ||
        height !== undefined ||
        width !== undefined
      ) {
        throw new Error(
          `TinyHtmlSource: "srcset", "sizes", "height", and "width" are not allowed in <${context}> context.`,
        );
      }
    }

    if (context === 'picture') {
      if (!srcset) {
        throw new Error('TinyHtmlSource: "srcset" is required for <picture> context.');
      }
      if (src !== undefined) {
        throw new Error('TinyHtmlSource: "src" is not allowed in <picture> context.');
      }
    }

    // --- src ---
    if (src !== undefined) {
      if (typeof src !== 'string') {
        throw new TypeError('TinyHtmlSource: "src" must be a string.');
      }
      this.setAttr('src', src);
    }

    // --- srcset ---
    if (srcset !== undefined) {
      if (typeof srcset !== 'string') {
        throw new TypeError('TinyHtmlSource: "srcset" must be a string.');
      }
      this.setAttr('srcset', srcset);
    }

    // --- sizes ---
    if (sizes !== undefined) {
      if (typeof sizes !== 'string') {
        throw new TypeError('TinyHtmlSource: "sizes" must be a string.');
      }
      this.setAttr('sizes', sizes);
    }

    // --- media ---
    if (media !== undefined) {
      if (typeof media !== 'string') {
        throw new TypeError('TinyHtmlSource: "media" must be a string.');
      }
      this.setAttr('media', media);
    }

    // --- height ---
    if (height !== undefined) {
      if (!Number.isInteger(height) || height < 0) {
        throw new TypeError('TinyHtmlSource: "height" must be a non-negative integer.');
      }
      this.setAttr('height', String(height));
    }

    // --- width ---
    if (width !== undefined) {
      if (!Number.isInteger(width) || width < 0) {
        throw new TypeError('TinyHtmlSource: "width" must be a non-negative integer.');
      }
      this.setAttr('width', String(width));
    }
  }

  /**
   * Gets the resource URL (if any).
   * @returns {string|null}
   */
  getSrc() {
    return this.attr('src');
  }

  /**
   * Sets the resource URL.
   * @param {string} url
   * @returns {this}
   */
  setSrc(url) {
    if (typeof url !== 'string') {
      throw new TypeError('TinyHtmlSource.setSrc: "url" must be a string.');
    }
    this.setAttr('src', url);
    return this;
  }

  /**
   * Gets the srcset value (if any).
   * @returns {string|null}
   */
  getSrcset() {
    return this.attr('srcset');
  }

  /**
   * Sets the srcset.
   * @param {string} srcset
   * @returns {this}
   */
  setSrcset(srcset) {
    if (typeof srcset !== 'string') {
      throw new TypeError('TinyHtmlSource.setSrcset: "srcset" must be a string.');
    }
    this.setAttr('srcset', srcset);
    return this;
  }
}

export default TinyHtmlSource;
