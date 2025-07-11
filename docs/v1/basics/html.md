### 📖 `readBase64Blob(file: File, isDataUrl?: boolean | string): Promise<string>`

Reads a file and returns its Base64 content using the FileReader API, with optional formatting as a full Data URL.

#### 📥 Parameters

* `file` *(File)*: The file object selected by the user (e.g., from an `<input type="file">` element).
* `isDataUrl` *(boolean | string, optional)*:

  * If `false` *(default)*: returns only the Base64 portion.
  * If `true`: returns the original Data URL string from `FileReader`.
  * If a string: treated as a custom MIME type for building a new Data URL.

#### 📤 Returns

* `Promise<string>`: Resolves with either the Base64 string or a complete Data URL, depending on `isDataUrl`.

#### ⚠️ Throws

* `TypeError` if:

  * The result is not a string.
  * The `isDataUrl` argument is not a boolean or a string.
* `Error` if:

  * The string is not a valid Base64 or Data URL format.
  * The MIME string format is invalid.
* `DOMException` if the file cannot be read by `FileReader`.

#### 🧪 Example

```js
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async () => {
  try {
    const base64 = await readBase64Blob(input.files[0], false);
    console.log(base64); // Logs only the Base64 string
  } catch (err) {
    console.error('Error reading file:', err.message);
  }
});
```

---

### 📖 `readFileBlob(file: File, method: 'readAsArrayBuffer' | 'readAsDataURL' | 'readAsText' | 'readAsBinaryString'): Promise<any>`

Reads the contents of a file using a specified FileReader method.

#### 📥 Parameters

* `file` *(File)*: The file object selected by the user (e.g., from an `<input type="file">` element).
* `method` *(string)*: The FileReader method to use:

  * `'readAsArrayBuffer'` — for binary buffers
  * `'readAsDataURL'` — for Base64 encoded data URLs
  * `'readAsText'` — for plain text
  * `'readAsBinaryString'` — for legacy binary string output

#### 📤 Returns

* `Promise<any>`: Resolves with the file content, depending on the method used.

#### ⚠️ Throws

* `Error` if an unexpected error occurs while resolving the result.
* `DOMException` if `FileReader` encounters a failure during the read process.

#### 🧪 Example

```js
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async () => {
  try {
    const text = await readFileBlob(input.files[0], 'readAsText');
    console.log(text); // Logs the file content as plain text
  } catch (err) {
    console.error('Error reading file:', err.message);
  }
});
```

---

### 📖 `readJsonBlob(file: File): Promise<any>`

Reads and parses a JSON file using the FileReader API.

#### 📥 Parameters

* `file` *(File)*: The file object selected by the user (e.g., from an `<input type="file">` element).

#### 📤 Returns

* `Promise<any>`: Resolves with the parsed JSON object, or rejects with an error if the content is invalid.

#### ⚠️ Throws

* An error if the content is not valid JSON.
* An error if the file can't be read.

#### 🧪 Example

```js
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async () => {
  try {
    const result = await readJsonBlob(input.files[0]);
    console.log(result);
  } catch (err) {
    alert(err.message);
  }
});
```

---

### 💾 `saveJsonFile(filename: string, data: any, spaces: number = 2): void`

Converts a JavaScript object to JSON and triggers a download in the browser.

#### 📥 Parameters

* `filename` *(string)*: The name of the file to save (e.g., `"data.json"`).
* `data` *(any)*: The JavaScript object to convert to JSON.
* `spaces` *(number)* *(optional)*: Indentation level for formatting the JSON string. Default is `2`.

#### 📤 Returns

* `void`

#### 📂 Behavior

Creates a temporary `<a>` element, downloads the file, and cleans up the URL.

#### 🧪 Example

```js
const data = { name: 'Yasmin', type: 'dev' };
saveJsonFile('yasmin.json', data);
```

### 🌐 `fetchJson(url, options?): Promise<any>`

Loads and parses a JSON from a remote URL using the Fetch API, with support for custom HTTP methods, retries, timeouts, headers, and even external abort controllers.

#### 📥 Parameters

* `url` *(string)*: The full URL to fetch JSON from (must start with `http://`, `https://`, `/`, `./`, or `../`).
* `options` *(object)* *(optional)*:

  * `signal` *(`AbortSignal` | `null`)*: Custom abort signal.
  * `method` *(string)*: The HTTP method to use (e.g., `GET`, `POST`, `PUT`, `DELETE`, etc.).
  * `timeout` *(number)*: Request timeout in milliseconds. Default is `0` (no timeout).
  * `retries` *(number)*: Number of retry attempts if the request fails. Default is `0`.
  * `headers` *(object)*: Additional headers to include in the request.
  * `body` *(object)*: Request body. If the value is a plain object, it will be automatically stringified as JSON.

