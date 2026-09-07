# 🚀 TinyThrottledApi Documentation

`TinyThrottledApi` is a professional-grade utility designed to manage asynchronous operations. It acts as a "gatekeeper" for your API calls, ensuring you do not overwhelm a server by sending too many requests at once (**Concurrency Control**) and helping you stay within rate limits (**Rate Throttling**).

## 📋 Table of Contents
1. [Core Concepts](#core-concepts)
2. [Getting Started](#getting-started)
3. [API Reference](#api-reference)
4. [Practical Examples](#practical-examples)
5. [Monitoring & Debugging](#monitoring--debugging)

---

## 🧠 Core Concepts

To use this library effectively, you must understand the two problems it solves:

### 1. Concurrency Control 🚦
If you try to fetch 1,000 items from a database simultaneously, your application might crash or the server might block your IP. 
**The Solution:** `TinyThrottledApi` limits the number of active requests. If the limit is 5, and you request 10, only 5 will run immediately; the other 5 will wait in a queue until a slot opens up.

### 2. Rate Throttling ⏱️
Even if you only run 5 requests at a time, sending them too quickly in "bursts" can trigger security filters.
**The Solution:** By integrating `TinyTimeout`, the API can introduce a dynamic delay between requests. This spreads the load over a longer period, making your traffic pattern look more natural and less aggressive.

---

## 🚀 Getting Started

### Installation Context
This module expects the following dependencies to be present in your project structure:
* `tiny-essentials/libs/utils/TinyPromiseQueue` (For managing the waiting list).
* `tiny-essentials/basics/promiseUtils` (Specifically the `waitForTrue` function).
* `tiny-essentials/libs/math/TinyTimeout` (For regulating execution frequency).

### Basic Initialization
```javascript
import TinyThrottledApi from 'tiny-essentials/libs/utils/TinyThrottledApi';

// A mock API function to simulate a network request
const mockApi = async (id) => {
  console.log(`🚀 Fetching data for ID: ${id}`);
  return new Promise((resolve) => setTimeout(() => resolve(`Data ${id}`), 1000));
};

// Create an instance: Max 3 concurrent requests
const throttledApi = new TinyThrottledApi(3, mockApi);
```

---

## 🛠️ API Reference

### `constructor(concurrencyLimit, api, timeoutInstance)`
Initializes the throttled controller.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `concurrencyLimit` | `number` | Must be a positive integer. Defines max simultaneous tasks. |
| `api` | `Function` | The target asynchronous function to execute. |
| `timeoutInstance` | `TinyTimeout \| null` | (Optional) An instance to control request frequency. |

**Throws:**
* `TypeError`: If `concurrencyLimit` is not a positive number or `api` is not a function.

### `exec(...args)`
The primary method to execute your API calls.

* **Returns:** `Promise<ReturnType<API>>`.
* **Behavior:** 
  1. Checks if a slot is available.
  2. If yes, executes immediately.
  3. If no, adds the task to the `TinyPromiseQueue` and waits for a slot to become free.

### Getters (For Monitoring)
* `activeCount`: Returns the number of requests currently running.
* `queuedCount`: Returns the number of requests waiting in the queue.
* `concurrencyLimit`: Returns the current limit.
* `timeoutValue`: Returns the base delay in milliseconds.

---

## 💡 Practical Examples

### Example 1: Simple Concurrency (The "Batch" Pattern)
Use this when you have a large array of IDs and want to process them without crashing your system.

```javascript
const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const throttledApi = new TinyThrottledApi(2, mockApi); // Only 2 at a time

async function runBatch() {
  const tasks = ids.map(id => 
    throttledApi.exec(id).then(res => console.log(`✅ Received: ${res}`))
  );

  await Promise.all(tasks);
  console.log("🏁 All tasks completed!");
}

runBatch();
```

### Example 2: Advanced Throttling (The "Polite" Pattern)
Use this when the server has a strict "Requests Per Second" (RPS) limit.

```javascript
import TinyTimeout from '../math/TinyTimeout.mjs';

const timeout = new TinyTimeout();
const throttledApi = new TinyThrottledApi(5, mockApi, timeout);

// Set the base delay to 500ms and max cap to 2 seconds
throttledApi.timeoutValue = 500;
throttledApi.timeoutLimit = 2000;

// When you call .exec(), the TinyTimeout will ensure 
// requests are spaced out according to the internal logic.
```

---

## 🔍 Monitoring & Debugging

When debugging your application, use the getters to log the state of your queue. This is vital for identifying "bottlenecks" (where the queue is growing faster than the API can process).

```javascript
const monitorInterval = setInterval(() => {
  console.log(
    `📊 Status -> Active: ${throttledApi.activeCount} | Queued: ${throttledApi.queuedCount}`
  );
}, 1000);

// Remember to clear the interval when your work is done!
```
