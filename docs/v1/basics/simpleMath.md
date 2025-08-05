# 🔢 simpleMath.mjs

A collection of simple math utilities that make basic calculations a breeze.

## Overview

`simpleMath.mjs` offers a set of essential mathematical functions, from the classic Rule of Three (direct and inverse proportions) to calculating percentages and even determining age based on a birthdate. It's an easy-to-use module for anyone who needs to perform fundamental calculations in JavaScript.

---

## Functions

### 🔢 `ruleOfThree(val1, val2, val3, inverse)`

**Performs a Rule of Three calculation.**  
This function calculates a proportional relationship between three values, which is commonly used in mathematical and real-world scenarios.

- **`val1`**: First reference value (numerator in direct proportion, denominator in inverse).
- **`val2`**: Second reference value (denominator in direct proportion, numerator in inverse).
- **`val3`**: Third value (numerator in direct proportion, denominator in inverse).
- **`inverse`**: Set to `true` for inverse proportion, or `false` for direct proportion.

#### Example - Direct Proportion:

```js
ruleOfThree(2, 6, 3, false); // → 9
```

#### Example - Inverse Proportion:

```js
ruleOfThree(2, 6, 3, true); // → 4
```

---

### 💯 `getSimplePerc(price, percentage)`

**Calculates the actual value that corresponds to a percentage of a base number.**

Unlike `getPercentage`, which tells how much something represents in percent,  
this function tells how much a given percentage *is worth* in actual value.

- **`price`**: The base number to apply the percentage to.  
- **`percentage`**: The percentage to calculate from the base.

#### Example:
```js
getSimplePerc(200, 15); // → 30
```

---

### 📊 `getPercentage(part, total)`

**Calculates how much percent a partial value represents of the total value.**

This function is useful when you want to know what fraction of the total a value is, in percentage form.

- **`part`**: The partial value to compare.  
- **`total`**: The total or maximum value.

#### Example:
```js
getPercentage(5, 100); // → 5
```

---

### 🎂 `getAge(timeData, now)`

**Calculates the age based on a birthdate.**

- **`timeData`**: The birthdate. It can be a timestamp, an ISO string, or a `Date` object.
- **`now`**: The current date (`Date` object). If not provided, the current date will be used.

If the `timeData` is not provided or is invalid, the function returns `null`.

#### Example:

```js
getAge('1990-01-01'); // → 35 (assuming the current year is 2025)
```

---

### 📦 `formatBytes(bytes, decimals, maxUnit)`

Converts a byte value into a human-readable format with the unit and value separated. It allows you to set the number of decimal places and restricts the conversion to a specified maximum unit (optional). 🌐

### Parameters:

- `bytes` (number) ➡️ **The number of bytes to format.**  
  Must be a non-negative number.  
- `decimals` (number|null) ➡️ **The number of decimal places to include in the result.**  
  Defaults to `2`. If negative, it will be treated as `0`. If `null`, no rounding is applied and the full precision is used.  
- `maxUnit` (string|null) ➡️ **Optional unit limit.**  
  If provided, restricts conversion to this unit at most (e.g., `'MB'` prevents conversion to `'GB'` or higher).  
  Must be one of:  
  `'Bytes'`, `'KB'`, `'MB'`, `'GB'`, `'TB'`, `'PB'`, `'EB'`, `'ZB'`, `'YB'`.  
  Defaults to `null`, meaning no restriction.

### Returns:

- **Object** with two properties:
  - `unit`: (string|null) ➡️ **The unit of the value** (e.g., 'MB', 'GB', etc.).
  - `value`: (number|null) ➡️ **The formatted byte value.**  
    If the input is invalid, returns `null` for both.

### Example Usage:

```js
formatBytes(123456789);
// Returns: { unit: 'MB', value: 117.74 }
```

```js
formatBytes(1073741824, 2, 'MB');
// Returns: { unit: 'MB', value: 1024 }
```

```js
formatBytes(10485760); 
// Returns: { unit: 'MB', value: 10 }

formatBytes(1073741824); 
// Returns: { unit: 'GB', value: 1 }

formatBytes(1073741824, 2, 'MB'); 
// Returns: { unit: 'MB', value: 1024 }
```

---

### Notes:

* **Formatting:** Converts bytes to the most appropriate unit (from 'Bytes' to 'YB') based on the byte value.
* **Max Unit:** The `maxUnit` parameter allows you to limit the highest unit for conversion. If not provided, it will convert all the way up to 'YB'.
* **Decimals:** The result can be customized with a specified number of decimal places for precision. If `decimals` is `null`, no rounding is applied, and the full precision value is returned.

---

### 🔢 `genFibonacciSeq()` — Custom Fibonacci Sequence Generator

📐 Flexible, combinable, and vector-friendly!

Generates a customizable Fibonacci-like sequence. You can use simple numbers or even 2D/ND vectors by passing a custom `combiner` function.

```js
genFibonacciSeq({
  baseValues: [[0, 1], [1, 1]],
  length: 10,
  combiner: ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2]
});
```

#### ⚙️ Options

* `baseValues` 🧬: Two starting values (default: `[0, 1]`)
* `length` 📏: How many items to generate (default: `10`)
* `combiner` 🧪: Custom function to generate next value from the last two (default: `(a, b) => a + b`)

#### 🧠 Returns

An array representing the generated sequence.

> 🔖 **Beta** – Still experimental and fun to tweak!

---

### 📊 `compareMarketcap`

Calculates the price change of a stuff when its **market cap changes**.

#### 🧩 Function Signature

```js
compareMarketcap(originalMarketCap, circulatingSupply, newMarketCap)
```

#### 📥 Parameters

| Parameter           | Type     | Description                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------------- |
| `originalMarketCap` | `number` | 💰 The original market capitalization. Must be a valid, finite number.      |
| `circulatingSupply` | `number` | 🔄 The circulating supply of the coin. Must be a positive number.           |
| `newMarketCap`      | `number` | 📉 The new market capitalization. Optional. Must be a valid number if used. |

#### 📤 Returns

An object with the following fields:

```js
{
  originalPrice: number,       // 💵 Price before market cap changed
  newPrice: number,            // 💸 Price after market cap changed (NaN if not provided)
  priceChangePercent: number  // 📈 Percentage change in price (NaN if newMarketCap not provided)
}
```

#### ⚠️ Validation Rules

* Throws a `TypeError` if any of the numeric inputs are not finite numbers.
* Throws an `Error` if `circulatingSupply` is less than or equal to zero.
* If `newMarketCap` is omitted or not a number, `newPrice` and `priceChangePercent` will be `NaN`.

#### 📝 Notes

* Useful for estimating the effect of market cap fluctuations on token price.
* Ideal for financial dashboards, token simulations, or educational tools.

---

### 📈 `calculateMarketcap(originalMarketCap, circulatingSupply)`

Calculates the **unit price** of a coin or token based on its **market capitalization** and **circulating supply**.

This function is commonly used in financial applications to estimate the price per asset unit (e.g., per token or coin).

#### 🧮 Formula

```
price = originalMarketCap / circulatingSupply
```

#### 📥 Parameters

| Name                | Type     | Description                                                |
| ------------------- | -------- | ---------------------------------------------------------- |
| `originalMarketCap` | `number` | The total market capitalization (e.g., in USD) 💵.         |
| `circulatingSupply` | `number` | The number of tokens or coins currently in circulation 🪙. |

#### 📤 Returns

* `number` – The calculated **unit price** of the asset 🔢.

#### ⚠️ Throws

* `TypeError` – If either parameter is not a finite number ❌.
* `Error` – If `circulatingSupply` is less than or equal to zero 🚫.
