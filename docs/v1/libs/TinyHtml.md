# 📚 TinyHtml Class

`TinyHtml` is a lightweight utility class that provides DOM element manipulation and querying utilities, inspired by jQuery — but built with modern native browser APIs.

It supports both static and instance-level operations, making it easy to work with elements’ dimensions, collisions, and more in a readable and performant way.

Most instance methods that do not return a specific value are designed to return the `TinyHtml` instance itself, enabling **method chaining**.
This allows you to write fluent and expressive code like:

```js
TinyHtml.createElement('div')
  .addClass('box')
  .setAttr('role', 'dialog')
  .appendTo(document.body);
```

This design keeps your code concise while maintaining clarity and control over the DOM structure.

## 📑 Table of Contents

- [🧩 Type Definitions – Core Building Blocks](#-type-definitions--core-building-blocks)
- [🔍 Element Debugging System](#-element-debugging-system)
- [🔨 Element Creation](#-element-creation)
- [🔎 Static DOM Selectors](#-static-dom-selectors)
- [🔍 Element Observer](#-element-observer)
- [📑 HTML Parser](#-html-parser)
- [🧩 Internal Element Access](#-internal-element-access)
- [🛠️ Static Pre-Validation Utilities](#-static-pre-validation-utilities)
- [🔁 Conversion Helpers](#-conversion-helpers)
- [🧹 Element Filtering & Matching](#-element-filtering--matching)
- [💾 Element Data Store](#-element-data-store)
- [🔄 DOM Traversal Methods](#-dom-traversal-methods)
- [🧱 DOM Manipulation](#-dom-manipulation)
- [🧮 Easing Functions](#-easing-functions)
- [🧭 Smooth Scrolling](#-smooth-scrolling)
- [⚙️ Internal Scroll Mechanism](#-internal-scroll-mechanism)
- [📏 Dimensions (Size API)](#-dimensions-size-api)
- [📌 Position, Scroll & Box Spacing](#-position-scroll--box-spacing)
- [🎨 Class Manipulation](#-class-manipulation)
- [📄 Content & Element Info](#-content--element-info)
- [🎛️ Form Value Handling & Input Hooks](#-form-value-handling--input-hooks)
- [🎉 Event Handling](#-event-handling)
- [🧬 Attribute & Property Manipulation](#-attribute--property-manipulation)
- [🛠️ Element Utilities](#-element-utilities)
- [📦 Collision Detection](#-collision-detection)
- [🔐 Collision Locking System](#-collision-locking-system)
- [🧼 Collision Lock Reset](#-collision-lock-reset)
- [👁️ Viewport Detection](#-viewport-detection)
- [🧠 Property Name Normalization](#-property-name-normalization)
- [🔁 Attribute ↔ Property Mapping](#-attribute--property-mapping)
- [🎨 CSS Property Aliases (`cssPropAliases`)](#-css-property-aliases-csspropaliases)
- [✂️ Utility Functions](#-utility-functions)
- [🧩 Style Methods](#-style-methods)
- [🧪 Reading Computed Styles](#-reading-computed-styles)
- [🎬 Animate Stuff](#-animate-stuff)
  - [🎬 Animate DOM (Data)](#-animate-dom-data)
  - [⏹ Animate DOM (cancelOldStyleFx)](#-animate-dom-canceloldstylefx)
  - [⏱ Animate DOM (styleFxSpeeds)](#-animate-dom-stylefxspeeds)
  - [🎨 Animate DOM (styleEffects)](#-animate-dom-styleeffects)
  - [🔄 Animate DOM (styleEffectInverse)](#-animate-dom-styleeffectinverse)
  - [🔁 Animate DOM (styleEffectsRd)](#-animate-dom-styleeffectsrd)
  - [🧩 Animate DOM (styleEffectsProps)](#-animate-dom-styleeffectsprops)
- [🎨 Style FX Manager](#-style-fx-manager)
- [✨ Animate FXs](#-animate-fxs)
- [🖱️ Focus & Blur](#-focus--blur)
- [🌐 Window Scroll & Viewport Helpers](#-window-scroll--viewport-helpers)

---

## 🧩 Type Definitions – Core Building Blocks

This section documents the internal types, helpers, and data structures used by the `TinyHtml` class. These types provide a flexible abstraction over raw DOM elements and enhanced TinyHtml objects.

---

### 🧱 Basic Types

#### `TinyNode`  
Represents a raw `Node`, a `TinyHtml` instance, or `null`.

```ts
Node | TinyHtml | null
```

---

#### `TinyElement`

Represents either a raw `Element` or a `TinyHtml` instance.

```ts
Element | TinyHtml
```

---

#### `TinyHtmlElement`

Alias for `HTMLElement | TinyHtml`.

---

#### `TinyEventTarget`

Represents any event target element or a `TinyHtml` instance.

```ts
EventTarget | TinyHtml
```

---

#### `TinyInputElement`

Used for form elements that can hold values (e.g., input, select).

```ts
InputElement | TinyHtml
```

---

#### `TinyElementAndWindow`

Accepts both raw DOM elements and the `window` object.

```ts
ElementAndWindow | TinyHtml
```

---

#### `TinyElementAndWinAndDoc`

Accepts both raw DOM elements, `document`, and the `window` object.

```ts
ElementAndWinAndDoc | TinyHtml
```

---

#### `TinyElementWithDoc`

Accepts both raw DOM elements, the `document` object, or a `TinyHtml` wrapper.

```ts
ElementWithDoc | TinyHtml
```

Used to abstract interactions with either native elements or enhanced wrappers.

---

### 🔀 Union Types

#### `ElementWithDoc`

A raw DOM `Element` or the `document` object.

```ts
Element | Document
```

Commonly used when the target might be either a single HTML element or the whole document, particularly in layout and measurement utilities.

---

#### `ElementAndWinAndDoc`

Used for scrollable or measurable targets.

```ts
Element | Window | Document
```

---

#### `ElementAndWindow`

Used for scrollable or measurable targets.

```ts
Element | Window
```

---

#### `WinnowRequest`

Flexible type for querying or filtering elements:

* `string` (CSS selector)
* `Element`
* `Element[]`
* `(index: number, el: Element) => boolean`

---

#### `ConstructorElValues`

Values accepted by the TinyHtml constructor:

```ts
Window | Element | Document | Text
```

---

#### `EventRegistryOptions`

Options for `addEventListener` and `removeEventListener`.

```ts
boolean | AddEventListenerOptions
```

---

#### `EventRegistryItem`

Describes an individual event registration.

```ts
{
  handler: EventListenerOrEventListenerObject | null,
  options?: EventRegistryOptions
}
```

---

#### `EventRegistryList`

Maps event names (like `"click"`) to lists of `EventRegistryItem`.

```ts
Record<string, EventRegistryItem[]>
```

---

#### `__eventRegistry`

A `WeakMap` that stores event listeners by element.

```ts
WeakMap<ConstructorElValues|EventTarget, EventRegistryList>
```

---

### 💾 Element Data

#### `ElementDataStore`

A key-value storage associated with an element.

```ts
Record<string, *>
```

---

#### `__elementDataMap`

A `WeakMap` to hold internal data for DOM elements.

```ts
WeakMap<ConstructorElValues, ElementDataStore>
```

---

### 💥 Collision System

#### `CollisionDirLock`

Directions supported for collision lock:

```ts
'top' | 'bottom' | 'left' | 'right'
```

---

#### `__elemCollision`

Stores directional collision locks per element.

```ts
{
  top: WeakMap<Element, true>,
  bottom: WeakMap<Element, true>,
  left: WeakMap<Element, true>,
  right: WeakMap<Element, true>
}
```

---

### 📐 Box Size Utilities

#### `HtmlElBoxSides`

Describes an element’s box sizes.

```ts
{
  x: number, // total horizontal (left + right)
  y: number, // total vertical (top + bottom)
  left: number,
  right: number,
  top: number,
  bottom: number
}
```

---

### 🔢 Value Types

#### `SetValueBase`

Primitive types accepted for form inputs.

```ts
string | number | Date | boolean | null
```

---

#### `SetValueList`

A single value or list of values for input fields.

```ts
SetValueBase | SetValueBase[]
```

---

#### `GetValueTypes`

Supported return types for `.val()` operations:

```ts
'string' | 'date' | 'number'
```

---

#### `InputElement`

Supported form controls used by TinyHtml.

```ts
HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLOptionElement
```

---

### 💾 Internal Animation Storage

```ts
/**
 * Internal storage for animation-related data, associated with elements.
 * Used to remember original dimensions (height/width) and other properties
 * so that animations like `slideUp` and `slideDown` can restore or continue
 * smoothly, mimicking jQuery's behavior.
 *
 * Each element is mapped to a plain object with keys such as `origHeight`,
 * `origWidth`, etc.
 *
 * @type {WeakMap<HTMLElement, Record<string, string|number>>}
 */
const __elementAnimateData = new WeakMap();
```

* **Purpose:** Tracks original dimensions and properties of elements for smooth animations.
* **Type:** `WeakMap<HTMLElement, Record<string, string | number>>`
* **Notes:** Uses a `WeakMap` so that memory is automatically freed when elements are removed from the DOM.

---

### 🎬 Active Animation Tracking

```ts
/**
 * Stores the currently active animation for each element,
 * allowing cancellation or replacement of ongoing animations.
 *
 * @type {WeakMap<HTMLElement, { animation: Animation, id: string }>}
 */
const __elementCurrentAnimation = new WeakMap();
```

* **Purpose:** Keeps track of the active animation per element.
* **Type:** `WeakMap<HTMLElement, { animation: Animation, id: string }>`
* **Notes:** Useful for stopping or replacing animations mid-flight.

---

### ✨ Style Effects Definitions

```ts
/**
 * Mapping of animation shortcuts to their effect definitions.
 * Similar to jQuery's predefined effects (slideDown, fadeIn, etc.).
 *
 * @typedef {Record<string, string|(string|number)[]>} StyleEffects
 */
```

* **Purpose:** Defines reusable animation shortcuts.
* **Example:** `"fadeIn": ["opacity", 0, 1]`

---

### 🖱️ Hover Event Callback

```ts
/**
 * Callback function used for hover events.
 * @callback HoverEventCallback
 * @param {MouseEvent} ev - The mouse event triggered on enter or leave.
 * @returns {void} Returns nothing.
 */
```

* **Purpose:** Defines the expected signature for hover event callbacks.
* **Parameters:** `MouseEvent ev`
* **Returns:** `void`

---

### 🏃 Active Style Animation Collection

```ts
/**
 * Represents a collection of active style-based animations.
 *
 * Each HTMLElement is associated with an array of its currently running
 * `Animation` objects (from the Web Animations API).
 *
 * @typedef {Map<HTMLElement, Animation|null>} StyleFxResult
 */
```

* **Purpose:** Tracks currently running Web Animations per element.
* **Type:** `Map<HTMLElement, Animation|null>`

---

### 📊 Animation Keyframe Data

```ts
/**
 * Represents a collection of animation keyframe data mapped by CSS property.
 *
 * - The **key** is the CSS property name (e.g. `"height"`, `"opacity"`).
 * - The **value** is an array of values representing the start and end
 *   states of the property during the animation.
 *
 * @typedef {Record<string, (string|number)[]>} AnimationSfxData
 */
```

* **Purpose:** Stores start and end states of CSS properties for animations.
* **Type:** `Record<string, (string|number)[]>`

---

### 🔁 Style Effects Repeat Detector

```ts
/**
 * Function signature for style effects repeat detectors.
 *
 * @typedef {(effects: AnimationSfxData) => boolean} StyleEffectsRdFn
 */
```

* **Purpose:** Determines if a style effect should repeat.
* **Type:** `(effects: AnimationSfxData) => boolean`

---

### ⚡ Style Effect Property Handler

```ts
/**
 * Function signature for style effect property handlers.
 *
 * @typedef {(
 *   el: HTMLElement,
 *   keyframes: AnimationSfxData,
 *   prop: string,
 *   style: CSSStyleDeclaration
 * ) => void} StyleEffectsFn
 */
```

* **Purpose:** Handles applying keyframe data to a specific CSS property on an element.
* **Parameters:**

  * `el: HTMLElement` – target element
  * `keyframes: AnimationSfxData` – property keyframes
  * `prop: string` – CSS property
  * `style: CSSStyleDeclaration` – inline style object

---

### 🛠️ Style Effect Property Handlers Collection

```ts
/**
 * A collection of style effect property handlers.
 *
 * @typedef {Record<string, StyleEffectsFn>} StyleEffectsProps
 */
```

* **Purpose:** Groups multiple property handlers for different CSS properties.
* **Type:** `Record<string, StyleEffectsFn>`

---

## 🔍 Element Debugging System

TinyHtml includes a built-in **element debugging system** to help developers identify issues with elements during validation, construction, or event handling.

This feature is **disabled by default** and can be toggled on or off.

---

### ⚙️ Enabling Debug Mode

```js
TinyHtml.elemDebug = true;  // Enable
TinyHtml.elemDebug = false; // Disable
```

#### API

* **`TinyHtml.elemDebug` (boolean)**
  Controls whether TinyHtml emits detailed debug output to the console.

* **Getter**

  ```js
  TinyHtml.elemDebug; // Returns true or false
  ```

* **Setter**

  ```js
  TinyHtml.elemDebug = true;  // Enable debug logs
  TinyHtml.elemDebug = false; // Disable debug logs
  ```

  🚨 Throws `TypeError` if the value is not a boolean.

---

### 🛠 Debugging Invalid Elements

When debug mode is enabled, TinyHtml will log structured information whenever an invalid or unexpected element is passed to its internal operations.

This is done through the internal method:

```js
TinyHtml._debugElemError(elems, elem);
```

#### Parameters

* **`elems`** → An array of elements (`ConstructorElValues | EventTarget | TinyElement | null`) involved in the operation.
* **`elem`** *(optional)* → The specific element that triggered the error.

#### Output Includes

* ❌ **Error header** in the console
* 🧭 **Stack trace** (with `console.trace` or captured stack)
* 📊 **`console.table`** showing:

  * Index
  * `typeof`
  * Constructor name
  * Summary (DOM tag, ID, class, or nodeType)
  * The raw value
* 🎯 **Problematic element** highlighted separately via `console.dir`

---

### 📋 Example Output

When debug mode is enabled and an invalid element is detected, you may see something like this:

```
[TinyHtml Debug] Element validation error
Error: [TinyHtml Debug] Element validation error
    at TinyHtml._debugElemError (...)
    at ...
```

Followed by a **console.table**:

| index | typeOf | constructor | summary            | value         |
| ----- | ------ | ----------- | ------------------ | ------------- |
| 0     | object | TinyElement | div#main.container | TinyElement{} |
| 1     | string | primitive   |                    | "invalid"     |
| 2     | null   | null        |                    | null          |

And a detailed log of the problematic element:

```
[TinyHtml Debug] Problematic element:
<div id="main" class="container">...</div>
```

---

### ✅ Summary

* 🔧 Enable debug with `TinyHtml.elemDebug = true;`
* 🐞 Detailed errors are shown only when debug mode is on
* 📊 Uses `console.table`, `console.error`, and `console.dir` for clarity
* 🚀 Zero runtime overhead when disabled

---

## 🔨 Element Creation

### `TinyHtml.createFrom(tagName, attrs?)`

Creates a new `TinyHtml` element from a given tag name and optional attributes.

* **Parameters**:

  * `tagName` *(string)* — The HTML tag name (e.g., `'div'`, `'span'`, `'button'`).
  * `attrs` *(object)* — *(optional)* Key-value pairs representing HTML attributes.

* **Returns**: `TinyHtml` — A new `TinyHtml` instance representing the created element.

* **Throws**:

  * `TypeError` — If `tagName` is not a string.
  * `TypeError` — If `attrs` is defined but not a plain object.

### 💡 Example

```js
const div = TinyHtml.createFrom('div', { class: 'container' });
const span = TinyHtml.createFrom('span', { id: 'my-span', title: null });
```

The method can also be aliased for convenience:

```js
const createElement = TinyHtml.createFrom;
const button = createElement('button', { type: 'submit', class: 'btn' });
```

---

## 🔎 Static DOM Selectors

These methods wrap native DOM query methods and return results as `TinyHtml` instances for consistency.

### `TinyHtml.createElement(tagName, ops)`

Creates a new DOM element with the given tag name and optional creation options.

* **Parameters**:

  * `tagName` *(string)* — The tag name of the element to create (e.g., `'div'`, `'span'`).
  * `ops` *(ElementCreationOptions)* — *(optional)* Options for advanced element creation.
* **Returns**: `TinyHtml` — A `TinyHtml` instance wrapping the newly created element.
* **Throws**:

  * `TypeError` — If `tagName` is not a string.
  * `TypeError` — If `ops` is defined but not an object.

---

### `TinyHtml.createTextNode(value)`

Creates a new `TinyHtml` instance that wraps a DOM `TextNode`.

This method is useful when you want to insert raw text content into the DOM without it being interpreted as HTML. The returned instance behaves like any other `TinyHtml` element and can be appended or manipulated as needed.

* **Parameters**:

  * `value` *(string)* — The plain text content to be wrapped in a `TextNode`.

* **Returns**: `TinyHtml` — A `TinyHtml` instance wrapping the newly created DOM `TextNode`.

* **Throws**:

  * `TypeError` — If the provided `value` is not a string.

---

### `TinyHtml.createFromHTML(htmlString)`

Creates an `HTMLElement` from an HTML string.
Supports both elements and plain text.

* **Parameters**:

  * `htmlString` *(string)* — The HTML string to convert.

* **Returns**: `TinyHtml` — A `TinyHtml` instance wrapping the resulting `HTMLElement`.

* **Throws**:

  * `Error` — If the parsed content does not produce a valid `Element` when expecting an HTML structure.

---

### `TinyHtml.query(selector)`
Finds the first element by CSS selector.

- **Parameters**:
  - `selector` *(string)* — CSS selector
- **Returns**: `TinyHtml` or `null`

---

### `TinyHtml.queryAll(selector)`
Finds all elements by CSS selector.

- **Returns**: `TinyHtml`

---

### `TinyHtml.getById(selector)`
Selects an element by ID.

- **Parameters**:
  - `selector` *(string)* — Id selector
- **Returns**: `TinyHtml` or `null`

---

### `TinyHtml.getByClassName(selector)`
Finds elements by class name.

- **Returns**: `TinyHtml`

---

### `TinyHtml.getByName(selector)`
Finds elements by `name` attribute.

- **Returns**: `TinyHtml`

---

### `TinyHtml.getByTagNameNS(localName, namespaceURI?)`
Finds elements by tag name in a namespace (defaults to XHTML).

- **Returns**: `TinyHtml`

---

## 🔍 Element Observer

### ⚡ `autoStartElemObserver`

A **flag** that determines whether the internal element observer should automatically start when some library code initializes.

* **Type** 🔘 — `boolean`
* **Default** 🏁 — `true`

#### 📥 Getter

```js
TinyHtml.autoStartElemObserver; // returns true or false
```

Returns the current state of the auto-start flag.

#### 📤 Setter

```js
TinyHtml.autoStartElemObserver = false;
```

Updates the flag.
⚠️ Throws a `TypeError` if the value is not a boolean.

---

### 👀 `tinyObserver`

The internal **[`TinyElementObserver`](./TinyElementObserver.md)** instance used by TinyHtml to track DOM changes.
It is configured to observe the **document root element** (`document.documentElement`) and comes with **built-in detectors** for **style** and **class** attribute changes.

* **Type** 📦 — `TinyElementObserver`

#### 🔧 Configuration

* **Target element**: `document.documentElement` (if available).
* **Detectors**:

  * 🎨 **Style Detector (`tinyStyleEvent`)**
    Detects changes to inline styles (`style` attribute).

    * Compares old vs new styles using `diffStrings`.
    * Dispatches:

      ```js
      new CustomEvent('tinyhtml.stylechanged', { detail: changes })
      ```
  * 🏷️ **Class Detector (`tinyClassEvent`)**
    Detects changes to the `class` attribute.

    * Compares old vs new classes using `diffArrayList`.
    * Dispatches:

      ```js
      new CustomEvent('tinyhtml.classchanged', { detail: changes })
      ```
* **Observer config** ⚙️:

  ```js
  {
    attributeOldValue: true,
    attributes: true,
    subtree: true,
    attributeFilter: ['style', 'class']
  }
  ```

#### 📥 Getter

```js
const observer = TinyHtml.tinyObserver;
```

Retrieves the internal `TinyElementObserver` instance.

---

### ✨ Example Usage

```js
// Listen for style changes on any element in the document
document.addEventListener('tinyhtml.stylechanged', (e) => {
  console.log('🎨 Style changed:', e.detail);
});

// Listen for class changes
document.addEventListener('tinyhtml.classchanged', (e) => {
  console.log('🏷️ Class changed:', e.detail);
});

// Disable auto-start (if needed)
TinyHtml.autoStartElemObserver = false;

// Manually start the observer
TinyHtml.tinyObserver.start();
```

---

## 📑 HTML Parser

### Type Definition

A parsed HTML element represented as an array:

```ts
type HtmlParsed = [
  tagName: string,                 // e.g., 'div', 'span', 'img'
  attributes: Record<string, string>, // Key-value map of all element attributes
  ...children: (string | HtmlParsed)[] // Nested elements or text content
];
```

---

### `fetchHtmlFile(url, ops?)`

Fetches an HTML file from a URL and parses it into a JSON-like structure.

```ts
static async fetchHtmlFile(url: string | URL | Request, ops?: RequestInit): Promise<HtmlParsed[]>
```

* **url**: The URL of the HTML file.
* **ops**: (Optional) `fetch()` options (method, headers, etc).
* **Returns**: Promise of parsed JSON structure (`HtmlParsed[]`).
* Throws if content-type is not `text/html`.

---

### `fetchHtmlNodes(url, ops?)`

Fetches an HTML file and returns it as DOM nodes.

```ts
static async fetchHtmlNodes(url: string, ops?: RequestInit): Promise<(HTMLElement | Text)[]>
```

* **Returns**: Array of real DOM nodes (`HTMLElement | Text`).

---

### `fetchHtmlTinyElems(url, ops?)`

Fetches HTML and converts it into an array of `TinyHtml` instances.

```ts
static async fetchHtmlTinyElems(url: string, ops?: RequestInit): Promise<TinyHtml[]>
```

* **Returns**: `TinyHtml[]` (custom wrapper elements).

---

### `templateToJson(template)`

Converts the contents of a `<template>` to JSON format.

```ts
static templateToJson(template: HTMLTemplateElement): HtmlParsed[]
```

* **Returns**: Structured JSON representation (`HtmlParsed[]`).

---

### `templateToNodes(template)`

Converts `<template>` content into real DOM nodes.

```ts
static templateToNodes(template: HTMLTemplateElement): (Element | Text)[]
```

* **Returns**: Cloned nodes excluding comments.
* Throws error if unexpected node types are encountered.

---

### `templateToTinyElems(template)`

Converts a `<template>` into `TinyHtml` instances.

```ts
static templateToTinyElems(template: HTMLTemplateElement): TinyHtml[]
```

* **Returns**: Array of `TinyHtml` objects.

---

### `htmlToJson(htmlString)`

Parses an HTML string into structured JSON (`HtmlParsed[]`).

```ts
static htmlToJson(htmlString: string): HtmlParsed[]
```

* **Returns**: Parsed representation as an array of `[tag, attributes, ...children]`.

---

### `jsonToNodes(jsonArray)`

Converts parsed JSON back into actual DOM nodes.

```ts
static jsonToNodes(jsonArray: HtmlParsed[]): (HTMLElement | Text)[]
```

* **Returns**: Array of DOM elements/text nodes.
* Skips comments.

---

### `jsonToTinyElems(jsonArray)`

Converts parsed JSON back into `TinyHtml` instances.

```ts
static jsonToTinyElems(jsonArray: HtmlParsed[]): TinyHtml[]
```

* **Returns**: TinyHtml-wrapped elements.

---

💡 **Tip**: All conversion methods rely on a consistent internal format (`HtmlParsed[]`). That means you can seamlessly switch between representations (JSON ⇄ DOM ⇄ TinyHtml)!

---

## 🧩 Internal Element Access

### `_elCheck(els)`

Validates if all provided items are acceptable constructor values.

* **Parameters**:

  * `els` (`ConstructorElValues[]`) — The elements to validate.
* **Throws**:

  * `Error` — If any element is not a valid target.
* **Returns**: `void`

---

### `add(...el)`

Adds elements to the end of the internal collection.

* **Parameters**:

  * `...el` (`ConstructorElValues`) — The elements to add.
* **Returns**: `number` — The new length of the internal collection.

---

### `addBack(...el)`

Adds elements to the beginning of the internal collection.

* **Parameters**:

  * `...el` (`ConstructorElValues`) — The elements to add.
* **Returns**: `number` — The new length of the internal collection.

---

### `delete(index, deleteCount = 1)`

Removes elements at the specified index.

* **Parameters**:

  * `index` (`number`) — The starting index for removal.
  * `deleteCount` (`number`, optional, default = `1`) — The number of elements to remove.
* **Throws**:

  * `TypeError` — If `index` or `deleteCount` are not integers.
  * `Error` — If `index` is out of range.

---

### `clear()`

Clears all elements from the internal collection.

* **Returns**: `void`

---

### `exists(index)`
Checks whether the element exists at the given index.

- **Returns**: `boolean`

---

### `forEach(callback)`

Iterates over all elements in the current instance, executing the provided callback on each one.

* **Parameters**:

  * `callback`: `(element: TinyHtml, index: number, items: TinyHtml[]) => void`
    Function invoked for each element. Receives the current `TinyHtml`, its index, and the full list.

---

### `get(index)`
Returns the raw DOM element associated with this instance.

- **Returns**: `ConstructorElValues`

---

### `size`
Returns the number of elements currently stored in the internal element list.

- **Returns**: `number`

---

### `extract(index)`
Extracts a single DOM element from the internal list at the specified index.

- **Returns**: `TinyHtml`

---

### `get elements`
Returns the current targets held by this instance.

- **Returns**: `ConstructorElValues[]`

---

### `_getElement(where, index)`
Safely returns the element with error checking.

---

### `_getElements(where)`
Returns the current Elements held by this instance.

---

## 🛠️ Static Pre-Validation Utilities

These methods normalize, validate, and prepare elements/nodes before operations. They're internal and mainly used inside the class.

### General Templates

#### `_preElemsTemplate(...)`
Validates an array of elements against allowed constructors.

#### `_preElemTemplate(...)`
Validates a single element, optionally allowing `null`.

---

### Common Validators

Each method below ensures type and returns raw DOM objects:

| Method                         | Target Type      | Return         |
|-------------------------------|------------------|----------------|
| `_preElems(...)`              | `Element[]`      | `Element[]`    |
| `_preElem(...)`               | `Element`        | `Element`      |
| `_preNodeElems(...)`          | `Node[]`         | `Node[]`       |
| `_preNodeElem(...)`           | `Node`           | `Node`         |
| `_preNodeElemWithNull(...)`   | `Node\|null`      | `Node\|null`    |
| `_preHtmlElems(...)`          | `HTMLElement[]`  | `HTMLElement[]`|
| `_preHtmlElem(...)`           | `HTMLElement`    | `HTMLElement`  |
| `_preInputElems(...)`         | `InputElement[]` | `InputElement[]` |
| `_preInputElem(...)`          | `InputElement`   | `InputElement` |
| `_preEventTargetElems(...)`   | `EventTarget[]`  | `EventTarget[]`|
| `_preEventTargetElem(...)`    | `EventTarget`    | `EventTarget`  |
| `_preElemsAndWindow(...)`     | `Element\|Window` | `ElementAndWindow[]` |
| `_preElemAndWindow(...)`      | `Element\|Window` | `ElementAndWindow` |
| `_preElemsAndWinAndDoc(...)`  | `Element\|Window\|Document` | `ElementAndWindow[]` |
| `_preElemAndWinAndDoc(...)`   | `Element\|Window\|Document` | `ElementAndWindow` |
| `_preElemsWithDoc(...)`       | `Element\|Document` | `ElementWithDoc[]` |
| `_preElemWithDoc(...)`        | `Element\|Document` | `ElementWithDoc` |

---

## 🔁 Conversion Helpers

These methods convert between raw DOM and `TinyHtml` instances.

### `TinyHtml.toTinyElm(elems)`
Converts one or more raw elements or `TinyHtml` instances into `TinyHtml[]`.

```ts
TinyHtml.toTinyElm(Element | TinyHtml | Array<Element | TinyHtml>) => TinyHtml[]
```

---

### `TinyHtml.fromTinyElm(elems)`
Extracts native `Element`s from `TinyHtml` instances.

```ts
TinyHtml.fromTinyElm(Element | TinyHtml | Array<Element | TinyHtml>) => Element[]
```

---

## 🧹 Element Filtering & Matching

This section contains utilities for filtering, matching, and traversing DOM elements using selectors, functions, or references.

---

### 🎯 `TinyHtml.winnow(...)`

Advanced filtering engine used internally by many other methods.

- **Parameters**:
  - `elems`: Elements to filter.
  - `qualifier`: A selector, function, DOM element, or array of them.
  - `where`: Context string for debugging.
  - `not`: If `true`, invert the match.
- **Returns**: `Element[]`

---

### 🔍 Static Filter Utilities

#### `TinyHtml.filter(...)`
Filters elements based on a selector (with optional negation).

#### `TinyHtml.filterOnly(...)`
Same as `.filter()`, but calls `winnow()` directly without the `not` flag.

#### `TinyHtml.not(...)`
Excludes elements matching the qualifier.

#### `TinyHtml.is(...)`
Returns `true` if at least one element matches the qualifier.

#### `TinyHtml.has(...)`
Returns elements that contain a given child (selector or element).

#### `TinyHtml.closest(...)`
Finds the nearest ancestor matching a selector, optionally stopping at a context.

---

### 📦 Instance Filter Methods

#### `.not(selector)`
Returns all current elements excluding the ones that match.

#### `.is(selector)`
Checks if the current element matches the selector or qualifier.

#### `.has(target)`
Returns `true` if the current element contains the given target.

#### `.find(selector)`
Finds matching elements inside the current element.

#### `.closest(selector, context?)`
Finds the closest ancestor (including self) matching a selector or specific element.

#### `.isSameDom(elem)`
Checks if the given element is exactly the same DOM node (`===`).

---

## 💾 Element Data Store

TinyHtml supports storing arbitrary data on elements, either *publicly* or *privately*.

---

### 🔒 Internal Data System

```ts
static _dataSelector = {
  public: (where, el) => { ... },
  private: (where, el) => { ... },
};
```

* `public`: Data stored in a `WeakMap` attached to DOM nodes.
* `private`: Data stored in an internal property of the `TinyHtml` instance.

---

### 🗃️ Static Methods

#### `TinyHtml.data(el, key?, isPrivate?)`

Gets data from the element.

* **Returns**: Entire data object (if `key` omitted) or a single value.

#### `TinyHtml.setData(el, key, value, isPrivate?)`

Sets a value on the element’s data store.

#### `TinyHtml.hasData(el, key, isPrivate?)`

Checks if a specific key exists in the data store of a DOM element.

#### `TinyHtml.removeData(el, key, isPrivate?)`

Removes a value associated with a specific key from the data store of a DOM element.

---

### 📌 Instance Methods

#### `.data(key?, isPrivate?)`

Shortcut for getting data from the current instance’s element.

#### `.setData(key, value, isPrivate?)`

Shortcut for setting data on the current element.

#### `.hasData(key, isPrivate?)`

Checks if a specific key exists in the data store of this element.

#### `.removeData(key, isPrivate?)`

Removes a value associated with a specific key from the data store of this element.

---

## 🔄 DOM Traversal Methods

Navigate through the DOM tree easily: siblings, parents, children, and more.

---

### 🌱 `.parent()` / `TinyHtml.parent(...)`
Gets the **direct parent** of the element (ignores fragments).

---

### 🌳 `.parents(until?)` / `TinyHtml.parents(...)`
Collects all ancestor elements (like `.closest()`, but goes all the way up).  
Stops before `until`, if provided.

---

### ↕️ Sibling Navigation

#### `.next()` / `TinyHtml.next(...)`
Returns the next sibling (ignoring non-element nodes).

#### `.prev()` / `TinyHtml.prev(...)`
Returns the previous sibling (ignoring non-element nodes).

#### `.nextAll()` / `TinyHtml.nextAll(...)`
All siblings after the current element.

#### `.prevAll()` / `TinyHtml.prevAll(...)`
All siblings before the current element.

#### `.nextUntil(until)` / `TinyHtml.nextUntil(...)`
All next siblings **up to (not including)** a matching selector or element.

#### `.prevUntil(until)` / `TinyHtml.prevUntil(...)`
All previous siblings **up to (not including)** a matching selector or element.

---

### 🧍 `.siblings()` / `TinyHtml.siblings(...)`
All siblings of the element **excluding itself**.

---

### 👶 `.children()` / `TinyHtml.children(...)`
All child nodes (elements only) of the element.

---

### 🧩 `.contents()` / `TinyHtml.contents(...)`
Returns the contents of the element:
- For `<template>`, returns its content.
- For `<iframe>`, returns the `contentDocument`.
- Otherwise, returns its child nodes.

---

### 📋 `.clone(deep = true)` / `TinyHtml.clone(...)`
Clones the current element (or a list of elements).

- If `deep` is `true` (default), clones all children too.
- Returns an array from static, or a single node from instance.

---

### 🛠 Internal Utilities

These aren't usually called directly by users, but power most traversal:

- `TinyHtml._getSibling(el, direction)`
  - Gets the next/previous sibling that's an element.
- `TinyHtml._getSiblings(start, exclude)`
  - Returns all element siblings from a starting point (optionally excluding one).
- `TinyHtml.domDir(el, direction, until)`
  - Traverses in any direction (parent, next, previous), optionally until a selector or element.

---

## 🧱 DOM Manipulation

Methods to insert, move, or replace nodes in the DOM — just like jQuery, but tiny and classy ✨

---

### `.append(...children)` / `TinyHtml.append(el, ...children)`
Appends one or more nodes or strings to the end of the selected element.

```js
element.append('hello', otherEl);
```

---

### `.prepend(...children)` / `TinyHtml.prepend(el, ...children)`

Prepends one or more nodes or strings to the beginning of the selected element.

---

### `.before(...children)` / `TinyHtml.before(el, ...children)`

Inserts content **before** the selected element in the DOM.

---

### `.after(...children)` / `TinyHtml.after(el, ...children)`

Inserts content **after** the selected element in the DOM.

---

### `.replaceWith(...newNodes)` / `TinyHtml.replaceWith(el, ...newNodes)`

Replaces the element with one or more new nodes or strings.

---

### `.appendTo(targets)` / `TinyHtml.appendTo(el, targets)`

Appends the element to one or more target containers.

* If multiple targets are provided, the element is cloned.
* Think: `$(el).appendTo(targets)` from jQuery.

---

### `.prependTo(targets)` / `TinyHtml.prependTo(el, targets)`

Prepends the element to each of the target containers (cloning when needed).

---

### `.insertBefore(target, child?)` / `TinyHtml.insertBefore(el, target, child?)`

Inserts the element **before** a target element or its specific child.

* If `child` is provided, it is inserted before the child.
* Otherwise, it goes before the target.

---

### `.insertAfter(target, child?)` / `TinyHtml.insertAfter(el, target, child?)`

Inserts the element **after** a target element or its specific child.

---

### `.replaceAll(targets)` / `TinyHtml.replaceAll(el, targets)`

Replaces all target elements with the current element(s).

* When multiple targets are passed, clones the source accordingly.

---

### 🧰 Internal Util

#### `_appendChecker(where, ...nodes)`

Normalizes and converts input (elements, arrays, or strings) into appendable DOM nodes.

> 📌 Used internally by all `append`/`prepend`/`before`/`after` methods to ensure safe insertion.

---

## 🧮 Easing Functions

### `TinyHtml.easings`

A collection of predefined easing functions used for scroll and animation calculations.
Each easing function takes a normalized time (`t` from 0 to 1) and returns a transformed progress value.

| Name             | Description                           |
| ---------------- | ------------------------------------- |
| `linear`         | Constant speed, no easing.            |
| `easeInQuad`     | Accelerates from zero velocity.       |
| `easeOutQuad`    | Decelerates to zero velocity.         |
| `easeInOutQuad`  | Accelerates, then decelerates.        |
| `easeInCubic`    | Starts slow, speeds up sharply.       |
| `easeOutCubic`   | Starts fast, slows down gradually.    |
| `easeInOutCubic` | Smooth acceleration and deceleration. |

```ts
type Easings =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic';
```

```ts
TinyHtml.easings = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
};
```

---

## 🧭 Smooth Scrolling

### `TinyHtml.scrollToXY(el, settings)`

Smoothly scrolls one or more elements (or `window`) to a target position using a custom duration and easing.

If no `duration` or invalid `easing` is provided, the scroll happens instantly.

```ts
TinyHtml.scrollToXY(el, {
  targetX?: number,
  targetY?: number,
  duration?: number,
  easing?: Easings,
});
```

| Parameter            | Type                                             | Description                                                                                                                                        |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `el`                 | `TinyElementAndWindow \| TinyElementAndWindow[]` | One or more elements or the `window` to scroll.                                                                                                    |
| `settings`           | `Object`                                         | Scroll configuration.                                                                                                                              |
| `targetX`            | `number` *(optional)*                            | Final horizontal scroll position.                                                                                                                  |
| `targetY`            | `number` *(optional)*                            | Final vertical scroll position.                                                                                                                    |
| `duration`           | `number` *(optional)*                            | Duration of the scroll animation in milliseconds.                                                                                                  |
| `easing`             | `Easings` *(optional)*                           | Name of easing function to control animation curve.                                                                                                |
| `onAnimation`        | `OnScrollAnimation` *(optional)*                 | Optional callback invoked on each animation frame with the current scroll position, normalized animation time (`0` to `1`), and a completion flag. |

---

## ⚙️ Internal Scroll Mechanism

When called, `scrollToXY()` performs:

1. **Start Position Detection** – Gets current scroll positions.
2. **Delta Calculation** – Calculates the distance to scroll.
3. **Easing Evaluation** – Determines the easing curve to use.
4. **Scroll Loop** – Uses `requestAnimationFrame` to animate over time.
5. **Instant Scroll Fallback** – If no easing/duration is defined, scrolls instantly.

```ts
function executeScroll(elem, newX, newY) {
  if (elem instanceof Window) {
    window.scrollTo(newX, newY);
  } else if (elem.nodeType === 9) {
    elem.defaultView.scrollTo(newX, newY); // For documents
  } else {
    if (elem.scrollLeft !== newX) elem.scrollLeft = newX;
    if (elem.scrollTop !== newY) elem.scrollTop = newY;
  }
}
```

---

## 📏 Dimensions (Size API)

TinyHtml provides methods to **read** and **set** an element's dimensions, similar to jQuery’s width/height API, with support for box models: `content`, `padding`, `border`, and `margin`.

---

### 🔍 Reading Dimensions

#### `.width()` / `TinyHtml.width(el)`
Returns the **content box width** (excluding padding, border, and margin).

#### `.height()` / `TinyHtml.height(el)`
Returns the **content box height**.

---

#### `.innerWidth()` / `TinyHtml.innerWidth(el)`
Returns the **padding box width** (content + padding).

#### `.innerHeight()` / `TinyHtml.innerHeight(el)`
Returns the **padding box height**.

---

#### `.outerWidth(includeMargin = false)` / `TinyHtml.outerWidth(el, includeMargin)`
Returns the **border box width**, and optionally includes margin.

#### `.outerHeight(includeMargin = false)` / `TinyHtml.outerHeight(el, includeMargin)`
Returns the **border box height**, and optionally includes margin.

---

#### `.getDimension(type, extra)` / `TinyHtml.getDimension(el, type, extra)`
The underlying function used for all size getters.

```js
// Example:
element.getDimension('width', 'margin'); // Full box including margin
```

* `type`: `"width"` or `"height"`
* `extra`: `"content"`, `"padding"`, `"border"`, `"margin"`

---

### ✏️ Setting Dimensions

#### `.setWidth(value)` / `TinyHtml.setWidth(el, value)`

Sets the `width` of the element.

```js
el.setWidth(100);        // Sets width to 100px
el.setWidth("50%");      // Sets width to 50%
```

---

#### `.setHeight(value)` / `TinyHtml.setHeight(el, value)`

Sets the `height` of the element.

```js
el.setHeight("10rem");
```

---

## 📌 Position, Scroll & Box Spacing

This API set focuses on **measuring element offsets**, **scroll positions**, and **box sides** such as padding, margin, and border. It helps you understand where an element is and how much space it takes.

---

### 📍 Element Positioning

#### `.offset()` / `TinyHtml.offset(el)`
Returns the coordinates `{ top, left }` of the element **relative to the document**.

#### `.position()` / `TinyHtml.position(el)`
Returns the position **relative to the offset parent**, excluding margins.

#### `.offsetParent()` / `TinyHtml.offsetParent(el)`
Returns the nearest ancestor that has a position other than `static`. Useful for relative positioning logic.

---

### 🔃 Scroll Position

#### `.scrollTop()` / `TinyHtml.scrollTop(el)`
Returns the vertical scroll position of the element or window.

#### `.scrollLeft()` / `TinyHtml.scrollLeft(el)`
Returns the horizontal scroll position of the element or window.

#### `.setScrollTop(value)` / `TinyHtml.setScrollTop(el, value)`
Sets the vertical scroll position.

#### `.setScrollLeft(value)` / `TinyHtml.setScrollLeft(el, value)`
Sets the horizontal scroll position.

```js
element.setScrollTop(100); // Scrolls down 100px
window.setScrollLeft(50);  // Scrolls the window horizontally
```

---

### 📦 Box Model Sides (Padding, Margin, Border)

All methods return an object of the form:

```js
{
  x: number,     // Horizontal total (left + right)
  y: number,     // Vertical total (top + bottom)
  left: number,
  right: number,
  top: number,
  bottom: number
}
```

#### `.margin()` / `TinyHtml.margin(el)`

Returns the margin size on all four sides.

#### `.padding()` / `TinyHtml.padding(el)`

Returns the padding size on all four sides.

#### `.borderWidth()` / `TinyHtml.borderWidth(el)`

Returns the border width (as in CSS `border-width`) on all sides.

#### `.border()` / `TinyHtml.border(el)`

Returns the full border value (`borderLeft`, `borderTop`, etc.) on all sides. Rarely needed unless you’re working with composite CSS values.

---

## 🎨 Class Manipulation

These methods help you add, remove, toggle, and inspect class names applied to elements. All class-related operations use the native `classList` interface under the hood.

---

### ➕ `.addClass(...classNames)` / `TinyHtml.addClass(el, ...classNames)`
Adds one or more class names to the element.

```js
element.addClass("highlight", "bold");
```

---

### ➖ `.removeClass(...classNames)` / `TinyHtml.removeClass(el, ...classNames)`

Removes one or more class names from the element.

```js
element.removeClass("highlight");
```

---

### 🔁 `.replaceClass(oldClass, newClass)` / `TinyHtml.replaceClass(el, oldClass, newClass)`

Replaces one class with another. Returns `true` if the replacement occurred.

```js
element.replaceClass("old", "new");
```

---

### ❓ `.hasClass(className)` / `TinyHtml.hasClass(el, className)`

Checks if the element has a specific class.

```js
element.hasClass("active"); // → true / false
```

---

### 🔃 `.toggleClass(className, [force])` / `TinyHtml.toggleClass(el, className, [force])`

Toggles a class on or off. If `force` is given:

* `true`: ensures the class is added.
* `false`: ensures the class is removed.

Returns whether the class is present **after** the toggle.

```js
element.toggleClass("visible");
element.toggleClass("enabled", true); // Force add
```

---

### 🔢 `.classLength()` / `TinyHtml.classLength(el)`

Returns the number of classes applied to the element.

```js
const count = element.classLength(); // → 3
```

---

### 🔍 `.classItem(index)` / `TinyHtml.classItem(el, index)`

Gets the class name at a specific index in the class list.

```js
element.classItem(0); // → "highlight"
```

---

### 📋 `.classList()` / `TinyHtml.classList(el)`

Returns all class names as an array.

```js
element.classList(); // → ["highlight", "bold", "selected"]
```

---

## 📄 Content & Element Info

These methods let you get or set basic element info like tag name, ID, text content, or HTML content. Useful for reading or updating elements without dealing directly with DOM properties.

---

### 🏷 `.tagName()` / `TinyHtml.tagName(el)`
Returns the uppercase tag name of the element.

```js
element.tagName(); // → "DIV", "SPAN", etc.
```

---

### 🆔 `.id()` / `TinyHtml.id(el)`

Returns the ID attribute value of the element.

```js
element.id(); // → "my-element-id"
```

---

### 📝 `.toBigInt()` / `TinyHtml.toBigInt(el)`

Gets the **BigInt** content of the element (returns `null` if invalid or empty).

```js
element.toBigInt(); // → 123n
```

---

### ✍️ `.setBigInt(value)` / `TinyHtml.setBigInt(el, value)`

Sets the **BigInt** content of one or more elements. Throws if `value` is not a BigInt.

```js
element.setBigInt(456n);
```

---

### 📝 `.toDate()` / `TinyHtml.toDate(el)`

Gets the **Date** content of the element (returns `null` if invalid).

```js
element.toDate(); // → 2025-08-31T00:00:00.000Z
```

---

### ✍️ `.setDate(value)` / `TinyHtml.setDate(el, value)`

Sets the **Date** content of one or more elements. Throws if `value` is not a valid `Date`.

```js
element.setDate(new Date("2025-08-31T00:00:00Z"));
```

---

### 📝 `.toJson()` / `TinyHtml.toJson(el)`

Gets the **JSON** content of the element (returns `null` if invalid or empty).

```js
element.toJson(); // → { a: 1, b: 2 }
```

---

### ✍️ `.setJson(value, replacer, space)` / `TinyHtml.setJson(el, value, replacer, space)`

Sets the **JSON** content of one or more elements.

```js
element.setJson({ a: 1, b: 2 });          // minified
element.setJson({ a: 1, b: 2 }, null, 2);       // 2-space indentation
```

---

### 📝 `.toNumber()` / `TinyHtml.toNumber(el)`

Gets the **number** content of the element (returns `null` if invalid or empty).

```js
element.toNumber(); // → 42
```

---

### ✍️ `.setNumber(value)` / `TinyHtml.setNumber(el, value)`

Sets the **number** content of one or more elements. Throws if `value` is not a number.

```js
element.setNumber(99);
```

---

### 📝 `.toBoolean()` / `TinyHtml.toBoolean(el)`

Gets the **boolean** content of the element.
Returns `true` if the text is `"true"`, `false` if `"false"`, and `null` if empty or invalid.

```js
element.toBoolean(); // → true | false | null
```

---

### ✍️ `.setBoolean(value)` / `TinyHtml.setBoolean(el, value)`

Sets the **boolean** content of one or more elements.
Throws if `value` is not a boolean.

```js
element.setBoolean(true);  // sets content to "true"
element.setBoolean(false); // sets content to "false"
```

---

### 📝 `.toString()` / `TinyHtml.toString(el)`

Gets the **string** content of the element (returns `null` if none).

```js
element.toString(); // → "Hello world"
```

---

### ✍️ `.setString(value)` / `TinyHtml.setString(el, value)`

Sets the **string** content of one or more elements.
Throws if `value` is not a string.

```js
element.setString("New text content");
```

---

### 📝 `.text()` / `TinyHtml.text(el)`

Gets the text content of the element (returns `null` if none).

```js
element.text(); // → "Hello world"
```

---

### ✍️ `.setText(value)` / `TinyHtml.setText(el, value)`

Sets the text content of one or more elements. Throws if `value` is not a string.

```js
element.setText("New text content");
```

---

### 🧹 `.empty()` / `TinyHtml.empty(el)`

Removes all child nodes (clears content) from one or more elements.

```js
element.empty();
```

---

### 🔍 `.html(ops?)` / `TinyHtml.html(el, ops?)`

Gets the `innerHTML` string of the element.

* `ops?`: GetHTMLOptions from native DOM.

```js
element.html(); // → "<p>Some HTML content</p>"
```

---

### 🛠 `.setHtml(value)` / `TinyHtml.setHtml(el, value)`

Sets the `innerHTML` of one or more elements. Throws if `value` is not a string.

```js
element.setHtml("<strong>Bold text</strong>");
```

---

## 🎛️ Form Value Handling & Input Hooks

This section handles reading and writing values for form controls (`input`, `select`, `option`, `checkbox`, `radio`, etc.) with support for custom hooks to manage special cases seamlessly.

---

### 🪝 `_valHooks`

Internal value hooks for form controls

- **option**: Gets the option value or fallback to text.
- **select**: Handles single/multiple select value getting/setting.
- **radio**: Gets `'on'`/`'off'` based on checked state; sets checked with unchecking siblings.
- **checkbox**: Similar to radio, manages checked state.

These hooks ensure form controls behave consistently across different types.

---

### 🎯 `.setVal(el, value)` / `.setVal(value)`

Sets the value(s) of input/select/textarea elements.  
Supports strings, numbers, booleans, arrays, or a callback returning these.

Throws if value is invalid or unsupported.

```js
element.setVal("hello");
element.setVal(["option1", "option2"]);
element.setVal((el, currentVal) => currentVal + " updated");
```

---

### 🔍 `.val(el)` / `.val()`

Gets the normalized string value from an input/select element.
Strips carriage returns and handles hooks automatically.

---

### ✍️ `.valTxt(el)` / `.valTxt()`

Gets the text string value, throwing if the value is not string-compatible.

---

### 🧮 `.valNb(el)` / `.valNb()`

Gets the value parsed as a number. Throws if value is `NaN` or element incompatible.

---

### 📅 `.valDate(el)` / `.valDate()`

Gets the value parsed as a `Date` object. Throws if value is invalid or element incompatible.

---

### ✔️ `.valBool(el)` / `.valBool()`

Returns boolean state for checkboxes/radios based on value `"on"` or `"off"`.

---

### 🧩 Internal helpers:

* `_valTypes`: Map of functions to get typed values (string, date, number).
* `_getValByType`: Get typed value from element with validation.
* `_val`: Core value getter that uses hooks or falls back to `_valTypes`.
* `_valArr`: Ensures the returned value is an array (for multi-selects).

---

## 🎉 Event Handling

These methods allow you to easily register, remove, or trigger DOM events.
All event listeners are tracked in a private registry for full control.

---

### 📋 `listenForPaste()`

Handling Pasted Files and Text

```js
element.listenForPaste({
  onFilePaste(item, file) {
    console.log("Pasted file:", file.name);
  },
  onTextPaste(item, text) {
    console.log("Pasted text:", text);
  },
});
```

Registers a listener for the `"paste"` event to extract files or plain text directly from the clipboard.

* `onFilePaste(item, file)` – Triggered once for each file pasted (e.g., images or documents).
* `onTextPaste(item, text)` – Triggered when plain text is pasted.

Use this to build file dropzones, rich editors, or custom paste behavior.
You can also use the static version for multiple elements:

```js
TinyHtml.listenForPaste([el1, el2], {
  onFilePaste(item, file) {
    console.log("Pasted a file into multiple elements!");
  }
});
```

Returns the internal paste handler function.

---

### 📡 `hasEventListener()`

Checking for Event Presence

```js
if (element.hasEventListener("click")) {
  console.log("Click handler already registered.");
}
```

Checks whether any handler is currently registered on `__eventRegistry` for the given event name on an element.

* Returns `true` if any listener exists for the event, otherwise `false`.

Also available as a static version:

```js
TinyHtml.hasEventListener(el, "paste");
```

---

### 🎯 `hasExactEventListener()`

Checking for a Specific Handler

```js
function onClick() {}
element.on("click", onClick);

if (element.hasExactEventListener("click", onClick)) {
  console.log("The exact click handler is registered.");
}
```

Checks whether an element has **that exact function** registered on `__eventRegistry` for the given event.

* Returns `true` only if the same reference to the function is found.
* Helps prevent duplicate listeners or for conditional removal logic.

Also available as a static version:

```js
TinyHtml.hasExactEventListener(el, "click", onClick);
```

---

### 🐭 `hover()`

Hover Event Shortcut

```js
element.hover(
  (e) => console.log("Mouse entered!"),
  (e) => console.log("Mouse left!")
);
```

* `hover(fnOver, fnOut)`: Attaches a pair of event listeners for `mouseenter` and `mouseleave`.

  * `fnOver`: Runs when the mouse enters the element.
  * `fnOut`: Runs when the mouse leaves. If omitted, `fnOver` is used for both.
  * `options`: Optional event listener options.

You can also use the static version:

```js
TinyHtml.hover([el1, el2], 
  () => console.log("Hovered in!"), 
  () => console.log("Hovered out!")
);
```

---

### 📥 `on()` / `once()`

Registering Events

```js
element.on("click", (e) => console.log("Clicked!"));
element.once("mouseenter", () => console.log("Hovered just once!"));
```

* `on`: Attaches a persistent event listener.
* `once`: Attaches a listener that auto-removes after its first trigger.

You can also use the static versions for multiple elements.

---

### ❌ `off()` / `offAll()` / `offAllTypes()`

Removing Events

```js
element.off("click", myHandler);
element.offAll("mouseover");
element.offAllTypes((handler, event) => event.startsWith("key"));
```

* `off`: Removes a specific listener.
* `offAll`: Removes all listeners of a given type.
* `offAllTypes`: Removes all listeners of all types, optionally filtered.

These methods ensure clean teardown of events and prevent memory leaks.

---

### 🚀 `trigger()`

Triggering Events

```js
element.trigger("click");
element.trigger("customEvent", { detail: "🔥 data!" });
```

Simulates a user-triggered event.
Supports native and custom events with optional payload.

---

## 🧬 Attribute & Property Manipulation

Use these helpers to interact with standard DOM attributes or element properties with added safety and normalization.

---

### 🏷️ `.attr()` / `.setAttr()` / `.removeAttr()` / `.hasAttr()`

Attributes

```js
element.attr("href");                  // Get
element.setAttr("title", "Cool!");     // Set
element.setAttr({ "title": "Cool!" }); // Set
element.removeAttr("data-test");       // Remove
element.hasAttr("id");                 // Check
```

```js
element.attrBigInt("example");             // Get
element.setAttrBigInt("example", 10n);     // Set
element.setAttrBigInt({ "example": 10n }); // Set
```

```js
element.attrDate("example");                    // Get
element.setAttrDate("example", new Date());     // Set
element.setAttrDate({ "example": new Date() }); // Set
```

```js
element.attrJson("example");                           // Get
element.setAttrJson("example", { pudding: true });     // Set
element.setAttrJson({ "example": { pudding: true } }); // Set
```

```js
element.attrNumber("example");           // Get
element.setAttrNumber("example", 1);     // Set
element.setAttrNumber({ "example": 1 }); // Set
```

```js
element.attrBoolean("example");              // Get
element.setAttrBoolean("example", true);     // Set
element.setAttrBoolean({ "example": true }); // Set
```

```js
element.attrString("example");                   // Get
element.setAttrString("example", "pudding");     // Set
element.setAttrString({ "example": "pudding" }); // Set
```

Works on both single and multiple elements (static or instance).
Safe and type-checked — throws if misuse is detected.

---

### 🧲 `.hasProp()` / `.addProp()` / `.removeProp()` / `.toggleProp()` / `.prop()` / `.setProp()`

Properties

```js
element.prop('scrollHeight');           // get scrollHeight value
element.setProp('disabled', true);      // set true
element.hasProp("disabled");            // true/false
element.addProp("checked");             // set true
element.removeProp("checked");          // set false
element.toggleProp("disabled");         // flip
element.toggleProp(["readonly"], true); // force enable
```

These methods interact with real DOM properties (not just attributes).
Includes jQuery-style `propFix` (e.g., `"for"` → `"htmlFor"`).

---

## 🛠️ Element Utilities

---

### 💨 `.remove()`

Remove from DOM

```js
element.remove();
```

Removes the selected element(s) from the document.
Also available in static form: `TinyHtml.remove(el)`.

---

### 🔢 `.index()`

Element Index

```js
element.index();              // Get index among siblings
element.index(".some-class"); // Get index relative to a selector
```

Returns the index of the current element:

* Among its siblings (default)
* Or relative to a given selector or list of elements.

---

## 📦 Collision Detection

Useful for game dev, UI constraints, dragging logic, etc.

---

### 📏 `.isCollWith()`

Bounding Box Collision

```js
element1.isCollWith(element2);
element1.isCollWith(element2, { top: 5, left: 5 });
```

Checks for overlap between bounding boxes of two elements.
You can also extend the size of `element1`'s box using `extraRect`.

---

### 🎯 `.isCollPerfWith()`

Pixel-Perfect Collision

```js
element1.isCollPerfWith(element2);
```

Uses a higher-precision algorithm (like real pixel collision), ideal for:

* Tight hitboxes
* Game-like interactions
* Avoiding false positives near edges

---

## 🔐 Collision Locking System

Maintains a collision "state lock" until the element exits the target from a specific side.

---

### 🔄 `.isCollWithLock()`

Lock Until Exit (Bounding Box)

```js
element1.isCollWithLock(element2, "top");
```

Locks the collision detection to a **direction**:

* `top`, `bottom`, `left`, `right`

🔄 It keeps the state `true` until the element exits through the same side it entered.

---

### 🔬 `.isCollPerfWithLock()`

Lock Until Exit (Pixel-Precise)

```js
element1.isCollPerfWithLock(element2, "left", { left: 10 });
```

Just like `.isCollWithLock()`, but with pixel-precision.

---

## 🧼 Collision Lock Reset

Clear collision lock state to restart fresh.

---

### 🔁 `.resetCollLock()`

Reset All Directions

```js
element.resetCollLock();
```

Clears **all directional locks** for the element.

---

### ⬅️ `.resetCollLockDir()`

Reset One Direction

```js
element.resetCollLockDir("right");
```

Resets a **specific direction** lock.

---

## 👁️ Viewport Detection

Easily detect whether an element is partially or fully visible inside the browser window.

---

### 👀 `.isInViewport()`

Partially Visible

```js
element.isInViewport();
```

Checks if the element is **at least partially** visible in the current viewport.

#### ✅ Use when:

* You want to trigger animations when an element **starts entering** the screen.
* Detect lazy loading or partial exposure of banners, sections, etc.

#### 🔍 Logic:

* Compares the element’s **top and bottom** against the **viewport’s top and bottom**.
* Returns `true` if **any portion** of the element is inside the viewport.

#### 🔁 Static version:

```js
TinyHtml.isInViewport(element);
```

---

### 📏 `.isScrolledIntoView()` 

Fully Visible

```js
element.isScrolledIntoView();
```

Checks if the element is **fully inside** the viewport — meaning:

* Its **top is not above** the screen
* Its **bottom is not below** the screen

#### ✅ Use when:

* You want to detect **full visibility** before triggering something (e.g., playing a video).
* Ensuring an element is **100% onscreen** before acting on it.

#### 🔍 Logic:

* Measures if the element's **entire height** fits between `scrollTop` and `scrollTop + window height`.

#### 🔁 Static version:

```js
TinyHtml.isScrolledIntoView(element);
```

---

### 🫣 `.isInContainer(container)`

Partially Visible in Container

```js
element.isInContainer(container);
```

Checks if **any part** of the element is visible **inside the scrollable container** — meaning:

* It **overlaps** the visible area of the container.
* At least part of it is within the container’s viewport.

#### ✅ Use when:

* You want to detect if an element is **partially scrolled into view**.
* Useful for triggering **lazy loading**, **animations**, or **UI changes** when something starts to appear.

#### 🔍 Logic:

* It compares the element's `getBoundingClientRect()` with the container’s.
* Ensures there's **some overlap**, vertically or horizontally.

#### 🔁 Static version:

```js
TinyHtml.isInContainer(element, container);
```

---

### ✅ `.isFullyInContainer(container)`

Fully Visible in Container

```js
element.isFullyInContainer(container);
```

Checks if the element is **completely visible** inside the scrollable container — meaning:

* **Top and bottom** of the element are within the container.
* **Left and right** are also inside the container’s boundaries.

#### ✅ Use when:

* You want to detect if an element is **entirely inside** its scrollable container.
* Useful for triggering **lazy loading**, **animations**, or **UI changes** when something starts to appear.

#### 🔍 Logic:

* It compares the full bounding box of the element to the container's.
* All four edges must be within bounds to return `true`.

#### 🔁 Static version:

```js
TinyHtml.isFullyInContainer(element, container);
```

---

### ✅ `.hasScroll()`

Detect Scrollability in Any Direction

```js
element.hasScroll();
```

Checks if the element has **scrollable content** in either vertical or horizontal direction.

Returns:

```js
{ v: true|false, h: true|false }
```

Where:

* `v` = vertical scroll present
* `h` = horizontal scroll present

#### ✅ Use when:

* You want to detect **whether an element needs scrollbars**.
* Useful for adjusting layout, showing scroll indicators, or enabling custom scrolling behaviors.

#### 🔍 Logic:

* It compares the element's `scrollHeight` with `clientHeight` for vertical,
* And `scrollWidth` with `clientWidth` for horizontal.
* If content overflows in either direction, it returns `true` for that axis.

#### 🔁 Static version:

```js
TinyHtml.hasScroll(element);
```

---

## 🧠 Property Name Normalization

The object `TinyHtml.propFix` maps HTML attribute names (as strings) to their corresponding JavaScript DOM property names. This works similarly to jQuery’s `propFix`.

```js
TinyHtml.propFix['for'];   // "htmlFor"
TinyHtml.propFix['class']; // "className"
```

⚠️ **Do not modify** the internal `#propFix` object directly. Instead, use `TinyHtml.propFix` (the public proxy) to ensure the reverse mapping in `TinyHtml.attrFix` stays in sync.

### ✍️ Adding a New Property Mapping

To add a new property normalization:

```js
TinyHtml.propFix['readonly'] = 'readOnly';
```

This will automatically make this available:

```js
TinyHtml.attrFix['readOnly']; // "readonly"
```

---

## 🔁 Attribute ↔ Property Mapping

### 🧭 `TinyHtml.getPropName(name)`

Normalizes an HTML attribute name to its corresponding DOM property name.

```js
TinyHtml.getPropName('for');   // "htmlFor"
TinyHtml.getPropName('class'); // "className"
TinyHtml.getPropName('title'); // "title" (not mapped, returns input)
```

Useful when setting DOM properties programmatically.

### 🧭 `TinyHtml.getAttrName(name)`

Converts a DOM property name back to its equivalent HTML attribute name.

```js
TinyHtml.getAttrName('htmlFor');   // "for"
TinyHtml.getAttrName('className'); // "class"
TinyHtml.getAttrName('title');     // "title" (not mapped, returns input)
```

Useful when serializing an element back to HTML or attributes.

### 🔄 Behind the Scenes

* `TinyHtml.propFix` (public) is a proxy of the internal `#propFix` object.
* `TinyHtml.attrFix` is auto-generated from `#propFix`, mapping values back in reverse.

These mappings are kept **in sync automatically** whenever you assign a new property to `TinyHtml.propFix`.

---

## 🎨 CSS Property Aliases (`cssPropAliases`)

TinyHtml provides automatic conversion between `camelCase` and `kebab-case` style properties to simplify working with inline styles in HTML elements.

This is useful for working with both JavaScript style names and the raw `style=""` attribute.

### 🔁 Alias Mapping

The object `cssPropAliases` maps JavaScript-style property names (`camelCase`) to their CSS equivalents (`kebab-case`), for example:

```js
TinyHtml.cssPropAliases.backgroundColor; // "background-color"
```

⚠️ Do not modify the internal `#cssPropAliases` object directly. Instead, use the `TinyHtml.cssPropAliases` proxy.

### ✍️ Adding a New Alias

To add a new alias and automatically generate the reverse mapping:

```js
TinyHtml.cssPropAliases.tinyPudding = 'tiny-pudding';
```

This will automatically make this available:

```js
TinyHtml.cssPropRevAliases['tiny-pudding']; // "tinyPudding"
```

---

## ✂️ Utility Functions

### 🔡 `TinyHtml.toStyleKc(str)`

Converts a camelCase property to kebab-case if it exists in the alias list.

```js
TinyHtml.toStyleKc('marginLeft'); // "margin-left"
```

### 🔡 `TinyHtml.toStyleCc(str)`

Converts a kebab-case property to camelCase if it exists in the reverse alias list.

```js
TinyHtml.toStyleCc('font-weight'); // "fontWeight"
```

---

## 🧩 Style Methods

### 🎯 `TinyHtml.setStyle(el, prop, value)`

Sets one or more inline CSS properties on an element or a list of elements.

```js
TinyHtml.setStyle(element, 'backgroundColor', 'blue');

TinyHtml.setStyle(element, {
  fontSize: '14px',
  color: 'white',
});
```

---

### 🔍 `TinyHtml.getStyle(el, prop)`

Returns the value of an inline style property (not computed).

```js
TinyHtml.getStyle(element, 'backgroundColor'); // "blue"
```

---

### 🧾 `TinyHtml.style(el, settings = {})`

Returns all inline styles defined directly on the element (`style` attribute), as an object.

You can customize the output by passing an optional settings object:

* `camelCase` (`boolean`, default `false`) – If `true`, property names will be returned in camelCase format.
* `rawAttr` (`boolean`, default `false`) – If `true`, the raw `style` attribute string will be parsed manually instead of using the element's `style` object.

#### ✅ Examples

```js
TinyHtml.style(element, { rawAttr: true, camelCase: false });
// {
//   "background-color": "tomato",
//   "border-radius": "10px"
// }

TinyHtml.style(element, { rawAttr: true, camelCase: true });
// {
//   backgroundColor: "tomato",
//   borderRadius: "10px"
// }

TinyHtml.style(element, { rawAttr: false, camelCase: true });
// {
//   "backgroundColor":"tomato",
//   "borderTopLeftRadius":"10px",
//   "borderTopRightRadius":"10px",
//   "borderBottomRightRadius":"10px",
//   "borderBottomLeftRadius":"10px",
//   "borderTopStyle":"dashed",
//   "borderRightStyle":"dashed",
//   "borderBottomStyle":"dashed",
//   "borderLeftStyle":"dashed"
// }
```

---

### ❌ `TinyHtml.removeStyle(el, prop)`

Removes one or more properties from an element’s inline styles.

```js
TinyHtml.removeStyle(element, 'color');

TinyHtml.removeStyle(element, ['fontSize', 'padding']);
```

---

### 🔁 `TinyHtml.toggleStyle(el, prop, val1, val2)`

Toggles a CSS inline property between two values.

```js
TinyHtml.toggleStyle(element, 'backgroundColor', 'blue', 'red');
```

---

### 🧼 `TinyHtml.clearStyle(el)`

Removes all inline styles (`style=""`) from the element(s).

```js
TinyHtml.clearStyle(element);
```

---

## 🧪 Reading Computed Styles

TinyHtml provides multiple utilities for reading CSS styles from elements, both individually and in groups, using computed values (via `window.getComputedStyle`).

---

### 🎨 `static parseStyle(styleText)`

Parses an inline CSS style string into an **object** representation.

* **`styleText`** 📝 — CSS inline style string (e.g., `"color: red; font-size: 12px;"`).
* **Returns** 📦 — An object mapping CSS properties to their values.

**Example:**

```js
parseStyle('color: red; font-size: 12px;');
// ➡ { color: 'red', 'font-size': '12px' }
```

---

### 🧬 `TinyHtml.css(el)` / `el.css()`

Returns the full computed style object for a given element.

```js
const style = TinyHtml.css(element);

// or using instance:
const style = myTinyElem.css();
```

**Returns:**
`CSSStyleDeclaration` – all computed styles from the browser.

---

### 🔍 `TinyHtml.cssString(el, prop)` / `el.cssString(prop)`

Returns a specific **computed CSS value as a string**.

```js
myTinyElem.cssString('marginTop');        // "10px"
```

**Returns:**
`string | null` – The computed value of the property, or `null` if invalid.

---

### 📑 `TinyHtml.cssList(el, props[])` / `el.cssList(props[])`

Returns a **subset of computed styles** based on a list of property names.

```js
TinyHtml.cssList(element, ['width', 'height']);
// { width: "120px", height: "40px" }
```

**Returns:**
`Partial<CSSStyleDeclaration>` – only the requested properties.

---

### 🔢 `TinyHtml.cssFloat(el, prop)` / `el.cssFloat(prop)`

Returns the **computed value parsed as a float number**.

```js
myTinyElem.cssFloat('width');  // 120
```

This is useful when working with dimensions or numeric spacing.

**Returns:**
`number` – A parsed float, or `0` if invalid.

---

### 🔢🔢 `TinyHtml.cssFloats(el, props[])` / `el.cssFloats(props[])`

Gets multiple computed CSS float values at once.

```js
myTinyElem.cssFloats(['paddingTop', 'paddingBottom']);
// { paddingTop: 10, paddingBottom: 5 }
```

**Returns:**
`Record<string, number>` – A mapping of property names to their float values.

---

## 🎬 Animate DOM (Data)

### `getAnimateData(el, where)`  
🔍 Retrieves stored animation data for a given element and key.  
If no data exists yet, it initializes storage for that element.  

- **Parameters**:  
  - `el` 👉 `HTMLElement` — The element whose data should be retrieved.  
  - `where` 👉 `string` — The key to read (e.g., `"origHeight"`).  
- **Returns**: `string | number | undefined` — The stored value, or `undefined`.  

---

### `setAnimateData(el, where, value)`  
💾 Stores animation data for a given element and key.  
Used to cache original size/values for animations.  

- **Parameters**:  
  - `el` 👉 `HTMLElement` — The element whose data should be set.  
  - `where` 👉 `string` — The key to store under (e.g., `"origHeight"`).  
  - `value` 👉 `string | number` — The value to store.  
- **Throws**: `TypeError` if the arguments are invalid.  

---

## ⏹ Animate DOM (cancelOldStyleFx)

### `#cancelOldStyleFx`  
⚙️ Global configuration flag controlling whether old style-based animations  
are cancelled before a new one starts. Defaults to **true**.  

- **Type**: `boolean`  

---

### `cancelOldStyleFx` (getter / setter)  
🛠 Controls whether old animations are automatically cancelled before new ones begin.  

- **Getter**: Returns a `boolean`.  
- **Setter**: Accepts a `boolean`. Throws `TypeError` otherwise.  

---

## ⏱ Animate DOM (styleFxSpeeds)

### `#styleFxSpeeds`  
⚡ Predefined animation speed options, inspired by `jQuery.fx.speeds`.  

- **Example**:  
```js
  TinyHtml.animate(el, keyframes, 'fast');
  TinyHtml.slideDown(el, 'slow');
```

* **Type**: `Record<string, number | KeyframeAnimationOptions>`

---

### `styleFxSpeeds` (getter / setter)

🔄 Access or replace the full speed definitions.

* **Getter**: Returns a cloned copy of speeds.
* **Setter**: Accepts a valid object. Throws `TypeError` otherwise.

---

### `getStyleFxSpeed(name)`

📥 Get a predefined speed by name.

* **Parameters**:

  * `name` 👉 `string` — The name of the speed entry.
* **Returns**: `number | KeyframeAnimationOptions | undefined`

---

### `setStyleFxSpeed(name, value)`

📤 Add or overwrite a speed entry.

* **Parameters**:

  * `name` 👉 `string`
  * `value` 👉 `number | KeyframeAnimationOptions`

---

### `deleteStyleFxSpeed(name)`

🗑 Delete a predefined speed by name.

* **Returns**: `boolean`

---

### `hasStyleFxSpeed(name)`

❓ Check if a predefined speed exists.

* **Returns**: `boolean`

---

## 🎨 Animate DOM (styleEffects)

### `#styleEffects`

🎭 Predefined style-based animation effects.

* **Default values**:

  * `slideDown`
  * `slideUp`
  * `fadeIn`
  * `fadeOut`

---

### `styleEffects` (getter / setter)

📦 Manage the collection of style effects.

* **Getter**: Returns a deep-cloned copy.
* **Setter**: Replaces all effects with validation.

---

### `getStyleEffect(name)`

📥 Retrieve a style effect by name.

* **Returns**: `StyleEffects | undefined`

---

### `setStyleEffect(name, value)`

📝 Register or overwrite a style effect.

* **Throws**: `TypeError` if invalid.

---

### `deleteStyleEffect(name)`

🗑 Delete a style effect by name.

* **Returns**: `boolean`

---

### `hasStyleEffect(name)`

❓ Check if a style effect exists.

* **Returns**: `boolean`

---

## 🔄 Animate DOM (styleEffectInverse)

### `#styleEffectInverse`

↔️ Maps effects to their inverse.

* **Default values**:

  * `slideDown ↔ slideUp`
  * `fadeIn ↔ fadeOut`

---

### `styleEffectInverse` (getter / setter)

🔀 Manage inverse mappings.

* **Getter**: Returns a cloned copy.
* **Setter**: Replaces all inverse mappings.

---

### `getStyleEffectInverse(name)`

📥 Retrieve inverse effect by name.

* **Returns**: `string | null`

---

### `setStyleEffectInverse(name, value)`

📝 Register or overwrite inverse mapping.

---

### `deleteStyleEffectInverse(name)`

🗑 Delete an inverse mapping.

* **Returns**: `boolean`

---

### `hasStyleEffectInverse(name)`

❓ Check if an inverse mapping exists.

* **Returns**: `boolean`

---

## 🔁 Animate DOM (styleEffectsRd)

### `#styleEffectsRd`

🔎 Repeat detector functions.
Used to check if animations would produce no visible change.

---

### `styleEffectsRd` (getter / setter)

⚙️ Manage repeat detectors.

---

### `getStyleEffectRd(name)`

📥 Retrieve a repeat detector.

* **Returns**: `StyleEffectsRdFn | null`

---

### `setStyleEffectRd(name, fn)`

📝 Register or overwrite a repeat detector.

---

### `deleteStyleEffectRd(name)`

🗑 Delete a repeat detector by name.

---

### `hasStyleEffectRd(name)`

❓ Check if a repeat detector exists.

* **Returns**: `boolean`

---

## 🧩 Animate DOM (styleEffectsProps)

### `#styleEffectsProps`

🛠 Effect property handlers for **show** and **hide**.
Each function generates appropriate keyframes depending on the property.

* **Supported props**:

  * `height` / `width`
  * `margin*` / `padding*`
  * `opacity`
  * Any other style property

* **Type**: `StyleEffectsProps`

---

### `static get styleEffectsProps(): StyleEffectsProps`

Returns a shallow-cloned copy of the property effect handlers.

---

### `static set styleEffectsProps(value: StyleEffectsProps): void`

Replace the entire styleEffectsProps map with a new one.
Throws a `TypeError` if `value` is not a plain object or if any property is not a function.

---

### `static getStyleEffectProp(name: string): StyleEffectsFn | null`

Get a style effect property handler by name.
Returns the handler function or `null` if not found.

---

### `static setStyleEffectProp(name: string, fn: StyleEffectsFn): void`

Register or overwrite a style effect property handler.
Throws a `TypeError` if `name` is not a string or `fn` is not a function.

---

### `static deleteStyleEffectProp(name: string): boolean`

Delete a style effect property handler by name.
Returns `true` if deleted, `false` otherwise.

---

### `static hasStyleEffectProp(name: string): boolean`

Check if a style effect property handler exists.

---

## 🎨 Style FX Manager

### `static genStyleFx(type: string, includeWidth = false): Record<string, string>`

Generates effect parameters to create standard animations.

* `type`: Effect type (e.g. `"show"`, `"hide"`).
* `includeWidth`: Whether to also include `width` and `opacity`.

---

### `static applyStyleFx(el, id, props, ops?): StyleFxResult`

Applies style-based effects (slide, fade) to one or more elements.
Converts abstract effect definitions (e.g. `{ height: "show" }`) into Web Animations API keyframes.

---

### `applyStyleFx(id, props, ops?): StyleFxResult`

Instance method version of `applyStyleFx`.

---

## 🎬 Animate Stuff

### `static getCurrentAnimationId(el: HTMLElement): string | null | undefined`

Get the current animation entry for a given element.
Returns the animation `id`, `null`, or `undefined`.

---

### `static animate(el, keyframes, ops?, id?, cancelOldAnim?): Animation[]`

Applies an animation to one or multiple elements.
Optionally cancels any currently running animation on the same element.

---

### `animate(keyframes, ops?, id?, cancelOldAnim?): Animation[]`

Instance method version of `animate`.

---

### `static stop(el): boolean[]`

Stops the current animation(s) on one or multiple elements.
Returns an array of booleans indicating success per element.

---

### `stop(): boolean[]`

Instance method version of `stop`.

---

## ✨ Animate FXs

### `static slideDown(el, ops?): StyleFxResult`

Show animation (`slideDown`).

### `slideDown(ops?): StyleFxResult`

Instance method version.

---

### `static slideUp(el, ops?): StyleFxResult`

Hide animation (`slideUp`).

### `slideUp(ops?): StyleFxResult`

Instance method version.

---

### `static slideToggle(el, ops?): StyleFxResult`

Toggle slide animation.
Determines visibility and plays `slideDown` or `slideUp`.

### `slideToggle(ops?): StyleFxResult`

Instance method version.

---

### `static fadeIn(el, ops?): StyleFxResult`

Fade in animation.

### `fadeIn(ops?): StyleFxResult`

Instance method version.

---

### `static fadeOut(el, ops?): StyleFxResult`

Fade out animation.

### `fadeOut(ops?): StyleFxResult`

Instance method version.

---

### `static fadeToggle(el, ops?): StyleFxResult`

Toggle fade animation.
Determines visibility and plays `fadeIn` or `fadeOut`.

### `fadeToggle(ops?): StyleFxResult`

Instance method version.

---

### `static fadeTo(el, opacity, ops?): StyleFxResult`

Animate the opacity of elements to a target value.
If the element is hidden (`display: none`), it will first be made visible before applying the fade animation.

```js
TinyHtml.fadeTo(el, 0.5, 400);     // Fade element to 50% opacity in 400ms
TinyHtml.fadeTo(el, 1, "fast");    // Fade element to full opacity using predefined speed
```

* `el`: The target element(s) to animate.
* `opacity`: The final opacity value (between `0` and `1`).
* `ops`: Optional duration, animation options, or a predefined speed name.

Returns a `StyleFxResult` mapping each element to its animation instance.

### `fadeTo(opacity, ops?): StyleFxResult`

Instance method version.

```js
element.fadeTo(0.3, { duration: 800, easing: "ease-in" });
```

---

## 🖱️ Focus & Blur

TinyHtml provides utility methods to programmatically focus or blur HTML elements.

### ✨ `TinyHtml.focus(el)` / `el.focus()`

Focuses the specified element.

```js
TinyHtml.focus(element);
// or
tinyElem.focus();
```

---

### 🌫️ `TinyHtml.blur(el)` / `el.blur()`

Removes focus from the specified element.

```js
TinyHtml.blur(element);
// or
tinyElem.blur();
```

---

### 🖊️ `TinyHtml.select(el)` / `el.select()`

Selects all the text inside the given element.

```js
TinyHtml.select(element);
// or
tinyElem.select();
```

⚠️ Throws an error if the target element is not an `<input>` or `<textarea>`.

---

## 🌐 Window Scroll & Viewport Helpers

These methods let you control and query scroll positions and viewport size with simple, readable functions.

---

### 🔽 `TinyHtml.setWinScrollTop(value)`

Scrolls the window vertically to the given pixel value.

```js
TinyHtml.setWinScrollTop(500);
```

---

### ⬅️ `TinyHtml.setWinScrollLeft(value)`

Scrolls the window horizontally to the given pixel value.

```js
TinyHtml.setWinScrollLeft(200);
```

---

### 📏 `TinyHtml.winScrollTop()`

Returns the current vertical scroll position.

```js
const y = TinyHtml.winScrollTop(); // e.g., 512
```

---

### 📐 `TinyHtml.winScrollLeft()`

Returns the current horizontal scroll position.

```js
const x = TinyHtml.winScrollLeft(); // e.g., 100
```

---

### 🪟 `TinyHtml.winInnerHeight()`

Returns the height of the visible viewport in pixels.

```js
const height = TinyHtml.winInnerHeight(); // e.g., 1080
```

---

### 🪟 `TinyHtml.winInnerWidth()`

Returns the width of the visible viewport in pixels.

```js
const width = TinyHtml.winInnerWidth(); // e.g., 2560
```

---
