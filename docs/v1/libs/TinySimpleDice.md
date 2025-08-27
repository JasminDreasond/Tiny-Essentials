# 🎲 TinySimpleDice

A **lightweight, flexible dice rolling utility** for generating random numbers.  
You can configure the dice to **allow zero**, set a **maximum value**, and even roll values suitable for **indexing arrays or Sets**.

---

## ⚙️ Class: `TinySimpleDice`

### Properties

| Property    | Type    | Description                       |
| ----------- | ------- | --------------------------------- |
| `maxValue`  | number  | Maximum value the dice can roll.  |
| `allowZero` | boolean | Whether 0 is allowed as a result. |

---

### Constructor

```js
new TinySimpleDice({ maxValue, allowZero = true });
```

**Parameters**

| Name        | Type    | Description                                             |
| ----------- | ------- | ------------------------------------------------------- |
| `maxValue`  | number  | Maximum value the dice can roll (non-negative integer). |
| `allowZero` | boolean | Optional. If `true`, 0 is allowed; default is `true`.   |

**Throws**

* `TypeError` if `maxValue` is not a non-negative integer.
* `TypeError` if `allowZero` is not a boolean.

**Example**

```js
const dice = new TinySimpleDice({ maxValue: 6, allowZero: false });
```

---

### Getters & Setters

#### `maxValue`

* **Getter**: Returns the maximum value of the dice.
* **Setter**: Sets a new maximum value (must be a non-negative integer).
* **Throws**: `TypeError` if invalid.

```js
console.log(dice.maxValue); // 6
dice.maxValue = 10;          // Update maximum value
```

#### `allowZero`

* **Getter**: Returns whether 0 is allowed.
* **Setter**: Sets whether 0 is allowed.
* **Throws**: `TypeError` if not a boolean.

```js
console.log(dice.allowZero); // false
dice.allowZero = true;       // Allow zero
```

---

### Methods

#### `roll()`

Rolls the dice according to the configuration.

```js
const result = dice.roll();
console.log(result); // Random number between 1 and 6 (or 0 if allowZero)
```

**Returns:** `number` — the rolled value.

---

#### `static rollArrayIndex(arr)`

Rolls a value suitable for indexing an **array** or **Set**.

```js
const fruits = ['apple', 'banana', 'cherry'];
const index = TinySimpleDice.rollArrayIndex(fruits);
console.log(fruits[index]); // Random fruit
```

**Parameters:**

| Name | Type              | Description                |
| ---- | ----------------- | -------------------------- |
| arr  | array or Set<any> | The array or Set to index. |

**Returns:** `number` — a valid index.

**Throws:** `TypeError` if input is not an array or Set.

---

## 📝 Examples

```js
// Create dice
const dice = new TinySimpleDice({ maxValue: 12, allowZero: true });

// Roll dice
console.log(dice.roll()); // e.g., 0–12

// Update dice configuration
dice.maxValue = 20;
dice.allowZero = false;

// Roll for an array index
const colors = ['red', 'green', 'blue', 'yellow'];
const idx = TinySimpleDice.rollArrayIndex(colors);
console.log(colors[idx]); // Random color

// Roll for a Set
const mySet = new Set([10, 20, 30]);
console.log(TinySimpleDice.rollArrayIndex(mySet)); // 0–2 index
```

---

## 🎯 Features

* ✅ Configurable maximum value
* ✅ Option to allow or disallow zero
* ✅ Static helper to roll indices for arrays or Sets
* ✅ Lightweight and easy to use

---

## 💡 Notes

* The `rollArrayIndex` method always returns a **valid index**, regardless of the collection type.
* Set results are converted to an array internally when accessing values.
* Getters and setters validate values to ensure safe usage.
