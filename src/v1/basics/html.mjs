import { isJsonObject } from './objFilter.mjs';
import {
  areElsColliding,
  areElsCollTop,
  areElsCollBottom,
  areElsCollLeft,
  areElsCollRight,
} from './collision.mjs';

/**
 * Checks if two DOM elements are colliding on the screen.
 *
 * @param {Element} elem1 - First DOM element.
 * @param {Element} elem2 - Second DOM element.
 * @returns {boolean} - Returns true if the elements are colliding.
 */
export function areHtmlElsColliding(elem1, elem2) {
  const rect1 = elem1.getBoundingClientRect();
  const rect2 = elem2.getBoundingClientRect();
  return areElsColliding(rect1, rect2);
}

/**
 * Checks if two DOM elements are colliding on the screen, and locks the collision
 * until the element exits through the same side it entered.
 *
 * @param {Element} elem1 - First DOM element (e.g. draggable or moving element).
 * @param {Element} elem2 - Second DOM element (e.g. a container or boundary element).
 * @param {'top'|'bottom'|'left'|'right'} lockDirection - Direction that must be respected to unlock the collision.
 * @param {WeakMap<Element, string>} stateMap - A shared WeakMap to track persistent entry direction per element.
 * @returns {boolean} True if collision is still active.
 */
export function areHtmlElsCollidingWithLock(elem1, elem2, lockDirection, stateMap) {
  const rect1 = elem1.getBoundingClientRect();
  const rect2 = elem2.getBoundingClientRect();
  const isColliding = areElsColliding(rect1, rect2);

  if (isColliding) {
    // Save entry direction
    if (!stateMap.has(elem1)) {
      stateMap.set(elem1, lockDirection);
    }
    return true;
  }

  // Handle unlock logic
  if (stateMap.has(elem1)) {
    const lastDirection = stateMap.get(elem1);

    switch (lastDirection) {
      case 'top':
        if (areElsCollTop(rect1, rect2)) stateMap.delete(elem1); // exited from top
        break;
      case 'bottom':
        if (areElsCollBottom(rect1, rect2)) stateMap.delete(elem1); // exited from bottom
        break;
      case 'left':
        if (areElsCollLeft(rect1, rect2)) stateMap.delete(elem1); // exited from left
        break;
      case 'right':
        if (areElsCollRight(rect1, rect2)) stateMap.delete(elem1); // exited from right
        break;
    }

    return stateMap.has(elem1); // still colliding (locked)
  }

  return false;
}

/**
 * Reads the contents of a file using the specified FileReader method.
 *
 * @param {File} file - The file to be read.
 * @param {'readAsArrayBuffer'|'readAsDataURL'|'readAsText'|'readAsBinaryString'} method -
 *   The FileReader method to use for reading the file.
 * @returns {Promise<any>} - A promise that resolves with the file content, according to the chosen method.
 * @throws {Error} - If an unexpected error occurs while handling the result.
 * @throws {DOMException} - If the FileReader encounters an error while reading the file.
 */
export function readFileBlob(file, method) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(reader.result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader[method](file);
  });
}

/**
 * Reads a file as a Base64 string using FileReader, and optionally formats it as a full data URL.
 *
 * Performs strict validation to ensure the result is a valid Base64 string or a proper data URL.
 *
 * @param {File} file - The file to be read.
 * @param {boolean|string} [isDataUrl=false] - If true, returns a full data URL; if false, returns only the Base64 string;
 *   if a string is passed, it is used as the MIME type in the data URL.
 * @returns {Promise<string>} - A promise that resolves with the Base64 string or data URL.
 *
 * @throws {TypeError} - If the result is not a string or if `isDataUrl` is not a valid type.
 * @throws {Error} - If the result does not match the expected data URL format or Base64 structure.
 * @throws {DOMException} - If the FileReader fails to read the file.
 */
