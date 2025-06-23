/**
 * Checks if the document is currently in fullscreen mode.
 *
 * @returns {boolean}
 */
export const documentIsFullScreen = () =>
  !!(
    document.fullscreenElement ||
    // @ts-ignore
    document.webkitFullscreenElement ||
    // @ts-ignore
    document.mozFullScreenElement ||
    // @ts-ignore
    document.msFullscreenElement ||
    // @ts-ignore
    document.webkitIsFullScreen ||
    // @ts-ignore
    document.mozFullScreen
  );

/**
 * Checks if the window occupies the entire screen dimensions.
 *
 * @returns {boolean}
 */
export const isScreenFilled = () =>
  window.innerHeight === screen.height && window.innerWidth === screen.width;

/**
 * Checks if fullscreen mode is active either via document API or by matching screen dimensions.
 *
 * @returns {boolean}
 */
export const isFullScreenMode = () => documentIsFullScreen() || isScreenFilled();

/**
 * Requests fullscreen mode for the document.
 *
 * @param {FullscreenOptions} [ops]
 * @returns {Promise<void>}
 */
export const requestFullScreen = (ops) =>
  new Promise(async (resolve, reject) => {
    const docElm = document.documentElement;
    try {
      if (docElm.requestFullscreen) {
        await docElm.requestFullscreen(ops);
        // @ts-ignore
      } else if (docElm.mozRequestFullScreen) {
        // @ts-ignore
        docElm.mozRequestFullScreen(ops);
        // @ts-ignore
      } else if (docElm.webkitRequestFullScreen) {
        // @ts-ignore
        docElm.webkitRequestFullScreen(ops);
        // @ts-ignore
      } else if (docElm.msRequestFullscreen) {
        // @ts-ignore
        docElm.msRequestFullscreen(ops);
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });

/**
 * Exits fullscreen mode.
 *
 * @returns {Promise<void>}
 */
export const exitFullScreen = () =>
  new Promise((resolve, reject) => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(resolve).catch(reject);
    } else {
      try {
        // @ts-ignore
        if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        // @ts-ignore
        else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
        // @ts-ignore
        else if (document.msExitFullscreen) document.msExitFullscreen();
        else throw new Error('Fullscreen API is not supported');
        resolve();
      } catch (err) {
        reject(err);
      }
    }
  });

/** @type {readonly string[]} */
const fullScreenEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

/**
 * Attaches a listener to fullscreen change events.
 *
 * @param {EventListenerOrEventListenerObject} listener
 * @param {boolean|AddEventListenerOptions} [ops]
 * @returns {void}
 */
export const onFullScreenChange = (listener, ops) => {
  fullScreenEvents.forEach((event) => {
    document.addEventListener(event, listener, ops);
  });
};

/**
 * Removes a listener from fullscreen change events.
 *
 * @param {EventListenerOrEventListenerObject} listener
 * @param {boolean|AddEventListenerOptions} [ops]
 * @returns {void}
 */
export const offFullScreenChange = (listener, ops) => {
  fullScreenEvents.forEach((event) => {
    document.removeEventListener(event, listener, ops);
  });
};
