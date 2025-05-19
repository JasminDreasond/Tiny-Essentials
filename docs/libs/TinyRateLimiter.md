# 🧠 `TinyRateLimiter` – A Simple Per-User Rate Limiter

The `TinyRateLimiter` is a flexible and lightweight JavaScript class designed to help you limit actions (like requests or commands) per user. You can define rules like **maximum hits**, **time windows**, and benefit from automatic memory cleanup. ✨

---

## 📦 Constructor

```js
new TinyRateLimiter(options)
```

### 🔧 Options

| Option            | Type     | Default     | Description                                    |
| ----------------- | -------- | ----------- | ---------------------------------------------- |
| `maxHits`         | `number` | `undefined` | Max number of hits per user before blocking 🚧 |
| `interval`        | `number` | `undefined` | Time window in milliseconds ⏱️                 |
| `cleanupInterval` | `number` | `60000`     | Interval to auto-clean inactive users 🧹       |
| `maxIdle`         | `number` | `300000`    | Max idle time per user before cleanup 💤       |

> ⚠️ At least one of `maxHits` or `interval` must be defined.

---

## 📋 Methods

### 🚀 `hit(userId: string): void`

Registers a hit for the given `userId`.

```js
rateLimiter.hit("user123");
```

It tracks timestamps internally and automatically cleans old entries based on `interval` and `maxHits`.

---

### ❌ `isRateLimited(userId: string): boolean`

Checks if the given `userId` is currently rate limited.

```js
if (rateLimiter.isRateLimited("user123")) {
  console.log("Too many actions! Please slow down.");
}
```

---

### 🔁 `reset(userId: string): void`

Resets all stored data for the given user.

```js
rateLimiter.reset("user123");
```

---

### 🛠️ `setData(userId: string, timestamps: number[]): void`

Sets the hit timestamps for a specific user. Useful for restoring or mocking state.

```js
rateLimiter.setData("user123", [Date.now() - 1000, Date.now()]);
```

---

### 📥 `getData(userId: string): number[]`

Returns all hit timestamps for a given user.

```js
const hits = rateLimiter.getData("user123");
console.log(hits); // [timestamp1, timestamp2, ...]
```

---

### 🧠 `getMaxHits(): number`

Returns the configured `maxHits` value, or throws if invalid.

---

### ⏳ `getInterval(): number`

Returns the configured `interval` value, or throws if invalid.

---

### 🧼 `destroy(): void`

Stops internal timers and clears all stored data. Ideal for cleanup in tests or long-running apps.

```js
rateLimiter.destroy();
```

---

## 🧽 Automatic Cleanup

Inactive users are automatically removed every `cleanupInterval` milliseconds if they haven't had any hits for longer than `maxIdle`.

This helps reduce memory usage and keeps your limiter lean and clean! 🪶

---

## 💥 Errors

The constructor will throw if:

* Neither `maxHits` nor `interval` are provided.
* Any of the values are not positive integers.

---

## 🧪 Example Usage

```js
const limiter = new TinyRateLimiter({
  maxHits: 5,
  interval: 10000,
  cleanupInterval: 60000,
  maxIdle: 120000
});

limiter.hit("user42");

if (limiter.isRateLimited("user42")) {
  console.log("Rate limited! 🛑");
} else {
  console.log("Action allowed ✅");
}
```

---

## 🌈 Summary

| Feature              | Support |
| -------------------- | ------- |
| Per-user tracking    | ✅       |
| Max hits             | ✅       |
| Time window interval | ✅       |
| Automatic cleanup    | ✅       |
| Manual data control  | ✅       |
| Lightweight + fast   | ✅       |

---

Made with 💜 to protect your app from spammers and abusers — in a cute and efficient way! 😄
