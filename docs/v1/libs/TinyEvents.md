# ✨ `TinyEvents` — Minimal Event Emitter for JavaScript

TinyEvents is a lightweight, dependency-free event emitter class inspired by Node.js's `EventEmitter`. It allows you to manage listeners, emit custom events, and control event lifecycles with ease!

---

## 📦 Features

* 🔁 Add/remove event listeners (`on`, `off`, `offAll`, `offAllTypes`)
* 🔂 Add one-time event listeners (`once`)
* 📢 Emit events (`emit`)
* 🧠 Inspect listeners (`listenerCount`, `listeners`, `eventNames`)
* 🚫 Prevent memory leaks with listener limits (`setMaxListeners`, `getMaxListeners`)

---

## 🧠 Type Definition

```ts
/**
 * A generic event listener callback function.
 * @callback handler
 * @param {any} payload - The data passed when the event is triggered.
 * @returns {void}
 */
```

---

## 🛠️ Methods

### `on(event: string, handler: handler): void`

🔗 Adds a new event listener for the given event.

```js
events.on('dataLoaded', (data) => console.log(data));
```

---

### `once(event: string, handler: handler): void`

🔂 Adds a listener that runs **only once** and then is removed.

```js
events.once('init', () => console.log('Initialized!'));
```

---

### `off(event: string, handler: handler): void`

🧽 Removes a specific listener from an event.

```js
events.off('dataLoaded', myHandler);
```

---

### `offAll(event: string): void`

🚮 Removes **all** listeners for a specific event.

```js
events.offAll('dataLoaded');
```

---

### `offAllTypes(): void`

🧼 Removes **all** listeners from **all** events.

```js
events.offAllTypes();
```

---

### `emit(event: string, payload?: any): boolean`

📢 Triggers an event and calls all registered listeners for it.

```js
events.emit('dataLoaded', { user: 'Jasmin' });
```

---

### `listenerCount(event: string): number`

🔎 Returns the number of listeners registered for a given event.

```js
console.log(events.listenerCount('dataLoaded')); // 2
```

---

### `listeners(event: string): handler[]`

📋 Returns a copy of the array of handlers for an event.

```js
const handlers = events.listeners('dataLoaded');
```

---

### `eventNames(): string[]`

🧾 Returns all event names that currently have listeners.

```js
console.log(events.eventNames()); // ['dataLoaded', 'error']
```

---

### `setMaxListeners(n: number): void`

⚠️ Sets the maximum number of listeners before a warning is shown.

```js
events.setMaxListeners(20);
```

---

### `getMaxListeners(): number`

📐 Returns the current max listener limit.

```js
const limit = events.getMaxListeners();
```

---

## 🧪 Example Usage

```js
import TinyEvents from './TinyEvents.js';

const events = new TinyEvents();

events.on('ready', () => console.log('System is ready!'));
events.emit('ready');
```

---

## 🐾 Why Use TinyEvents?

* ✅ Tiny and dependency-free
* 🧩 Easy to drop into modular projects
* 💡 Clean and intuitive API
