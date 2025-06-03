
# ✍️ text.mjs

A simple utility for transforming text into title case formats.

## Overview

`text.mjs` provides two functions to help format strings into different types of title case. These functions are useful for formatting titles, headings, or any text that needs consistent capitalization. You can choose between capitalizing the first letter of each word or leaving the first letter of the string in lowercase.

---

## Functions

### 📝 `toTitleCase(str)`

**Converts a string to title case**, where the first letter of each word is capitalized, and all other letters are converted to lowercase.

- **`str`**: The string to be converted to title case.

#### Example:

```js
toTitleCase('hello world'); // → "Hello World"
```

---

### 📝 `toTitleCaseLowerFirst(str)`

**Converts a string to title case**, where the first letter of each word is capitalized, but the first letter of the entire string remains lowercase.

- **`str`**: The string to be converted to title case with the first letter in lowercase.

#### Example:

```js
toTitleCaseLowerFirst('hello world'); // → "hello World"
```

---

## 🎯 `addAiMarkerShortcut(key = 'a')`

Enables a keyboard shortcut (`Ctrl + Alt + [key]`) that toggles a CSS class on the `<body>` element. Useful for marking or highlighting AI-generated content dynamically.

---

### 🔤 Syntax

```js
addAiMarkerShortcut(key)
```

---

### 🧾 Parameters

| Name  | Type     | Default | Description                                                                  |
| ----- | -------- | ------- | ---------------------------------------------------------------------------- |
| `key` | `string` | `'a'`   | The character key to use in combination with `Ctrl + Alt`. Case-insensitive. |

---

### ⚙️ Behavior

* ⌨️ When the user presses `Ctrl + Alt + [key]`, the function toggles the CSS class `detect-made-by-ai` on the `<body>` element.
* 🧠 The shortcut only works in environments where the DOM is available (e.g., browsers).
* 🚫 If `document.body` is not available when the shortcut is used (e.g., if the DOM hasn't finished loading), a warning is logged and nothing happens.

---

### ❗ Error Handling

Two types of errors are handled:

1. 🧱 **Non-browser environment (e.g., Node.js):**

   ```
   [AiMarkerShortcut] Environment does not support the DOM. This function must be run in a browser.
   ```

2. 🕓 **DOM not fully loaded at the time of shortcut:**

   ```
   [AiMarkerShortcut] <body> element not found. Cannot toggle class. Ensure the DOM is fully loaded when using the shortcut.
   ```

---

### 🧪 Example

```js
addAiMarkerShortcut(); // Uses default key 'a'
// Pressing Ctrl + Alt + A toggles the class "detect-made-by-ai" on <body>
```

---

### 🎨 CSS Integration Example

Define the class in your stylesheet to make the toggle visually meaningful:

```css
body.detect-made-by-ai .ai-content {
  outline: 2px dashed red;
  background-color: rgba(255, 0, 0, 0.05);
}
```

---

### 💡 Tip

To avoid the `<body>` warning, make sure you only call the function after the DOM is ready:

```js
document.addEventListener('DOMContentLoaded', () => {
  addAiMarkerShortcut();
});
```

### 📂 CSS Templates

You can use a pre-built CSS template for the `detect-made-by-ai` class, available in the following files:

* `/dist/v1/css/aiMarker.min.css` – A minified version of the CSS for production use.
* `/dist/v1/css/aiMarker.css` – The non-minified version for easier readability and customization.

Simply include the appropriate file in your project to style the elements marked with the `detect-made-by-ai` class.