##### `signal` (`AbortSignal` | `null`) — *optional*

Custom abort signal. If set:

* The internal timeout mechanism is **disabled**
* Retry logic is **disabled**
* Abortion is handled externally

#### 📤 Returns

* `Promise<any>`: Resolves with the parsed JSON data.

#### ⚠️ Throws

* `Error` if the fetch fails or exceeds the timeout
* `Error` if the response is not `application/json`
* `Error` if the result is not a plain JSON object

#### 🧠 Tip

If you pass your own `signal`, this disables both `timeout` and `retries`. Use it when you're managing cancellation manually (e.g. in UI components or async workflows).

#### 🧪 Example

```js
const controller = new AbortController();

const data = await fetchJson('https://api.example.com/data', {
  method: 'POST',
  body: { name: 'Yasmin' },
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000,
  retries: 2,
  signal: controller.signal, // optional
});
```

---

### 📦 `HtmlElBoxSides` Type

```ts
type HtmlElBoxSides = {
  x: number;      // Total horizontal size (left + right)
  y: number;      // Total vertical size (top + bottom)
  left: number;
  right: number;
  top: number;
  bottom: number;
}
```

A common return format used to describe the box model dimensions (borders, padding, margin) of an HTML element.

---

### 👁️ `isInViewport(element)`

🔍 Checks if an element is **partially visible** in the current viewport.

```js
isInViewport(element: HTMLElement): boolean
```

* `element`: The DOM element to check.
* **Returns**: `true` if the element is at least partially visible; `false` otherwise.

---

### ✅ `isScrolledIntoView(element)`

📦 Checks if an element is **fully visible** (top and bottom) within the viewport.

```js
isScrolledIntoView(element: HTMLElement): boolean
```

* `element`: The DOM element to check.
* **Returns**: `true` if the entire element is within the viewport; `false` otherwise.

---

### 📄 `installWindowHiddenScript`

Automatically toggles CSS classes on a given element based on the browser window or tab **visibility** and **focus** state.

Perfect for UI states like dimming, pausing animations, or showing "away" statuses.

#### 🧠 Features

* ✅ Adds or removes custom CSS classes depending on page visibility or focus
* ✅ Supports modern and legacy browsers (including IE9)
* ✅ Automatically dispatches an initial state check on load
* ✅ Allows custom **callbacks** for visibility changes (`onVisible`, `onHidden`)
* ✅ Returns a cleanup function to remove all listeners

#### 🧪 Usage

```js
import { installWindowHiddenScript } from 'tiny-essentials';

const uninstall = installWindowHiddenScript({
  element: document.getElementById('app'),
  hiddenClass: 'is-hidden',
  visibleClass: 'is-visible',
  onVisible: () => console.log('Window is now visible'),
  onHidden: () => console.log('Window is now hidden'),
});

// To remove all listeners later
uninstall();
```

#### ⚙️ Options

| Option         | Type          | Default           | Description                                                       |
| -------------- | ------------- | ----------------- | ----------------------------------------------------------------- |
| `element`      | `HTMLElement` | `document.body`   | The element to which the visibility classes will be applied       |
| `hiddenClass`  | `string`      | `'windowHidden'`  | Class name to apply when the window is **not visible or blurred** |
| `visibleClass` | `string`      | `'windowVisible'` | Class name to apply when the window is **visible or focused**     |
| `onVisible`    | `() => void`  | `undefined`       | Optional callback fired when the window becomes visible           |
| `onHidden`     | `() => void`  | `undefined`       | Optional callback fired when the window becomes hidden            |

#### 🔄 Return Value

```ts
() => void
```

Returns a function that, when called, will:

* 🧹 Remove all attached event listeners
* ❌ Remove both visibility classes from the target element

#### 🚦 Events Supported

The script handles multiple events depending on browser support:

* `visibilitychange`, `webkitvisibilitychange`, `mozvisibilitychange`, `msvisibilitychange`
* `focus`, `blur`, `focusin`, `focusout`
* `pageshow`, `pagehide`
* IE fallback: `onfocusin`, `onfocusout`

#### 🔍 Initial Trigger

Immediately after installation, the script simulates a `focus` or `blur` event based on the current visibility state to **ensure the classes and callbacks are applied from the start**.

#### 🧯 Uninstalling

Don’t forget to call the returned function if you dynamically load/unload components or scripts:

```js
const stopWatching = installWindowHiddenScript(...);
stopWatching(); // later
```

#### 🎨 CSS Example

```css
.windowVisible {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.3s ease;
}

.windowHidden {
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
```