export function readBase64Blob(file, isDataUrl = false) {
  return new Promise((resolve, reject) => {
    if (typeof isDataUrl !== 'string' && typeof isDataUrl !== 'boolean')
      reject(new TypeError('The isDataUrl parameter must be a boolean or a string.'));
    readFileBlob(file, 'readAsDataURL')
      .then(
        /**
         * Ensure that the URL format is correct in the required pattern
         * @param {string} base64Data
         */ (base64Data) => {
          if (typeof base64Data !== 'string')
            throw new TypeError('Expected file content to be a string.');

          const match = base64Data.match(/^data:(.+);base64,(.*)$/);
          if (!match || !match[2])
            throw new Error('Invalid data URL format or missing Base64 content.');
          const [, mimeType, base64] = match;
          if (!/^[\w/+]+=*$/.test(base64)) throw new Error('Base64 content is malformed.');

          if (typeof isDataUrl === 'boolean') return resolve(isDataUrl ? base64Data : base64);
          if (!/^[\w-]+\/[\w.+-]+$/.test(isDataUrl))
            throw new Error(`Invalid MIME type string: ${isDataUrl}`);

          return resolve(`data:${isDataUrl};base64,${base64}`);
        },
      )
      .catch(reject);
  });
}

/**
 * Reads a file and strictly validates its content as proper JSON using FileReader.
 *
 * Performs several checks to ensure the file contains valid, parsable JSON data.
 *
 * @param {File} file - The file to be read. It must contain valid JSON as plain text.
 * @returns {Promise<Record<string|number|symbol, any>|any[]>} - A promise that resolves with the parsed JSON object.
 *
 * @throws {SyntaxError} - If the file content is not valid JSON syntax.
 * @throws {TypeError} - If the result is not a string or does not represent a JSON value.
 * @throws {Error} - If the result is empty or structurally invalid as JSON.
 * @throws {DOMException} - If the FileReader fails to read the file.
 */
export function readJsonBlob(file) {
  return new Promise((resolve, reject) =>
    readFileBlob(file, 'readAsText')
      .then((data) => {
        if (typeof data !== 'string') throw new TypeError('Expected file content to be a string.');
        const trimmed = data.trim();
        if (trimmed.length === 0) throw new Error('File is empty or contains only whitespace.');
        const parsed = JSON.parse(trimmed);
        if (typeof parsed !== 'object' || parsed === null)
          throw new Error('Parsed content is not a valid JSON object or array.');
        resolve(parsed);
      })
      .catch(reject),
  );
}

/**
 * Saves a JSON object as a downloadable file.
 * @param {string} filename
 * @param {any} data
 * @param {number} [spaces=2]
 */
export function saveJsonFile(filename, data, spaces = 2) {
  const json = JSON.stringify(data, null, spaces);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Loads and parses a JSON from a remote URL using Fetch API.
 *
 * @param {string} url - The full URL to fetch JSON from.
 * @param {Object} [options] - Optional settings.
 * @param {string} [options.method="GET"] - HTTP method to use (GET, POST, etc.).
 * @param {any} [options.body] - Request body (only for methods like POST, PUT).
 * @param {number} [options.timeout=0] - Timeout in milliseconds (ignored if signal is provided).
 * @param {number} [options.retries=0] - Number of retry attempts (ignored if signal is provided).
 * @param {Headers|Record<string, *>} [options.headers={}] - Additional headers.
 * @param {AbortSignal|null} [options.signal] - External AbortSignal; disables timeout and retries.
 * @returns {Promise<*>} Parsed JSON object.
 * @throws {Error} Throws if fetch fails, times out, or returns invalid JSON.
 */
export async function fetchJson(
  url,
  { method = 'GET', body, timeout = 0, retries = 0, headers = {}, signal = null } = {},
) {
  if (
    typeof url !== 'string' ||
    (!url.startsWith('../') &&
      !url.startsWith('./') &&
      !url.startsWith('/') &&
      !url.startsWith('https://') &&
      !url.startsWith('http://'))
  )
    throw new Error('Invalid URL: must be a valid http or https address.');

  if (typeof method !== 'string' || !method.trim())
    throw new Error('Invalid method: must be a non-empty string.');

  if (!signal) {
    if (
      typeof timeout !== 'number' ||
      !Number.isFinite(timeout) ||
      Number.isNaN(timeout) ||
      timeout < 0
    )
      throw new Error('Invalid timeout: must be a positive number.');

    if (
      typeof retries !== 'number' ||
      !Number.isFinite(retries) ||
      Number.isNaN(retries) ||
      retries < 0
    )
      throw new Error('Invalid retries: must be a positive number.');
  }

  const attempts = signal ? 1 : retries + 1;
  /** @type {Error|null} */
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = signal ? null : new AbortController();
    const localSignal = signal || (controller?.signal ?? null);
    const timer =
      !signal && timeout && controller ? setTimeout(() => controller.abort(), timeout) : null;

    try {
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        body: body !== undefined ? (isJsonObject(body) ? JSON.stringify(body) : body) : undefined,
        signal: localSignal,
      });

      if (timer) clearTimeout(timer);

      if (!response.ok) throw new Error(`HTTP error: ${response.status} ${response.statusText}`);

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json'))
        throw new Error(`Unexpected content-type: ${contentType}`);

      const data = await response.json();

      if (!Array.isArray(data) && !isJsonObject(data))
        throw new Error('Received invalid data instead of valid JSON.');

      return data;
    } catch (err) {
      lastError = /** @type {Error} */ (err);
      if (signal) break; // if an external signal came, it does not retry
      if (attempt < retries)
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }

  throw new Error(
    `Failed to fetch JSON from "${url}"${lastError ? `: ${lastError.message}` : '.'}`,
  );
}

