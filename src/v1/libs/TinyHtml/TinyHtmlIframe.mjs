import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

/**
 * TinyHtmlIframe is a helper class for managing <iframe> elements.
 * It supports all standard attributes with validation and type safety.
 *
 * @example
 * const iframe = new TinyHtmlIframe({
 *   src: 'https://example.com',
 *   width: 600,
 *   height: 400,
 *   loading: 'lazy',
 *   sandbox: 'allow-scripts allow-same-origin',
 *   referrerpolicy: 'no-referrer',
 * });
 *
 * @extends TinyHtmlTemplate<HTMLIFrameElement>
 */
class TinyHtmlIframe extends TinyHtmlTemplate {
  /**
   * @param {Object} config
   * @param {string} [config.src]
   * @param {string} [config.srcdoc]
   * @param {string} [config.name]
   * @param {string} [config.allow]
   * @param {boolean} [config.allowFullScreen=false]
   * @param {boolean} [config.allowpaymentrequest] - Deprecated
   * @param {boolean} [config.browsingtopics]
   * @param {boolean} [config.credentialless]
   * @param {string} [config.csp]
   * @param {string} [config.sandbox]
   * @param {'no-referrer'|'no-referrer-when-downgrade'|'origin'|'origin-when-cross-origin'|'same-origin'|'strict-origin'|'strict-origin-when-cross-origin'|'unsafe-url'} [config.referrerpolicy]
   * @param {number|string} [config.width]
   * @param {number|string} [config.height]
   * @param {string} [config.title]
   * @param {'lazy'|'eager'} [config.loading]
   * @param {string|string[]|Set<string>} [config.tags=[]]
   * @param {string} [config.mainClass='']
   */
  constructor({
    src,
    srcdoc,
    name,
    allow,
    allowFullScreen = false,
    allowpaymentrequest,
    browsingtopics,
    credentialless,
    csp,
    sandbox,
    referrerpolicy,
    width,
    height,
    title,
    loading,
    tags = [],
    mainClass = '',
  } = {}) {
    super(document.createElement('iframe'), tags, mainClass);

    if (src !== undefined) this.src = src;
    if (srcdoc !== undefined) this.srcdoc = srcdoc;
    if (name !== undefined) this.name = name;
    if (allow !== undefined) this.allow = allow;
    this.allowFullScreen = allowFullScreen;
    if (allowpaymentrequest !== undefined) this.allowpaymentrequest = allowpaymentrequest;
    if (browsingtopics !== undefined) this.browsingtopics = browsingtopics;
    if (credentialless !== undefined) this.credentialless = credentialless;
    if (csp !== undefined) this.csp = csp;
    if (sandbox !== undefined) this.sandbox = sandbox;
    if (referrerpolicy !== undefined) this.referrerpolicy = referrerpolicy;
    if (width !== undefined) this.setWidth(width);
    if (height !== undefined) this.setHeight(height);
    if (title !== undefined) this.title = title;
    if (loading !== undefined) this.loading = loading;
  }

  // --- attributes ---

  /** @param {string} src */
  set src(src) {
    if (typeof src !== 'string') throw new TypeError('TinyIframe: "src" must be a string.');
    this.setAttr('src', src);
  }
  /** @returns {string|null} */
  get src() {
    return this.attrString('src');
  }

  /** @param {string} srcdoc */
  set srcdoc(srcdoc) {
    if (typeof srcdoc !== 'string') throw new TypeError('TinyIframe: "srcdoc" must be a string.');
    this.setAttr('srcdoc', srcdoc);
  }
  /** @returns {string|null} */
  get srcdoc() {
    return this.attrString('srcdoc');
  }

  /** @param {string} name */
  set name(name) {
    if (typeof name !== 'string') throw new TypeError('TinyIframe: "name" must be a string.');
    this.setAttr('name', name);
  }
  /** @returns {string|null} */
  get name() {
    return this.attrString('name');
  }

