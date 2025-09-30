# 📦 Package Exports Map

This package provides multiple entry points depending on what you need.
You can `import` (ESM) or `require` (CommonJS) each module individually.

---

## 🎨 CSS Assets

These are pre-built stylesheets that can be directly imported:

* `css/aiMarker.min.css` → `dist/v1/css/aiMarker.min.css`
* `css/TinyCookieConsent.min.css` → `dist/v1/css/TinyCookieConsent.min.css`
* `css/TinyDraggerExample.min.css` → `dist/v1/css/TinyDraggerExample.min.css`
* `css/TinyNotify.min.css` → `dist/v1/css/TinyNotify.min.css`
* `css/TinyLoadingScreen.min.css` → `dist/v1/css/TinyLoadingScreen.min.css`

✅ Usage example:

```js
import "tiny-essentials/css/TinyNotify.min.css";
```

---

## 🏠 Root Entrypoints

* `.` → main entry

  * `"require"` → `dist/v1/index.cjs`
  * `"import"` → `dist/v1/index.mjs`

* `libs` → all library helpers

  * `"require"` → `dist/v1/libs/index.cjs`
  * `"import"` → `dist/v1/libs/index.mjs`

* `basics` → general utility functions

  * `"require"` → `dist/v1/basics/index.cjs`
  * `"import"` → `dist/v1/basics/index.mjs`

* `fileManager` → file utilities

  * `"require"` → `dist/v1/fileManager/index.cjs`
  * `"import"` → `dist/v1/fileManager/index.mjs`

---

## 🔧 Basics Modules

Direct access to smaller utilities:

* `basics/array`
* `basics/clock`
* `basics/collision`
* `basics/fullScreen`
* `basics/html`
* `basics/objChecker`
* `basics/objFilter`
* `basics/simpleMath`
* `basics/text`

---

## 📚 Libs Modules

Each library can be imported separately:

* **General Tools** 🛠

  * `libs/ColorSafeStringify`
  * `libs/UltraRandomMsgGen`
  * `libs/TinyUploadClicker`
  * `libs/TinyToastNotify`
  * `libs/TinyTimeout`
  * `libs/TinyTextRangeEditor`
  * `libs/TinyTextarea`
  * `libs/TinySmartScroller`
  * `libs/TinySimpleDice`
  * `libs/TinyRateLimiter`
  * `libs/TinyPromiseQueue`
  * `libs/TinyNotifyCenter`
  * `libs/TinyNotifications`
  * `libs/TinyNewWinEvents`
  * `libs/TinyNeedBar`
  * `libs/TinyLocalStorage`
  * `libs/TinyLoadingScreen`
  * `libs/TinyColorValidator`
  * `libs/TinyInventoryTrader`
  * `libs/TinyInventory`
  * `libs/TinyIframeEvents`
  * `libs/TinyI18`
  * `libs/TinyLevelUp`
  * `libs/TinyGamepad`
  * `libs/TinyEvents`
  * `libs/TinyElementObserver`
  * `libs/TinyDragger`
  * `libs/TinyDragDropDetector`
  * `libs/TinyDomReadyManager`
  * `libs/TinyDayNightCycle`
  * `libs/TinyCookieConsent`
  * `libs/TinyColorConverter`
  * `libs/TinyClipboard`
  * `libs/TinyArrayPaginator`
  * `libs/TinyAfterScrollWatcher`
  * `libs/TinyAdvancedRaffle`

* **HTML Helpers** 🧩

  * `libs/TinyHtml`
  * `libs/TinyHtmlElems`

---

## ✅ Import Examples

**ESM (modern projects)**

```js
import { TinyTextarea } from "tiny-essentials/libs/TinyTextarea";
```

**CommonJS (Node.js)**

```js
const { TinyTextarea } = require("tiny-essentials/libs/TinyTextarea");
```
