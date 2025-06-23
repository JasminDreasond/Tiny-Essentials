# 📺 Fullscreen Utility API

A lightweight JavaScript utility to manage fullscreen behavior easily with cross-browser support! 🚀

---

## 🧠 Features

* ✅ Check if fullscreen is active
* ✅ Check if the screen is completely filled
* ✅ Enter fullscreen mode (with legacy browser support)
* ✅ Exit fullscreen mode (with legacy browser support)
* ✅ Listen to fullscreen change events
* ✅ Remove fullscreen change listeners

---

## 🚀 Functions

---

### 🔍 `documentIsFullScreen()`

Checks if the **document** is currently in fullscreen mode.

```js
documentIsFullScreen();
```

#### ✅ Returns

* `boolean` → `true` if the document is in fullscreen, `false` otherwise.

---

### 🔍 `isScreenFilled()`

Checks if the **window is filling the entire screen**, based on window dimensions.

```js
isScreenFilled();
```

#### ✅ Returns

* `boolean` → `true` if the window occupies the full screen (matching `screen.width` and `screen.height`), otherwise `false`.

---

### 🔍 `isFullScreenMode()`

Checks whether fullscreen mode is active **by API** (`documentIsFullScreen`) **or by matching window dimensions** (`isScreenFilled`).

```js
isFullScreenMode();
```

#### ✅ Returns

* `boolean` → `true` if fullscreen mode is detected by either method.

---

### 🖥️ `requestFullScreen(ops?)`

Requests fullscreen mode for the entire document.

```js
await requestFullScreen();
```

#### 🔧 Parameters

| Name | Type                 | Description        |
| ---- | -------------------- | ------------------ |
| ops  | `FullscreenOptions?` | Optional settings. |

#### ✅ Returns

* `Promise<void>` → Resolves when fullscreen mode is successfully entered.

#### ⚠️ Notes

* Fully supports modern and legacy browsers (`moz`, `webkit`, `ms` prefixes).

---

### 🖥️ `exitFullScreen()`

Exits fullscreen mode.

```js
await exitFullScreen();
```

#### ✅ Returns

* `Promise<void>` → Resolves when fullscreen mode is successfully exited.

#### ⚠️ Notes

* Fully supports modern and legacy browsers (`moz`, `webkit`, `ms` prefixes).

---

### 🔔 `onFullScreenChange(listener, ops?)`

Attaches a listener for fullscreen change events.

```js
onFullScreenChange((event) => {
  console.log('Fullscreen changed!', event);
});
```

#### 🔧 Parameters

| Name     | Type                                        | Description        |
| -------- | ------------------------------------------- | ------------------ |
| listener | `EventListenerOrEventListenerObject`        | Callback function. |
| ops      | `boolean \| AddEventListenerOptions` (opt.) | Optional options.  |

#### ✅ Returns

* `void`

---

### 🔕 `offFullScreenChange(listener, ops?)`

Removes a listener from fullscreen change events.

```js
offFullScreenChange(myListener);
```

#### 🔧 Parameters

| Name     | Type                                        | Description        |
| -------- | ------------------------------------------- | ------------------ |
| listener | `EventListenerOrEventListenerObject`        | Callback function. |
| ops      | `boolean \| AddEventListenerOptions` (opt.) | Optional options.  |

#### ✅ Returns

* `void`

---

## 📜 Fullscreen Events Supported

The following events are internally used for compatibility:

* `'fullscreenchange'`
* `'webkitfullscreenchange'`
* `'mozfullscreenchange'`
* `'MSFullscreenChange'`

---

## 💡 Example Usage

```js
import {
  requestFullScreen,
  exitFullScreen,
  isFullScreenMode,
  onFullScreenChange,
  offFullScreenChange,
} from './fullScreen';

async function toggleFullscreen() {
  if (isFullScreenMode()) {
    await exitFullScreen();
  } else {
    await requestFullScreen();
  }
}

onFullScreenChange(() => {
  console.log('Fullscreen mode changed!');
});
```
