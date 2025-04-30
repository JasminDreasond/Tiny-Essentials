
### `TinyLevelUp.js` 🎮

This class manages user level-up logic based on experience points. It provides methods to handle experience points (exp) adjustments, level progression, and random experience generation.

#### Class: `TinyLevelUp` 🎮

A class to manage user level-up logic based on experience points.

##### Constructor 🛠️

- **`constructor(giveExp: number, expLevel: number)`**  
  Initializes the class with the base experience value for random experience generation and the base experience required to level up.

  - `giveExp` (`number`): The base experience value used for random experience generation. 🎲
  - `expLevel` (`number`): The base experience required to level up for each level. 📈

##### Methods 🔧

- **`expValidator(user: UserEditor)`**  
  Validates and adjusts the user's level based on their current experience. If the user's experience is above or below the required threshold, their level is adjusted accordingly. ⚖️

  - `user` (`UserEditor`): The user object containing `exp` (experience), `level` (current level), and `totalExp` (total experience). 👤
  
  - **Returns**: `UserResult` - The updated user object. 🔄

- **`getTotalExp(user: { exp: number, level: number })`**  
  Calculates the total experience based on the user's level and experience. 📊

  - `user` (`Object`): The user object containing `exp` (experience) and `level` (level). 👤
  
  - **Returns**: `number` - The total experience of the user. 🔢

- **`expGenerator(multi: number = 1)`**  
  Generates random experience points based on a configured multiplier. 🎲

  - `multi` (`number`): A multiplier for experience generation. Default is `1`. 💯

  - **Returns**: `number` - The generated experience points. 💥

- **`progress(user: { level: number })`**  
  Gets the experience points required to reach the next level. ⏩

  - `user` (`Object`): The user object containing the `level`. 👤

  - **Returns**: `number` - The experience required for the next level. 📈

- **`getProgress(user: { level: number })`**  
  An alias for `progress`. Returns the experience points required to reach the next level. ⏩

  - `user` (`Object`): The user object containing the `level`. 👤

  - **Returns**: `number` - The experience required for the next level. 📈

- **`set(user: UserEditor, value: number)`**  
  Sets the user's experience value and adjusts their level if necessary. 📝

  - `user` (`UserEditor`): The user object containing `exp`, `level`, and `totalExp`. 👤
  - `value` (`number`): The new experience value to set for the user. 💡

  - **Returns**: `UserResult` - The updated user object. 🔄

- **`give(user: UserEditor, extraExp: number = 0, type: 'add' | 'extra' = 'add', multi: number = 1)`**  
  Adds experience to the user and adjusts their level if necessary. Experience can be added with or without a multiplier. ➕

  - `user` (`UserEditor`): The user object containing `exp`, `level`, and `totalExp`. 👤
  - `extraExp` (`number`): Additional experience to be added. 💯
  - `type` (`'add' | 'extra'`): Type of experience addition. `'add'` adds random experience, while `'extra'` adds specified experience. 🔧
  - `multi` (`number`): Multiplier for experience generation. Default is `1`. 💥

  - **Returns**: `UserResult` - The updated user object. 🔄

- **`remove(user: UserEditor, extraExp: number = 0, type: 'add' | 'extra' = 'add', multi: number = 1)`**  
  Removes experience from the user and adjusts their level if necessary. Experience can be removed with or without a multiplier. ➖

  - `user` (`UserEditor`): The user object containing `exp`, `level`, and `totalExp`. 👤
  - `extraExp` (`number`): Additional experience to be removed. 💣
  - `type` (`'add' | 'extra'`): Type of experience removal. `'add'` removes random experience, while `'extra'` removes specified experience. 🔧
  - `multi` (`number`): Multiplier for experience generation. Default is `1`. 💥

  - **Returns**: `UserResult` - The updated user object. 🔄

#### Type Definitions 📚

- **`UserResult`**  
  Represents the structure of a user object after level validation. 🧑‍💻

  - `exp` (`number`): The user's experience. 🎯
  - `level` (`number`): The user's current level. 🏆
  - `totalExp` (`number`): The user's total experience. 📊

- **`UserEditor`**  
  Represents the user object before level validation. 🔧

  - `exp` (`number`): The user's experience. 🎯
  - `level` (`number`): The user's current level. 🏆
  - `totalExp` (`any`): The user's total experience (can be calculated using `getTotalExp`). 📊

#### Example Usage 💡

```javascript
const user = { exp: 50, level: 1, totalExp: 50 };
const levelUpSystem = new TinyLevelUp(100, 1000);

// Add experience and check updated user stats
levelUpSystem.give(user);
console.log(user); // { exp: 112, level: 1, totalExp: 112 }
```

---

This class can be used to manage user experience points and level-ups in any system requiring user progression logic. 🚀
