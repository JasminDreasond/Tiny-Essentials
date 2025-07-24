# 🧩 TinyIframeEvents

A flexible event routing system for structured communication between a **parent window** and its **iframe** using postMessage.

This module abstracts the complexity of origin validation, window detection, and message direction. It allows **modular, bidirectional, and secure communication** across frames.

---

## ✨ Features

- 🔁 Bidirectional communication (`iframe` ⇄ `parent`)
- 🎯 Named event routes with custom payloads
- 🔐 Target window and origin validation
- 🧠 Smart context detection (no config required inside iframe)
- 🧹 Clean-up support with `.destroy()`

---

## 🚀 Usage

### In the parent:

```js
import TinyIframeEvents from './TinyIframeEvents.mjs';

const iframe = document.querySelector('iframe');

const parentEvents = new TinyIframeEvents({
  targetIframe: iframe, // Will use iframe.contentWindow
  targetOrigin: window.location.origin
});

parentEvents.emit('hello:iframe', { text: '👋 From parent!' });

parentEvents.on('reply:fromIframe', (data, event) => {
  console.log('📨 Received from iframe:', data, event);
});
```

---

### In the iframe:

```js
import TinyIframeEvents from './TinyIframeEvents.mjs';

const iframeEvents = new TinyIframeEvents();

iframeEvents.on('hello:iframe', (data, event) => {
  console.log('📥 Message from parent:', event);
});

iframeEvents.emit('reply:fromIframe', { text: '🙋‍♀️ Hi parent!' });
```

---

## 🧠 API Reference

### `new TinyIframeEvents(config?)`

Creates a new instance for communication.

#### Parameters:

| Name           | Type                 | Description                                                           |
| -------------- | -------------------- | --------------------------------------------------------------------- |
| `targetIframe` | `HTMLIFrameElement?` | The iframe element to communicate with (used in the parent only).     |
| `targetOrigin` | `string?`            | Expected origin (for security). Defaults to `window.location.origin`. |

---

### `emit(eventName, payload)`

Sends a message to the target frame.

| Param       | Type     | Description                                |
| ----------- | -------- | ------------------------------------------ |
| `eventName` | `string` | Unique identifier of the event.            |
| `payload`   | `any`    | The data to send (any serializable value). |

#### Throws:

* `TypeError` if `eventName` is not a string.

---

### `on(eventName, handler)`

Registers a listener for a specific event.

```js
iframeEvents.on('my:event', (payload, event) => {
  // event = { origin, source }
});
```

---

### `destroy()`

Removes all listeners and message event binding.
Call this when the instance is no longer needed.

```js
iframeEvents.destroy();
```

---

### `isDestroyed()`

Returns `true` if the instance has been destroyed via `.destroy()`.

```js
if (events.isDestroyed()) {
  console.warn('Event system is no longer active.');
}
```

---

## 🔒 Security Notes

* Only messages with the flag `__tinyEvent: true` are accepted.
* The source window is checked strictly (`source === targetWindow`).
* Messages are ignored unless their `direction` matches the current side (`iframe` or `parent`).

---

## 📚 Internals (for advanced users)

This class internally wraps:

* postMessage
* A minimal event router: `TinyEvents`

---

## 📄 Type Definitions

### `@callback handler`

```ts
type handler = (
  payload: any,
  event: MessageEvent<any>
) => void;
```