/**
 * @typedef {Object} HtmlElBoxSides
 * @property {number} x - Total horizontal size (left + right)
 * @property {number} y - Total vertical size (top + bottom)
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 */

/**
 * Returns the total border width and individual sides from `border{Side}Width` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border widths, and each side individually.
 */
export const getHtmlElBordersWidth = (el) => {
  const styles = getComputedStyle(el);
  const left = parseFloat(styles.borderLeftWidth) || 0;
  const right = parseFloat(styles.borderRightWidth) || 0;
  const top = parseFloat(styles.borderTopWidth) || 0;
  const bottom = parseFloat(styles.borderBottomWidth) || 0;
  const x = left + right;
  const y = top + bottom;

  return { x, y, left, right, top, bottom };
};

/**
 * Returns the total border size and individual sides from `border{Side}` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) border sizes, and each side individually.
 */
export const getHtmlElBorders = (el) => {
  const styles = getComputedStyle(el);
  const left = parseFloat(styles.borderLeft) || 0;
  const right = parseFloat(styles.borderRight) || 0;
  const top = parseFloat(styles.borderTop) || 0;
  const bottom = parseFloat(styles.borderBottom) || 0;
  const x = left + right;
  const y = top + bottom;

  return { x, y, left, right, top, bottom };
};

/**
 * Returns the total margin and individual sides from `margin{Side}` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) margins, and each side individually.
 */
export const getHtmlElMargin = (el) => {
  const styles = getComputedStyle(el);
  const left = parseFloat(styles.marginLeft) || 0;
  const right = parseFloat(styles.marginRight) || 0;
  const top = parseFloat(styles.marginTop) || 0;
  const bottom = parseFloat(styles.marginBottom) || 0;

  const x = left + right;
  const y = top + bottom;

  return { x, y, left, right, top, bottom };
};

/**
 * Returns the total padding and individual sides from `padding{Side}` CSS properties.
 *
 * @param {Element} el - The target DOM element.
 * @returns {HtmlElBoxSides} - Total horizontal (x) and vertical (y) paddings, and each side individually.
 */
export const getHtmlElPadding = (el) => {
  const styles = getComputedStyle(el);
  const left = parseFloat(styles.paddingLeft) || 0;
  const right = parseFloat(styles.paddingRight) || 0;
  const top = parseFloat(styles.paddingTop) || 0;
  const bottom = parseFloat(styles.paddingBottom) || 0;

  const x = left + right;
  const y = top + bottom;

  return { x, y, left, right, top, bottom };
};

/**
 * Installs a script that toggles CSS classes on a given element
 * based on the page's visibility or focus state, and optionally
 * triggers callbacks on visibility changes.
 *
 * @param {Object} [settings={}]
 * @param {HTMLElement} [settings.element=document.body] - The element to receive visibility classes.
 * @param {string} [settings.hiddenClass='windowHidden'] - CSS class applied when the page is hidden.
 * @param {string} [settings.visibleClass='windowVisible'] - CSS class applied when the page is visible.
 * @param {() => void} [settings.onVisible] - Callback called when page becomes visible.
 * @param {() => void} [settings.onHidden] - Callback called when page becomes hidden.
 * @returns {() => void} Function that removes all installed event listeners.
 * @throws {TypeError} If any provided setting is invalid.
 */
