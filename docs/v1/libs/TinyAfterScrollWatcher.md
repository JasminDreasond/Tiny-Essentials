# 📜 TinyAfterScrollWatcher

A minimalistic scroll watcher that queues and executes functions **after scrolling has stopped** on a given element or the window.
Perfect for optimizing logic that should only run **after** the user has finished scrolling.

---

## 🚀 Features

* ✅ Works on any scrollable element or the window
* ⏱️ Customizable "inactivity timeout" (default: `100ms`)
* 🧠 Executes queued callbacks after scroll ends
* 🧷 Add/remove scroll listeners easily (`onScroll` / `offScroll`)
* 🛑 Execute logic right before after-scroll queue (`onStop`)
* 🧹 Cleanly destroy the instance when no longer needed

---

## 📦 Import

```js
import TinyAfterScrollWatcher from './TinyAfterScrollWatcher.mjs';
```

---

## 🧪 Example

```js
const watcher = new TinyAfterScrollWatcher(window);

// Optional: set a custom delay (in ms)
watcher.inactivityTime = 300;

// Add a function to run after scroll has stopped
watcher.doAfterScroll(() => {
  console.log('Scroll has stopped for 300ms!');
});

// Add a function to run immediately when scroll stops
watcher.onStop(() => {
  console.log('User just stopped scrolling!');
});

// Add a custom scroll listener
const myScrollHandler = () => console.log('Scrolling...');
watcher.onScroll(myScrollHandler);

// Remove it later
watcher.offScroll(myScrollHandler);

// Also remove onStop listener
watcher.offStop(myStopFunction);

// Fully destroy the watcher
watcher.destroy();
```

---

## 🧠 Class: `TinyAfterScrollWatcher`

### 🔧 Constructor

```ts
new TinyAfterScrollWatcher(scrollTarget?: Element | Window, inactivityTime?: number)
```

#### Parameters:

| Name             | Type                | Default  | Description                                                            |
| ---------------- | ------------------- | -------- | ---------------------------------------------------------------------- |
| `scrollTarget`   | `Element \| Window` | `window` | The scrollable element to watch. Can also be the global `window`.      |
| `inactivityTime` | `number`            | `100`    | Milliseconds to wait after the last scroll before executing the queue. |

---

### ⏲️ Property: `inactivityTime`

* **Type:** `number`
* **Getter/Setter**

Defines how many milliseconds to wait after scroll stops before executing the queue.

#### Example:

```js
watcher.inactivityTime = 500;
console.log(watcher.inactivityTime); // 500
```

#### Throws:

* `TypeError` if the value is not a finite positive number.

---

### 🧩 Method: `doAfterScroll(fn)`

Adds a function to the queue that runs once scroll has stopped for the configured delay.

```ts
doAfterScroll(fn: FnData): void
```

#### Parameters:

| Name | Type     | Description                          |
| ---- | -------- | ------------------------------------ |
| `fn` | `FnData` | Function to run after scrolling ends |

#### Throws:

* `TypeError` if the argument is not a function.

---

### 🛑 Method: `onStop(fn)`

Registers a function to be called **immediately after scrolling stops**, but **before** the `doAfterScroll` queue is executed.

```ts
onStop(fn: FnData): void
```

#### Parameters:

| Name | Type     | Description                                     |
| ---- | -------- | ----------------------------------------------- |
| `fn` | `FnData` | Function to call as soon as scroll has stopped. |

#### Throws:

* `TypeError` if the argument is not a function.

---

### 🔁 Method: `offStop(fn)`

Removes a function previously registered with `onStop`.

```ts
offStop(fn: FnData): void
```

#### Parameters:

| Name | Type     | Description                        |
| ---- | -------- | ---------------------------------- |
| `fn` | `FnData` | Function to remove from onStop set |

#### Throws:

* `TypeError` if the argument is not a function.

---

### 🧷 Method: `onScroll(fn)`

Registers a custom scroll listener on the tracked element.

```ts
onScroll(fn: OnScrollFunc): void
```

#### Parameters:

| Name | Type           | Description                             |
| ---- | -------------- | --------------------------------------- |
| `fn` | `OnScrollFunc` | The listener function for scroll events |

#### Throws:

* `TypeError` if the argument is not a function.

---

### 🗑️ Method: `offScroll(fn)`

Removes a previously registered scroll listener.

```ts
offScroll(fn: OnScrollFunc): void
```

#### Parameters:

| Name | Type           | Description                   |
| ---- | -------------- | ----------------------------- |
| `fn` | `OnScrollFunc` | The scroll listener to remove |

#### Throws:

* `TypeError` if the argument is not a function.

---

### 💣 Method: `destroy()`

Cleans up all internal and external listeners.
Once destroyed, the instance stops functioning and cannot be reused.

```ts
destroy(): void
```

---

## 🧾 Typedefs

```ts
/**
 * A function with no parameters and no return value.
 */
type FnData = () => void;

/**
 * A function that handles a scroll event.
 * It receives a standard `Event` object when a scroll occurs.
 */
type OnScrollFunc = (ev: Event) => void;
```

---

## 📝 Notes

* `onStop` functions are called **before** the `doAfterScroll` queue.
* The `doAfterScroll` queue runs in **LIFO** order (last-in, first-out).
* `requestAnimationFrame` is used for efficient polling.
* Lower `inactivityTime` makes scroll-stop detection more responsive.
