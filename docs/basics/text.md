
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
