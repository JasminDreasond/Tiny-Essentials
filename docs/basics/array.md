# 📦 array.mjs

A tiny utility for shuffling arrays using the good old Fisher–Yates algorithm. Simple, efficient, and perfectly random (as far as JavaScript's `Math.random()` allows, anyway).

## ✨ Features

- 📚 Uses the classic **Fisher–Yates** algorithm
- 🔄 Shuffles arrays **in-place**
- 🎯 Guarantees **uniform distribution** of permutations
- 🔍 Well-documented and easy to read
- 🧪 No dependencies — just plug and play

## 🚀 Usage

```js
import { shuffleArray } from './array.mjs';

const fruits = ['apple', 'banana', 'cherry', 'date'];
shuffleArray(fruits);

console.log(fruits); // ['banana', 'cherry', 'apple', 'date'] (order will vary)
```

> Note: The original array is shuffled in place. If you want to preserve the original order, make a copy before shuffling.

## 🧠 How It Works

This function implements the **Fisher–Yates shuffle** (also known as the Knuth shuffle), which runs in linear time and guarantees uniform randomness:

```js
while (currentIndex !== 0) {
  randomIndex = Math.floor(Math.random() * currentIndex);
  currentIndex--;
  [items[currentIndex], items[randomIndex]] = [items[randomIndex], items[currentIndex]];
}
```

You can find the original discussion here:  
🔗 https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

## 📁 API

### `shuffleArray(items: string[]): string[]`

- **items** — An array of strings to shuffle.
- **Returns** — The same array instance, but now shuffled.

---

# 📦 `arraySortPositions`

🔧 **Generates a comparator function** to sort an array of objects by a specified key, with optional reverse order.

---

## 📌 Function Signature

```js
arraySortPositions(item: string, isReverse?: boolean): (a: Object<string|number, *>, b: Object<string|number, *>) => number
```

---

## 🧠 Parameters

| Name        | Type      | Default | Description                                                |
| ----------- | --------- | ------- | ---------------------------------------------------------- |
| `item`      | `string`  | —       | 🔑 The key to sort the objects by.                         |
| `isReverse` | `boolean` | `false` | 🔄 If `true`, the sorting will be in **descending** order. |

---

## 🎯 Returns

🧩 A **comparator function** compatible with `Array.prototype.sort()`:

```js
(a, b) => number
```

It compares two objects based on the specified `item` key.

---

## 💡 Examples

```js
const arr = [{ pos: 2 }, { pos: 1 }, { pos: 3 }];
arr.sort(arraySortPositions('pos'));
// 🔼 Ascending: [{ pos: 1 }, { pos: 2 }, { pos: 3 }]
```

```js
const arr = [{ pos: 2 }, { pos: 1 }, { pos: 3 }];
arr.sort(arraySortPositions('pos', true));
// 🔽 Descending: [{ pos: 3 }, { pos: 2 }, { pos: 1 }]
```

---

## 🛠️ Use Case

Great for situations where you need to **dynamically sort objects** by one of their keys, such as:

* Sorting users by age
* Ordering tasks by priority
* Displaying leaderboard scores
