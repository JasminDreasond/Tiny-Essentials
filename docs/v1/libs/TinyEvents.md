# 📦 TinyEvents

A **lightweight event emitter** class similar to Node.js's `EventEmitter`, written in modern JavaScript with no dependencies. Perfect for publish/subscribe patterns in modular apps.

---

## 🧠 What is TinyEvents?

`TinyEvents` enables your components or modules to **subscribe to**, **emit**, and **manage custom events**.

It supports:

* 🔁 Persistent listeners (`on`, `append`, `prepend`)
* 🔂 One-time listeners (`once`, `appendOnce`, `prependOnce`)
* 📤 Emitting events (`emit`)
* 🔍 Inspecting listeners (`listenerCount`, `listeners`, `onceListeners`, `allListeners`, `eventNames`)
* 🧹 Removing listeners (`off`, `offAll`, `offAllTypes`)
* 🚦 Controlling listener count (`setMaxListeners`, `getMaxListeners`)

---

## 🔧 API Reference

### `on(event: string, handler: function): void`

Adds a listener for the specified event.

```js
emitter.on('hello', (name) => console.log(`Hi, ${name}`));
```

---

### `once(event: string, handler: function): function`

Adds a one-time listener that is automatically removed after it runs once.

```js
emitter.once('data', console.log);
```

---

### `append(event: string, handler: function): void`

Alias for `on()`.

---

### `appendOnce(event: string, handler: function): function`

Alias for `once()`.

---

### `prepend(event: string, handler: function): void`

Adds a listener to the **start** of the listener array (called before others).

---

### `prependOnce(event: string, handler: function): function`

Adds a one-time listener to the **start** of the listener array.

---

### `emit(event: string, ...payload: any[]): boolean`

Calls all listeners for an event, passing any number of arguments.

Returns `true` if any listeners were called, otherwise `false`.

```js
emitter.emit('greet', 'Yasmin', 21);
```

---

### `off(event: string, handler: function): void`

Removes a specific listener from an event.

---

### `offAll(event: string): void`

Removes **all listeners** for a specific event.

---

### `offAllTypes(): void`

Clears **all listeners** from **all events**.

---

### `listenerCount(event: string): number`

Returns how many listeners are currently registered for the event.

---

### `listeners(event: string): function[]`

Returns an array of **non-once** listener functions for an event.

---

### `onceListeners(event: string): function[]`

Returns an array of **once-only** listener functions for an event.

---

### `allListeners(event: string): function[]`

Returns all listeners, including wrapped `once()` functions.

---

### `eventNames(): string[]`

Returns an array of event names that currently have listeners.

---

### `setMaxListeners(n: number): void`

Sets the maximum allowed listeners per event. Shows a warning if exceeded.

---

### `getMaxListeners(): number`

Returns the current max listener limit (default: 10).

---

## 🧪 Example

```js
import TinyEvents from './TinyEvents.js';

const emitter = new TinyEvents();

function greet(name) {
  console.log(`👋 Hello, ${name}`);
}

emitter.on('greet', greet);
emitter.emit('greet', 'Yasmin'); // "👋 Hello, Yasmin"
emitter.off('greet', greet);
```

---

## 🛡️ Type Definitions

```ts
/**
 * A generic event listener callback function.
 * @callback handler
 * @param {...any} payload - Arguments passed when event is emitted.
 * @returns {void}
 */
```

---

## ✅ Why Use It?

* No dependencies
* Fully typed (with JSDoc)
* Inspired by Node.js EventEmitter
* Works in browser or Node
