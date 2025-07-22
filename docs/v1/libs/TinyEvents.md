# 🧩 `TinyEvents` — Minimal Event Emitter for JavaScript

TinyEvents is a lightweight, dependency-free event emitter class inspired by Node.js's `EventEmitter`. It allows you to manage listeners, emit custom events, and control event lifecycles with ease!

---

## ✨ Features

* 🔄 Add/remove event listeners (`on`, `off`, `offAll`, `offAllTypes`)
* 🎯 One-time listeners (`once`)
* 🚀 Emit events (`emit`)
* 🔍 Inspect listeners (`listenerCount`, `listeners`, `onceListeners`, `allListeners`)
* ⚙️ Limit listener counts (`setMaxListeners`, `getMaxListeners`)

---

## 🧠 Type Definitions

```js
/**
 * A generic event listener callback function.
 * 
 * @callback handler
 * @param {any} payload - The data payload passed when the event is triggered.
 * @returns {void}
 */
```

---

## 📚 API

### `on(event: string, handler: handler): void`

Registers a persistent event listener.

### `once(event: string, handler: handler): handler`

Registers a one-time event listener. The listener will automatically be removed after its first call.

### `off(event: string, handler: handler): void`

Removes a specific listener from an event.

### `offAll(event: string): void`

Removes **all listeners** from a specific event.

### `offAllTypes(): void`

Removes **all listeners** from **all events**.

---

### `emit(event: string, ...payload: any[]): boolean`

Emits an event with optional data.
Returns `true` if any listener was called, otherwise `false`.

---

### `listenerCount(event: string): number`

Returns the number of active listeners for a given event.

---

### `listeners(event: string): handler[]`

Returns all **persistent** (non-once) listeners for the event.

### `onceListeners(event: string): handler[]`

Returns all **one-time** listeners for the event.

### `allListeners(event: string): handler[]`

Returns **all** listeners (both persistent and once-wrapped) for the event.

---

### `eventNames(): string[]`

Returns a list of all event names that have registered listeners.

---

### `setMaxListeners(n: number): void`

Sets the **maximum number** of listeners allowed per event before a warning is shown.

### `getMaxListeners(): number`

Returns the current max listener count per event.

---

## ⚠️ Listener Limit Warning

If you register more listeners than allowed (`default: 10`), a warning is printed to avoid memory leaks:

```txt
Possible memory leak detected. 11 "myEvent" listeners added.
Use setMaxListeners() to increase limit.
```

---

## 💡 Example

```js
import TinyEvents from './TinyEvents.js';

const events = new TinyEvents();

events.on('hello', (name) => {
  console.log(`Hello, ${name}!`);
});

events.emit('hello', 'Yasmin'); // => Hello, Yasmin!
```

---

## 🧪 Testing One-Time Events

```js
const onceHandler = (data) => console.log('Ran only once:', data);

events.once('runOnce', onceHandler);
events.emit('runOnce', 123); // ✅ Runs
events.emit('runOnce', 456); // ❌ Doesn't run
```

---

## 📦 Use Case Ideas

* Component communication in front-end apps
* Internal systems messaging
* Event delegation wrappers
* Data update propagation
* UI or animation triggers
