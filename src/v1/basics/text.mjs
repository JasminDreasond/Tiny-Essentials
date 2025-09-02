/**
 * Converts a string to title case where the first letter of each word is capitalized.
 * All other letters are converted to lowercase.
 *
 * Example: "hello world" -> "Hello World"
 *
 * @param {string} str - The string to be converted to title case.
 * @returns {string} The string converted to title case.
 */
export function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Converts a string to title case where the first letter of each word is capitalized,
 * but the first letter of the entire string is left lowercase.
 *
 * Example: "hello world" -> "hello World"
 *
 * @param {string} str - The string to be converted to title case with the first letter in lowercase.
 * @returns {string} The string converted to title case with the first letter in lowercase.
 */
export function toTitleCaseLowerFirst(str) {
  const titleCased = str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
  return titleCased.charAt(0).toLowerCase() + titleCased.slice(1);
}

/**
 * Enables a keyboard shortcut to toggle a CSS class on the document body.
 *
 * This function listens for a specific key combination: `Ctrl + Alt + [key]`.
 * When triggered, it prevents the default behavior and toggles the
 * `detect-made-by-ai` class on the `<body>`, which can be used to apply visual
 * indicators or filters on AI-generated content.
 *
 * If executed outside of a browser environment (e.g., in Node.js), the function logs an error and exits.
 * If the `<body>` is not available at the moment the shortcut is triggered, a warning is logged.
 *
 * @param {Object} [config={}] - Configuration object.
 * @param {string} [config.key='a'] - The lowercase character key to be used in combination with `Ctrl` and `Alt`.
 * @param {string} [config.className='detect-made-by-ai'] - The CSS class to toggle on the `<body>` element.
 * @returns {(this: Document, ev: KeyboardEvent) => any} The event handler attached to `document`.
 */
export function addAiMarkerShortcut({ key = 'a', className = 'detect-made-by-ai' } = {}) {
  if (typeof HTMLElement === 'undefined')
    throw new Error(
      '[AiMarkerShortcut] Environment does not support the DOM. This function must be run in a browser.',
    );

  /** @type {(this: Document, ev: KeyboardEvent) => any} */
  const keydownEvent = function (event) {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === key) {
      event.preventDefault(); // Prevent any default behavior
      if (!document.body) {
        console.warn(
          '[AiMarkerShortcut] <body> element not found. Cannot toggle class. Ensure the DOM is fully loaded when using the shortcut.',
        );
        return;
      }
      document.body.classList.toggle(className);
    }
  };

  document.addEventListener('keydown', keydownEvent);
  return keydownEvent;
}

/**
 * Trims a text string to a specified character limit, attempting to avoid cutting words in half.
 * If a space is found before the limit and it's not too far from the limit (at least 60%),
 * the cut is made at that space; otherwise, the text is hard-cut at the limit.
 * If the input is shorter than the limit, it is returned unchanged.
 *
 * @param {string} text - The input text to be trimmed.
 * @param {number} limit - The maximum number of characters allowed.
 * @param {number} [safeCutZone=0.6] - A decimal between 0 and 1 representing the minimal acceptable position
 *                                     (as a fraction of `limit`) to cut at a space. Defaults to 0.6.
 * @returns {string} - The trimmed text, possibly ending with an ellipsis ("...").
 * @throws {TypeError} - Throws if `text` is not a string.
 * @throws {TypeError} - Throws if `limit` is not a positive integer.
 * @throws {TypeError} - Throws if `safeCutZone` is not a number between 0 and 1 (inclusive).
 */
export function safeTextTrim(text, limit, safeCutZone = 0.6) {
  if (typeof text !== 'string')
    throw new TypeError(`Expected a string for 'text', but received ${typeof text}`);
  if (!Number.isInteger(limit) || limit <= 0)
    throw new TypeError(`Expected 'limit' to be a positive integer, but received ${limit}`);
  if (typeof safeCutZone !== 'number' || safeCutZone < 0 || safeCutZone > 1)
    throw new TypeError(
      `Expected 'safeCutZone' to be a number between 0 and 1, but received ${safeCutZone}`,
    );

  let result = text.trim();
  if (result.length > limit) {
    // Try to cut the string into a space before the limit
    const safeCut = result.lastIndexOf(' ', limit);

    if (safeCut > 0 && safeCut >= limit * safeCutZone) {
      // Only cuts where there is a space, and if the cut is not too early
      return `${result.substring(0, safeCut).trim()}...`;
    } else {
      // Emergency: Cuts straight to the limit and adds "...".
      return `${result.substring(0, limit).trim()}...`;
    }
  }

  return result;
}

/**
 * Diff two string objects.
 * @param {Record<string,string>} oldStyles
 * @param {Record<string,string>} newStyles
 */
export function diffStrings(oldStyles, newStyles) {
  /** @type {Record<string,Record<string,string|Record<string,string>>>}} */
  const changes = { added: {}, removed: {}, modified: {} };

  // detect removed and modified
  for (const prop in oldStyles) {
    if (!(prop in newStyles)) {
      changes.removed[prop] = oldStyles[prop];
    } else if (oldStyles[prop] !== newStyles[prop]) {
      changes.modified[prop] = { old: oldStyles[prop], new: newStyles[prop] };
    }
  }

  // detect added
  for (const prop in newStyles) {
    if (!(prop in oldStyles)) {
      changes.added[prop] = newStyles[prop];
    }
  }

  return changes;
}

/*
import { useEffect } from "react";

function KeyPressHandler() {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "a") {
                event.preventDefault();
                document.body.classList.toggle("detect-made-by-ai");
            }
        };
        
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return null;
}

export default KeyPressHandler;
*/
