# 🪟 TinyNewWinEvents

Structured and reliable `postMessage`-based communication between a **main window** and a **popup window** (created using `window.open`).
Ideal for secure, bidirectional messaging with route-based logic.

---

## ✨ Features

* 🔁 Bidirectional communication (`main window` ⇄ `popup`)
* 📬 Named message routes with flexible payloads
* 🕓 Queues messages before handshake is ready
* 🧠 Connection and lifecycle status tracking
* 🔒 Origin and window reference validation
* 🧹 Full cleanup support with `.destroy()`

---

## 🚀 Usage

### In the main window:

```js
import TinyNewWinEvents from './TinyNewWinEvents.mjs';

const events = new TinyNewWinEvents({
  url: '/popup.html',
  name: 'MyPopupWindow',
  features: 'width=400,height=400',
  targetOrigin: window.location.origin
});

events.on('user:reply', (payload) => {
  console.log('📩 From popup:', payload);
});

events.emit('init:data', { id: 123 });
```

---

### In the popup window:

```js
import TinyNewWinEvents from './TinyNewWinEvents.mjs';

const events = new TinyNewWinEvents();

events.on('init:data', (payload) => {
  console.log('📦 Init payload from main window:', payload);
});

events.emit('user:reply', { msg: '👋 Hello from popup!' });
```

---

## 🧠 API Reference

### `new TinyNewWinEvents(config?)`

Creates a new communication instance.

#### Parameters:

| Name           | Type                     | Description                                        |
| -------------- | ------------------------ | -------------------------------------------------- |
| `url`          | `string?`                | URL to open in popup.                              |
| `name`         | `string?`                | Name of the popup window .                         |
| `features`     | `string?`                | `window.open` features string.                     |
| `targetOrigin` | `string?`                | Expected origin (defaults to current origin)       |

❗ `name: '_blank'` is **not allowed** for popup tracking.

---

### `emit(route, payload)`

Sends a message on a specific route.

| Param     | Type     | Description                     |
| --------- | -------- | ------------------------------- |
| `route`   | `string` | Event route name                |
| `payload` | `any`    | Data to send (any serializable) |

📝 If the handshake hasn't completed yet, the message is **queued**.

---

### `on(route, handler)`

Registers a callback for a specific route.

```js
events.on('data:sync', (payload, event) => {
  console.log(payload, event.origin);
});
```

---

### `off(route, handler)`

Removes a previously registered route listener.

---

### `onClose(callback)`

Runs when the **popup window** is closed.

---

### `offClose(callback)`

Removes a previously registered close callback.

---

### `close()`

Closes the popup window (can only be called from the host).

---

### `getWin()`

Returns the current window reference (host or popup).

---

### `isConnected()`

Returns `true` if both:

* Handshake is complete
* Window is still open

---

### `isDestroyed()`

Returns `true` if the instance has been destroyed.

---

### `destroy()`

Destroys the instance, cleans up all resources:

* Stops polling
* Removes all listeners
* Clears queue

---

## 📦 Internals (for advanced use)

| Concept         | Purpose                                     |
| --------------- | ------------------------------------------- |
| `postMessage`   | Core transport for messaging                |
| `TinyEvents`    | Internal event emitter and listener manager |
| `__TNE_READY__` | Handshake trigger message type              |
| `__TNE_ROUTE__` | Route-based message delivery type           |

---

## 📄 Type Definitions

### `@callback handler`

```ts
type handler = (
  payload: any,
  event: MessageEvent<any>
) => void;
```

---

## 🛡️ Safety and Validation

* 💥 Throws if `emit()` is called after `.destroy()`
* 💣 Throws if the popup was opened with `_blank` name
* ✅ Only communicates with expected `targetOrigin`
* 🧼 Automatically detects closed windows and emits `WINDOW_REF_CLOSED`
