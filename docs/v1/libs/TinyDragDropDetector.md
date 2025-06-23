# TinyDragDropDetector

A lightweight JavaScript utility for detecting drag-and-drop file operations on a specific DOM element or the entire page. It manages the full drag lifecycle (`enter`, `over`, `leave`, `drop`) and provides hooks for handling UI changes or file uploads.

---

## 📦 Features

* Simple and lightweight.
* Full drag event lifecycle handling.
* CSS hover class management.
* Works on any DOM element or the entire page.
* Fully typed with JSDoc.
* Safe with robust error handling.

---

## 🔧 Usage Example

```javascript
import TinyDragDropDetector from './TinyDragDropDetector.js';

const dnd = new TinyDragDropDetector({
  fullscreen: false,
  target: document.getElementById('drop-area'),
  hoverClass: 'hover-effect',
  onDrop: (files, event) => {
    console.log('Files dropped:', files);
  },
  onEnter: (event) => {
    console.log('Drag entered');
  },
  onLeave: (event) => {
    console.log('Drag left');
  },
});

// Destroy when not needed
// dnd.destroy();
```

---

## 🔗 API Reference

### Class: `TinyDragDropDetector`

A drag-and-drop detector instance.

### Constructor

```javascript
new TinyDragDropDetector(options)
```

#### Parameters:

| Name      | Type                                        | Default | Description           |
| --------- | ------------------------------------------- | ------- | --------------------- |
| `options` | [`DragAndDropOptions`](#draganddropoptions) | `{}`    | Configuration object. |

#### Throws:

* `TypeError` if `target` is not an `HTMLElement`.
* `TypeError` if `fullscreen` is not a boolean.
* `TypeError` if `hoverClass` is not a string.
* `TypeError` if `onDrop` is not a function.
* `TypeError` if `onEnter` is defined but not a function.
* `TypeError` if `onLeave` is defined but not a function.

---

### Instance Methods

| Method            | Returns       | Description                                                              |
| ----------------- | ------------- | ------------------------------------------------------------------------ |
| `getTarget()`     | `HTMLElement` | Returns the DOM element where listeners are attached.                    |
| `getHoverClass()` | `string`      | Returns the CSS class applied during drag hover.                         |
| `isFullScreen()`  | `boolean`     | Indicates whether the detector is in fullscreen mode (`document.body`).  |
| `isDragging()`    | `boolean`     | Returns whether a drag operation is currently active over the target.    |
| `bound()`         | `boolean`     | Returns whether the event listeners are currently bound to the target.   |
| `destroy()`       | `void`        | Destroys the detector, unbinding all events and cleaning up CSS classes. |

---

## 🏗️ Event Callbacks

| Event     | Signature                                     | Description                                 |
| --------- | --------------------------------------------- | ------------------------------------------- |
| `onDrop`  | `(files: FileList, event: DragEvent) => void` | Fired when files are dropped. **Required**. |
| `onEnter` | `(event: DragEvent) => void`                  | Fired when dragging enters the target.      |
| `onLeave` | `(event: DragEvent) => void`                  | Fired when dragging leaves the target.      |

---

## 🛠️ DragAndDropOptions

```javascript
/**
 * @typedef {Object} DragAndDropOptions
 * @property {HTMLElement} [target=document.body] - The DOM element where drag listeners will be attached. Defaults to `document.body` if `fullscreen` is true or no target is provided.
 * @property {boolean} [fullscreen=true] - If true, listeners are attached to the entire page (`document.body`). If false, the `target` must be specified.
 * @property {string} [hoverClass="dnd-hover"] - CSS class applied to the target element while files are being dragged over it.
 * @property {(files: FileList, event: DragEvent) => void} onDrop - Callback function executed when files are dropped onto the target.
 * @property {(event: DragEvent) => void} [onEnter] - Optional callback triggered when dragging enters the target area.
 * @property {(event: DragEvent) => void} [onLeave] - Optional callback triggered when dragging leaves the target area.
 */
```

---

## ⚠️ Warnings

* If `dataTransfer` is missing in a `dragover` or `drop` event, a console warning will be shown:

  * `[TinyDragDropDetector] [handleDragOver] DragOver event missing dataTransfer.`
  * `[TinyDragDropDetector] [handleDrop] Drop event missing dataTransfer.`

This is a safe check to prevent runtime errors in malformed events.

---

## 🗑️ Cleanup

Call `destroy()` when the detector is no longer needed to prevent memory leaks:

```javascript
dnd.destroy();
```

This unbinds all event listeners and removes the hover class if applied.

---

## 🎨 CSS Example

```css
/* Example hover effect */
.hover-effect {
  outline: 3px dashed #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}
```
