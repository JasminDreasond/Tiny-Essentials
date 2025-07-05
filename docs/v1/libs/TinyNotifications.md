# 📣 TinyNotifications

> A utility class to manage browser notifications with sound, custom icons, text truncation, and click behavior.

---

## 🚀 Features

* ✅ Request and manage user permission for notifications
* 🔔 Play a sound when a notification is shown
* 🖼️ Support for default avatar/icon
* ✂️ Automatic body text truncation
* 💥 Strong validation with `TypeError` and runtime checks
* ❗ Prevents use of `send()` before permission request

---

## 🏗️ Constructor

```js
new TinyNotifications(options?)
```

### Parameters

| Name             | Type                                      | Default | Description                                        |
| ---------------- | ----------------------------------------- | ------- | -------------------------------------------------- |
| `audio`          | `string` \| `HTMLAudioElement` \| `null`  | `null`  | Sound to be played with the notification           |
| `defaultIcon`    | `string` \| `null`                        | `null`  | Default icon to use in notifications               |
| `bodyLimit`      | `number`                                  | `100`   | Maximum number of characters in body text          |
| `defaultOnClick` | `(this: Notification, evt: Event) => any` | `fn`    | Function executed when the notification is clicked |

### Throws

* `TypeError` if any parameter is of invalid type.

---

## 🧠 Methods

### 🔐 `requestPerm()`

```js
requestPerm(): Promise<boolean>
```

Requests permission from the browser to send notifications.

* Sets internal `#allowed` and `#permissionRequested` flags.
* Must be called before using `send()`.

**Returns:** `Promise<boolean>` — `true` if permission was granted.

---

### ⚙️ `isCompatible()`

```js
isCompatible(): boolean
```

Checks if the current browser supports the Notification API.

**Returns:** `true` or `false`

---

### 📤 `send(title, config?)`

```js
send(title: string, config?: NotificationOptions): Notification | null
```

Sends a notification to the user with optional configuration.
Truncates long body texts and plays a sound if set.

#### Parameters

* `title`: *(string)* — Title of the notification
* `config`: *(object)* — Optional notification settings (`body`, `icon`, `vibrate`, etc.)

#### Throws

* `Error` if `requestPerm()` was never called
* `TypeError` if `title` is not a string or `config` is not an object

#### Returns

* `Notification` instance if allowed
* `null` if permission was denied

---

## 📥 Getters & Setters

### 📌 `wasPermissionRequested()`

```js
wasPermissionRequested(): boolean
```

Checks if `requestPerm()` was called.

---

### 🟢 `isAllowed()`

```js
isAllowed(): boolean
```

Checks if permission has been granted.

---

### 🔊 `getAudio()` / `setAudio(value)`

```js
getAudio(): HTMLAudioElement | null
setAudio(value: HTMLAudioElement | string | null)
```

Set or retrieve the notification sound.
**Throws:** `TypeError` if invalid type is used.

---

### 📏 `getBodyLimit()` / `setBodyLimit(value)`

```js
getBodyLimit(): number
setBodyLimit(value: number)
```

Set or retrieve the maximum number of characters in the notification body.
**Throws:** `TypeError` if value is not a non-negative number.

---

### 🖼️ `getDefaultAvatar()` / `setDefaultAvatar(value)`

```js
getDefaultAvatar(): string | null
setDefaultAvatar(value: string | null)
```

Get or set the default icon for notifications.
**Throws:** `TypeError` if value is not a string or `null`.

---

### 🖱️ `getDefaultOnClick()` / `setDefaultOnClick(value)`

```js
getDefaultOnClick(): (this: Notification, evt: Event) => any
setDefaultOnClick(value: function)
```

Set or retrieve the default click handler for all notifications.
**Throws:** `TypeError` if value is not a function.

---

## 📦 Example

```js
import TinyNotifications from './TinyNotifications.js';

const notify = new TinyNotifications({
  audio: '/sounds/ping.mp3',
  defaultIcon: '/img/icon.png',
  bodyLimit: 80
});

await notify.requestPerm();

notify.send('Hello World!', {
  body: 'This message will be truncated if too long.',
  vibrate: [100, 50, 100]
});
```

---

## 🧪 Safety Notes

* Always call `requestPerm()` **before** using `send()`
* Invalid or unsafe inputs throw strong errors
* Compatible with all modern browsers that support `Notification` API
