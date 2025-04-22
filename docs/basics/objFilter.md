# 🧠 objFilter.mjs

Type detection, extension, and analysis made easy — simple and extensible type validation in pure JavaScript.

## Overview

`objFilter.mjs` is a utility module that provides a structured and extensible way to validate, infer, and count object types in JavaScript. It’s designed to work in both Node.js and browser environments and is perfect for libraries that need consistent, extensible type-checking logic.

Whether you’re validating inputs, writing schema validators, or building tools that need to "understand" JavaScript data — this module has your back!

---

## Features

- ✅ Precise type detection (`undefined`, `null`, `array`, `buffer`, `date`, etc.)
- ➕ Custom type extensions with ordering
- 🔄 Reorder type checking priority
- 🔍 Safe and predictable type checks
- 🧮 Count values in arrays and objects
- 🚫 No dependencies

---

## Usage

### 🔍 `objType(obj, [type])`

Get the type of any value, or check it against a known type.

```js
objType([], 'array'); // true
objType('hello');     // "string"
objType(undefined);   // null
```

Returns:
- `true` / `false` if a type is provided
- The detected type name as a string if no type is provided
- `null` if `undefined` is passed

---

### ➕ `extendObjType(newTypes, [index])`

Add your own custom types. You can optionally define where in the check order they go.

```js
extendObjType({
  customElement: val => val && val.tagName === 'MY-ELEMENT'
});
```

This will insert `customElement` before the built-in `object` type unless a position is specified.

---

### 🔁 `reorderObjTypeOrder(newOrder)`

Set a custom priority order for how types are checked (must include only known types).

```js
reorderObjTypeOrder([
  'string',
  'number',
  'array',
  'object'
]);
```

Returns `true` if successful, or `false` if the order includes unknown types.

---

### 📋 `cloneObjTypeOrder()`

Safely get a copy of the current type evaluation order.

```js
const currentOrder = cloneObjTypeOrder();
```

---

### 🧮 `countObj(obj)`

Returns the number of elements in an array or the number of keys in an object.

```js
countObj([1, 2, 3]);       // 3
countObj({ a: 1, b: 2 });  // 2
countObj('hi');            // 0
```

---

## Supported Types

Here’s a full list of supported type names (in their default order):

- `undefined`
- `null`
- `boolean`
- `number`
- `bigint`
- `string`
- `symbol`
- `function`
- `array`
- `buffer`
- `date`
- `regexp`
- `map`
- `set`
- `weakmap`
- `weakset`
- `promise`
- `htmlElement`
- `object`

You can change this order or insert your own types with `extendObjType`.
