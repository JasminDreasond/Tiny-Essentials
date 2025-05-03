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
 * @param {string} [key='a'] - The lowercase character key to be used in combination with Ctrl and Alt.
 */
export function enableAiMarker(key = 'a') {
  if (typeof HTMLElement === 'undefined') {
    console.error(
      '[enableAiMarker] Environment does not support the DOM. This function must be run in a browser.',
    );
    return;
  }
  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === key) {
      event.preventDefault(); // Prevent any default behavior
      if (!document.body) {
        console.warn(
          '[enableAiMarker] <body> element not found. Cannot toggle class. Ensure the DOM is fully loaded when using the shortcut.',
        );
        return;
      }
      document.body.classList.toggle('detect-made-by-ai');
    }
  });
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
