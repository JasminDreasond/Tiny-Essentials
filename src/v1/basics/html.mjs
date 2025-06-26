import { isJsonObject } from './objFilter.mjs';

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

  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

/**
 * Reads and parses a JSON data using FileReader.
 * Throws an error if the content is not valid JSON.
 * @param {File} file
 * @returns {Promise<any>}
 */
export function readJsonBlob(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        // @ts-ignore
        const result = JSON.parse(reader.result);
        resolve(result);
      } catch (error) {
        // @ts-ignore
        reject(new Error(`Invalid JSON in file: ${file.name}\n${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error(`Error reading file: ${file.name}`));
    };

    reader.readAsText(file);
  });
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

      if (!isJsonObject(data)) throw new Error('Received invalid data instead of valid JSON.');

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
