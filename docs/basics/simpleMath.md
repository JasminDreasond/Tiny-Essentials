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

**Calculates the percentage of a given base value.**

- **`price`**: The base value (for example, the original price of an item).
- **`percentage`**: The percentage to calculate from the base value.

#### Example:

```js
getSimplePerc(200, 15); // → 30
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
