# ⏰ clock.mjs

A versatile time utility module for JavaScript that helps you calculate and format time durations with style. Whether you're building countdowns, timers, or just need a nice "HH:MM:SS" string, this module has your back!

## ✨ Features

- 🔢 Calculate time differences in various units
- 🧭 Format durations into clean, readable timer strings
- 🧱 Support for years, months, days, hours, minutes, and seconds
- 🎛️ Customizable output with template-based formatting
- 🛠️ Built-in presets for classic timer formats
- 🪶 Zero dependencies, lightweight and modular (ESM-ready!)

---

## 🧠 API Overview

### 🔹 `getTimeDuration(timeData, durationType = 'asSeconds', now = null)`

Calculates how much time remains (or has passed) between now and a given time.

| Param         | Type     | Description                                                                 |
|---------------|----------|-----------------------------------------------------------------------------|
| `timeData`    | `Date`   | The target time                                                             |
| `durationType`| `string` | Format to return (`asMilliseconds`, `asSeconds`, `asMinutes`, etc.)         |
| `now`         | `Date`   | Optional custom "now". Defaults to current time.                            |

**Returns:** `number|null` — The duration in the chosen unit.

---

### 🔹 `formatCustomTimer(totalSeconds, level = 'seconds', format = '{time}')`

Turns seconds into a custom timer string with fine-grained control.

| Param       | Type     | Description                                                                                  |
|-------------|----------|----------------------------------------------------------------------------------------------|
| `totalSeconds` | `number` | The duration to format (in seconds)                                                         |
| `level`     | `string` | Highest level to show: `'seconds'`, `'minutes'`, `'hours'`, `'days'`, `'months'`, `'years'` |
| `format`    | `string` | Output string template. Supports placeholders like `{days}`, `{hours}`, `{time}`, `{total}` |

**Returns:** `string` — A formatted string with padded units.

---

### 🔹 `formatTimer(seconds)`

Formats a duration into the classic `HH:MM:SS`.

```js
formatTimer(3670); // "01:01:10"
```

---

### 🔹 `formatDayTimer(seconds)`

Formats a duration into `Xd HH:MM:SS`, perfect for countdowns.

```js
formatDayTimer(190000); // "2d 04:46:40"
```

---

## 🧪 Examples

```js
const futureTime = new Date(Date.now() + 10000);
const secondsLeft = getTimeDuration(futureTime, 'asSeconds');

console.log(formatTimer(secondsLeft)); // e.g. "00:00:09"
console.log(formatDayTimer(172800 + 3661)); // "2d 01:01:01"

const custom = formatCustomTimer(3600 * 26 + 61, 'days', '{days}d {hours}h {minutes}m {seconds}s');
console.log(custom); // "1d 2h 1m 1s"
```