  /** @param {string} allow */
  set allow(allow) {
    if (typeof allow !== 'string') throw new TypeError('TinyIframe: "allow" must be a string.');
    this.setAttr('allow', allow);
  }
  /** @returns {string|null} */
  get allow() {
    return this.attrString('allow');
  }

  /** @param {boolean} allowFullScreen */
  set allowFullScreen(allowFullScreen) {
    if (typeof allowFullScreen !== 'boolean')
      throw new TypeError('TinyIframe: "allowFullScreen" must be a boolean.');
    if (allowFullScreen) this.addProp('allowfullscreen');
    else this.removeProp('allowfullscreen');
  }
  /** @returns {boolean} */
  get allowFullScreen() {
    return this.hasProp('allowfullscreen');
  }

  /** @param {boolean} allowpaymentrequest */
  set allowpaymentrequest(allowpaymentrequest) {
    console.warn('TinyIframe: "allowpaymentrequest" is deprecated. Use allow="payment" instead.');
    if (typeof allowpaymentrequest !== 'boolean')
      throw new TypeError('TinyIframe: "allowpaymentrequest" must be a boolean.');
    if (allowpaymentrequest) this.addProp('allowpaymentrequest');
    else this.removeProp('allowpaymentrequest');
  }
  /** @returns {boolean} */
  get allowpaymentrequest() {
    return this.hasProp('allowpaymentrequest');
  }

  /** @param {boolean} browsingtopics */
  set browsingtopics(browsingtopics) {
    if (typeof browsingtopics !== 'boolean')
      throw new TypeError('TinyIframe: "browsingtopics" must be a boolean.');
    if (browsingtopics) this.addProp('browsingtopics');
    else this.removeProp('browsingtopics');
  }
  /** @returns {boolean} */
  get browsingtopics() {
    return this.hasProp('browsingtopics');
  }

  /** @param {boolean} credentialless */
  set credentialless(credentialless) {
    if (typeof credentialless !== 'boolean')
      throw new TypeError('TinyIframe: "credentialless" must be a boolean.');
    if (credentialless) this.addProp('credentialless');
    else this.removeProp('credentialless');
  }
  /** @returns {boolean} */
  get credentialless() {
    return this.hasProp('credentialless');
  }

  /** @param {string} csp */
  set csp(csp) {
    if (typeof csp !== 'string') throw new TypeError('TinyIframe: "csp" must be a string.');
    this.setAttr('csp', csp);
  }
  /** @returns {string|null} */
  get csp() {
    return this.attrString('csp');
  }

  /** @param {string} sandbox */
  set sandbox(sandbox) {
    if (typeof sandbox !== 'string')
      throw new TypeError('TinyIframe: "sandbox" must be a string (space-separated tokens).');
    this.setAttr('sandbox', sandbox);
  }
  /** @returns {string|null} */
  get sandbox() {
    return this.attrString('sandbox');
  }

  /** @param {string} referrerpolicy */
  set referrerpolicy(referrerpolicy) {
    const valid = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url',
    ];
    if (!valid.includes(referrerpolicy))
      throw new TypeError(`TinyIframe: "referrerpolicy" must be one of: ${valid.join(', ')}.`);
    this.setAttr('referrerpolicy', referrerpolicy);
  }
  /** @returns {string|null} */
  get referrerpolicy() {
    return this.attrString('referrerpolicy');
  }

  /** @param {string} title */
  set title(title) {
    if (typeof title !== 'string') throw new TypeError('TinyIframe: "title" must be a string.');
    this.setAttr('title', title);
  }
  /** @returns {string|null} */
  get title() {
    return this.attrString('title');
  }

  /** @param {'lazy'|'eager'} loading */
  set loading(loading) {
    const valid = ['lazy', 'eager'];
    if (!valid.includes(loading))
      throw new TypeError(`TinyIframe: "loading" must be one of: ${valid.join(', ')}.`);
    this.setAttr('loading', loading);
  }
  /** @returns {string|null} */
  get loading() {
    return this.attrString('loading');
  }
}

export default TinyHtmlIframe;
