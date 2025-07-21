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

### `TinyHtml.createElementFromHTML(htmlString)`

Creates an `HTMLElement` or `TextNode` from an HTML string.
Supports both elements and plain text.

* **Parameters**:

  * `htmlString` *(string)* — The HTML string to convert.

* **Returns**: `TinyHtml` — A `TinyHtml` instance wrapping the resulting `HTMLElement` or `TextNode`.

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

- **Returns**: `TinyHtml[]`

---

### `TinyHtml.getById(selector)`
Selects an element by ID.

- **Parameters**:
  - `selector` *(string)* — Id selector
- **Returns**: `TinyHtml` or `null`

---

### `TinyHtml.getByClassName(selector)`
Finds elements by class name.

- **Returns**: `TinyHtml[]`

---

### `TinyHtml.getByName(selector)`
Finds elements by `name` attribute.

- **Returns**: `TinyHtml[]`

---

### `TinyHtml.getByTagNameNS(localName, namespaceURI?)`
Finds elements by tag name in a namespace (defaults to XHTML).

- **Returns**: `TinyHtml[]`

---

## 🧩 Internal Element Access

### `get()`
Returns the raw DOM element associated with this instance.

- **Returns**: `ConstructorElValues`

---

### `_getElement(where)`
Safely returns the element with error checking.

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

---

### 📌 Instance Methods

#### `.data(key?, isPrivate?)`

Shortcut for getting data from the current instance’s element.

#### `.setData(key, value, isPrivate?)`

Shortcut for setting data on the current element.

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

#### `.animate(keyframes, ops?)` / `TinyHtml.animate(el, keyframes, ops?)`
Applies an animation to one or more TinyElement instances using the Web Animations API.

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
element.removeAttr("data-test");       // Remove
element.hasAttr("id");                 // Check
```

Works on both single and multiple elements (static or instance).
Safe and type-checked — throws if misuse is detected.

---

### 🧲 `.hasProp()` / `.addProp()` / `.removeProp()` / `.toggleProp()`

Properties

```js
element.hasProp("disabled");         // true/false
element.addProp("checked");          // set true
element.removeProp("checked");       // set false
element.toggleProp("disabled");      // flip
element.toggleProp("readonly", true); // force enable
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