export function installWindowHiddenScript({
  element = document.body,
  hiddenClass = 'windowHidden',
  visibleClass = 'windowVisible',
  onVisible,
  onHidden,
} = {}) {
  if (!(element instanceof HTMLElement))
    throw new TypeError(`"element" must be an instance of HTMLElement.`);
  if (typeof hiddenClass !== 'string') throw new TypeError(`"hiddenClass" must be a string.`);
  if (typeof visibleClass !== 'string') throw new TypeError(`"visibleClass" must be a string.`);
  if (onVisible !== undefined && typeof onVisible !== 'function')
    throw new TypeError(`"onVisible" must be a function if provided.`);
  if (onHidden !== undefined && typeof onHidden !== 'function')
    throw new TypeError(`"onHidden" must be a function if provided.`);

  const removeClass = () => {
    element.classList.remove(hiddenClass);
    element.classList.remove(visibleClass);
  };

  /** @type {string|null} */
  let hiddenProp = null;

  const visibilityEvents = [
    'visibilitychange',
    'mozvisibilitychange',
    'webkitvisibilitychange',
    'msvisibilitychange',
  ];

  const visibilityProps = ['hidden', 'mozHidden', 'webkitHidden', 'msHidden'];

  for (let i = 0; i < visibilityProps.length; i++) {
    if (visibilityProps[i] in document) {
      hiddenProp = visibilityProps[i];
      break;
    }
  }

  /** @type {(this: any, evt: Event) => void} */
  const handler = function (evt) {
    removeClass();

    const type = evt?.type;
    // @ts-ignore
    const isHidden = hiddenProp && document[hiddenProp];

    const visibleEvents = ['focus', 'focusin', 'pageshow'];
    const hiddenEvents = ['blur', 'focusout', 'pagehide'];

    if (visibleEvents.includes(type)) {
      element.classList.add(visibleClass);
      onVisible?.();
    } else if (hiddenEvents.includes(type)) {
      element.classList.add(hiddenClass);
      onHidden?.();
    } else {
      if (isHidden) {
        element.classList.add(hiddenClass);
        onHidden?.();
      } else {
        element.classList.add(visibleClass);
        onVisible?.();
      }
    }
  };

  /** @type {() => void} */
  let uninstall = () => {};

  if (hiddenProp) {
    const eventType = visibilityEvents[visibilityProps.indexOf(hiddenProp)];
    document.addEventListener(eventType, handler);
    window.addEventListener('focus', handler);
    window.addEventListener('blur', handler);

    uninstall = () => {
      document.removeEventListener(eventType, handler);
      window.removeEventListener('focus', handler);
      window.removeEventListener('blur', handler);
      removeClass();
    };
  } else if ('onfocusin' in document) {
    // Fallback for IE9 and older
    // @ts-ignore
    document.onfocusin = document.onfocusout = handler;
    uninstall = () => {
      // @ts-ignore
      document.onfocusin = document.onfocusout = null;
      removeClass();
    };
  } else {
    // Last resort fallback
    window.onpageshow = window.onpagehide = window.onfocus = window.onblur = handler;
    uninstall = () => {
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = null;
      removeClass();
    };
  }

  // Trigger initial state
  // @ts-ignore
  const simulatedEvent = new Event(hiddenProp && document[hiddenProp] ? 'blur' : 'focus');
  handler(simulatedEvent);

  return uninstall;
}

/**
 * Checks if the given element is at least partially visible in the viewport.
 *
 * @param {HTMLElement} element - The DOM element to check.
 * @returns {boolean} True if the element is partially in the viewport, false otherwise.
 */
export function isInViewport(element) {
  const elementTop = element.offsetTop;
  const elementBottom = elementTop + element.offsetHeight;

  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  return elementBottom > viewportTop && elementTop < viewportBottom;
}

/**
 * Checks if the given element is fully visible in the viewport (top and bottom).
 *
 * @param {HTMLElement} element - The DOM element to check.
 * @returns {boolean} True if the element is fully visible in the viewport, false otherwise.
 */
export function isScrolledIntoView(element) {
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  const elemTop = element.offsetTop;
  const elemBottom = elemTop + element.offsetHeight;

  return elemBottom <= viewportBottom && elemTop >= viewportTop;
}
