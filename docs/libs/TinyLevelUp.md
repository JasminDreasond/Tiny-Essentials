# 📚 TinyLevelUp Documentation

A lightweight XP-based leveling system for managing user experience and levels. Great for games, communities, or reward-based applications! 🎮✨

---

## 📐 Type Definitions

### `UserEditor` ✍️

Represents the structure of a user object used in the leveling system.

```ts
{
  exp: number;       // Current experience points of the user
  level: number;     // Current level of the user
  totalExp: number;  // Total accumulated experience
}
```

---

## 🏗️ Class: `TinyLevelUp`

Handles experience logic, leveling up/down, validation, and XP generation.

### 🆕 Constructor

```ts
new TinyLevelUp(giveExp: number, expLevel: number)
```

* `giveExp`: Base XP value for random XP generation 🎲
* `expLevel`: Base XP required per level up 🔺

---

## 🧰 Methods

### ➕ `createUser()`

Creates a fresh user at level 0 with no XP.

```ts
createUser(): UserEditor
```

---

### 🔎 `validateUser(user)`

Throws an error if the user object is malformed or contains invalid values.

```ts
validateUser(user: UserEditor): void
```

🚨 Throws if:

* `exp`, `level`, or `totalExp` are not valid numbers.

---

### ✅ `isValidUser(user)`

Checks if the given user object is valid (without throwing errors).

```ts
isValidUser(user: UserEditor): boolean
```

---

### 🎁 `getGiveExpBase()`

Returns the base XP value used for generating XP.

```ts
getGiveExpBase(): number
```

---

### 🧮 `getExpLevelBase()`

Returns the base XP required per level.

```ts
getExpLevelBase(): number
```

---

### ⚖️ `expValidator(user)`

Validates and adjusts user level based on current XP.

```ts
expValidator(user: UserEditor): UserEditor
```

* Levels up/down the user if needed.
* Applies "extra" XP appropriately.

---

### 📊 `getTotalExp(user)`

Calculates total accumulated XP (including current level and progress).

```ts
getTotalExp(user: UserEditor): number
```

---

### 🎲 `expGenerator(multi = 1)`

Generates a random XP value based on the multiplier.

```ts
expGenerator(multi?: number): number
```

---

### ⏩ `progress(user)`

Returns XP required to reach the next level.

```ts
progress(user: UserEditor): number
```

---

### 📈 `getProgress(user)`

Alias for `progress()`. Returns XP needed to reach the next level.

```ts
getProgress(user: UserEditor): number
```

---

### ✍️ `set(user, value)`

Sets the current XP for the user and updates their level if necessary.

```ts
set(user: UserEditor, value: number): UserEditor
```

---

### ⬆️ `give(user, extraExp?, type?, multi?)`

Adds experience to the user and auto-levels if needed.

```ts
give(
  user: UserEditor,
  extraExp?: number,
  type?: 'add' | 'extra',
  multi?: number
): UserEditor
```

* `type = 'add'`: Adds generated XP + extra
* `type = 'extra'`: Adds only extra

---

### ⬇️ `remove(user, extraExp?, type?, multi?)`

Removes experience from the user and updates their level if necessary.

```ts
remove(
  user: UserEditor,
  extraExp?: number,
  type?: 'add' | 'extra',
  multi?: number
): UserEditor
```

* `type = 'add'`: Removes generated XP + extra
* `type = 'extra'`: Removes only extra

---

## 🌟 Example Usage

```js
import TinyLevelUp from './TinyLevelUp.js';

const levelSystem = new TinyLevelUp(15, 10);
const user = levelSystem.createUser();

levelSystem.give(user); // Adds random XP
console.log(user);

levelSystem.set(user, 50); // Manually set XP
console.log(user.level);
```

---

## 💬 Notes

* All methods throw if invalid values are passed ❗
* You can use `isValidUser()` for safe checks without exceptions 🛡️
* This system is deterministic and extendable!