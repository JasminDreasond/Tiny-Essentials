## 🚀 `areHtmlElsColliding()`

Check if two DOM elements are **colliding on the screen**! Perfect for games, draggable elements, UI interactions, and more.

This function checks whether **two HTML elements are overlapping** (colliding) within the viewport. It uses their bounding boxes (`getBoundingClientRect()`) to perform a simple AABB (Axis-Aligned Bounding Box) collision detection.

Combine it with `mousemove`, `drag`, or animation listeners for dynamic collision detection in real-time!

It compares the bounding rectangles of both elements:

* ✅ Checks if **rect1** is NOT entirely to the left, right, above, or below **rect2**.
* ✅ If none of these are true, then the elements are overlapping.

---

## 🧠 Syntax

```javascript
areHtmlElsColliding(elem1, elem2);
```

---

## 🎯 Parameters

| Parameter | Type      | Description             |
| --------- | --------- | ----------------------- |
| `elem1`   | `Element` | The first DOM element.  |
| `elem2`   | `Element` | The second DOM element. |

---

## 🔁 Return

| Type      | Description                                                        |
| --------- | ------------------------------------------------------------------ |
| `boolean` | ✅ `true` if elements are colliding. <br>❌ `false` if they are not. |

---

## 📦 Example

```javascript
const box1 = document.getElementById('box1');
const box2 = document.getElementById('box2');

if (areHtmlElsColliding(box1, box2)) {
  console.log('🎯 Collision detected!');
} else {
  console.log('❌ No collision.');
}
```

---

## 🚧 Limitations

* Only works with **axis-aligned elements** (rectangular shapes).
* Does not handle rotated elements or complex shapes.

---

## 📖 `readJsonBlob(file: File): Promise<any>`

Reads and parses a JSON file using the [`FileReader`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) API.

### 📥 Parameters

* `file` *(File)*: The file object selected by the user (e.g., from an `<input type="file">` element).

### 📤 Returns

* `Promise<any>`: Resolves with the parsed JSON object, or rejects with an error if the content is invalid.

### ⚠️ Throws

* An error if the content is not valid JSON.
* An error if the file can't be read.

### 🧪 Example

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

## 💾 `saveJsonFile(filename: string, data: any, spaces: number = 2): void`

Converts a JavaScript object to JSON and triggers a download in the browser.

### 📥 Parameters

* `filename` *(string)*: The name of the file to save (e.g., `"data.json"`).
* `data` *(any)*: The JavaScript object to convert to JSON.
* `spaces` *(number)* *(optional)*: Indentation level for formatting the JSON string. Default is `2`.

### 📤 Returns

* `void`

### 📂 Behavior

Creates a temporary `<a>` element, downloads the file, and cleans up the URL.

### 🧪 Example

```js
const data = { name: 'Yasmin', type: 'dev' };
saveJsonFile('yasmin.json', data);
```

## 🌐 `fetchJson(url, options?): Promise<any>`

Loads and parses a JSON from a remote URL using the Fetch API, with support for custom HTTP methods, retries, timeouts, headers, and even external abort controllers.

### 📥 Parameters

* `url` *(string)*: The full URL to fetch JSON from (must start with `http://`, `https://`, `/`, `./`, or `../`).
* `options` *(object)* *(optional)*:

  * `signal` *(`AbortSignal` | `null`)*: Custom abort signal.
  * `method` *(string)*: The HTTP method to use (e.g., `GET`, `POST`, `PUT`, `DELETE`, etc.).
  * `timeout` *(number)*: Request timeout in milliseconds. Default is `0` (no timeout).
  * `retries` *(number)*: Number of retry attempts if the request fails. Default is `0`.
  * `headers` *(object)*: Additional headers to include in the request.
  * `body` *(object)*: Request body. If the value is a plain object, it will be automatically stringified as JSON.

#### `signal` (`AbortSignal` | `null`) — *optional*

Custom abort signal. If set:

* The internal timeout mechanism is **disabled**
* Retry logic is **disabled**
* Abortion is handled externally

### 📤 Returns

* `Promise<any>`: Resolves with the parsed JSON data.

### ⚠️ Throws

* `Error` if the fetch fails or exceeds the timeout
* `Error` if the response is not `application/json`
* `Error` if the result is not a plain JSON object

## 🧠 Tip

If you pass your own `signal`, this disables both `timeout` and `retries`. Use it when you're managing cancellation manually (e.g. in UI components or async workflows).

### 🧪 Example

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

### 🔲 `getHtmlElBordersWidth(el)`

📏 Returns the total **border width** of an element using `border{Side}Width` values from computed styles.

```js
getHtmlElBordersWidth(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: An object containing total horizontal/vertical border widths, and each side individually.

---

### 🔳 `getHtmlElBorders(el)`

📐 Returns the total **border size** of an element using `border{Side}` shorthand values from computed styles.

```js
getHtmlElBorders(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: An object with total horizontal/vertical border sizes and all four sides.

---

### ➖ `getHtmlElMargin(el)`

📏 Returns the total **margin** of an element using `margin{Side}` from computed styles.

```js
getHtmlElMargin(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: An object containing margin values for each side and totals for horizontal (`x`) and vertical (`y`).

---

### ➕ `getHtmlElPadding(el)`

🧩 Returns the total **padding** of an element using `padding{Side}` from computed styles.

```js
getHtmlElPadding(el: Element): HtmlElBoxSides
```

* `el`: The target DOM element.
* **Returns**: Padding values for all sides and summed horizontal (`x`) and vertical (`y`) values.
