# 📚 TinyHtml Class

`TinyHtml` is a lightweight utility class that provides DOM element manipulation and querying utilities, inspired by jQuery — but with modern native browser APIs.

It supports both static and instance-level operations, making it easy to work with elements' dimensions, collisions, and more in a readable, performant way.

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

### 🔀 Union Types

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
Window | Element | Document
```

---

### 🎯 Event System Types

#### `EventRegistryHandle`

A basic event listener handler function.

```ts
(e: Event) => any
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
  handler: EventRegistryHandle,
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

### `TinyHtml.query(selector)`
Finds the first element by CSS selector.

- **Parameters**:
  - `selector` *(string)* — CSS selector
- **Returns**: `TinyHtml`
- **Throws**: If no element is found.

---

### `TinyHtml.queryAll(selector)`
Finds all elements by CSS selector.

- **Returns**: `TinyHtml[]`

---

### `TinyHtml.getById(selector)`
Selects an element by ID.

- **Throws**: If no element is found.

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
| `_preNodeElemWithNull(...)`   | `Node|null`      | `Node|null`    |
| `_preHtmlElems(...)`          | `HTMLElement[]`  | `HTMLElement[]`|
| `_preHtmlElem(...)`           | `HTMLElement`    | `HTMLElement`  |
| `_preInputElems(...)`         | `InputElement[]` | `InputElement[]` |
| `_preInputElem(...)`          | `InputElement`   | `InputElement` |
| `_preEventTargetElems(...)`   | `EventTarget[]`  | `EventTarget[]`|
| `_preEventTargetElem(...)`    | `EventTarget`    | `EventTarget`  |
| `_preElemsAndWindow(...)`     | `Element|Window` | `ElementAndWindow[]` |
| `_preElemAndWindow(...)`      | `Element|Window` | `ElementAndWindow` |

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

### 🔍 `.html()` / `TinyHtml.html(el)`

Gets the `innerHTML` string of the element.

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
