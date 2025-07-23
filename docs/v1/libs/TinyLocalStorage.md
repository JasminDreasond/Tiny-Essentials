# 📦 TinyLocalStorage

Tiny wrapper for `localStorage` with full support for objects, arrays, `Map`, `Set`, and typed value helpers like string, number, and boolean. Includes built-in event system powered by `TinyEvents`.

---

## 🚀 Quick Start

```js
const storage = new TinyLocalStorage();

storage.setString('name', 'Yasmin');
storage.setNumber('age', 25);
storage.setBool('likesCats', true);
storage.setJson('myMap', new Map([['a', 1], ['b', 2]]));

console.log(storage.getString('name')); // "Yasmin"
console.log(storage.getJson('myMap')); // Map { 'a' => 1, 'b' => 2 }
```

---

## 🧠 Features

* ✅ Store & restore `Map`, `Set`, arrays and plain objects.
* ✅ Type-safe storage methods for string, number and boolean.
* ✅ Fallback handling when deserialization fails.
* ✅ Built-in event emitter system.

---

## 📦 Storage Methods

### `setJson(key, data)`

Stores a complex structure (`Map`, `Set`, object, or array) in `localStorage`.

```ts
setJson(name: string, data: LocalStorageJsonValue): void
```

### `getJson(key, fallback?)`

Retrieves and decodes a previously stored structure.

```ts
getJson(name: string, defaultData?: 'array' | 'obj' | 'map' | 'set' | 'null'): LocalStorageJsonValue | null
```

---

### `setItem(key, rawString)`

Stores a raw string, without any processing.

```ts
setItem(name: string, data: string): void
```

### `getItem(key)`

Retrieves a raw string.

```ts
getItem(name: string): string | null
```

---

### `setString(key, string)`

Stores a `string` value.

```ts
setString(name: string, data: string): void
```

### `getString(key)`

Retrieves a `string` value.

```ts
getString(name: string): string | null
```

---

### `setNumber(key, number)`

Stores a `number` value.

```ts
setNumber(name: string, data: number): void
```

### `getNumber(key)`

Retrieves a `number` value.

```ts
getNumber(name: string): number | null
```

---

### `setBool(key, boolean)`

Stores a `boolean` value.

```ts
setBool(name: string, data: boolean): void
```

### `getBool(key)`

Retrieves a `boolean` value.

```ts
getBool(name: string): boolean | null
```

---

## ❌ Deletion Methods

### `removeItem(key)`

Removes a specific key from `localStorage`.

```ts
removeItem(name: string): void
```

### `clearLocalStorage()`

Clears all data in the active storage.

---

## 🌐 Storage Configuration

### `setLocalStorage(storage)`

Switch between `localStorage` and `sessionStorage`.

```ts
setLocalStorage(localstorage: Storage): void
```

### `localStorageExists()`

Checks if the current environment supports `localStorage`.

---

## 🔥 Events (via TinyEvents)

### Custom Events

* `'setJson'`
* `'setItem'`
* `'setString'`
* `'setNumber'`
* `'setBool'`
* `'removeItem'`
* `'storage'` (native `storage` event)

---

## 🧹 Destroying

### `destroy()`

Cleans up the instance, removes listeners and events.

```ts
destroy(): void
```

---

## 🧩 Type Definition

```ts
type LocalStorageJsonValue =
  | Record<string | number | symbol, any>
  | any[]
  | Map<string | number | symbol, any>
  | Set<any>;
```

---

## 🔐 Internal Helpers

### `encodeSpecialJson(value)`

Recursively converts `Map` and `Set` into serializable objects.

### `decodeSpecialJson(value)`

Restores `Map` and `Set` from encoded JSON.

---

## 🧪 Example: Map & Set

```js
const map = new Map([['x', 123]]);
const set = new Set(['apple', 'banana']);

storage.setJson('myMap', map);
storage.setJson('mySet', set);

console.log(storage.getJson('myMap')); // Map { 'x' => 123 }
console.log(storage.getJson('mySet')); // Set { 'apple', 'banana' }
```
