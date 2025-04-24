/**
 * Class to manage user level-up logic based on experience points.
 */
class TinyLevelUp {
  /**
   * Constructor
   * @param {number} giveExp - Base experience value for random experience generation.
   * @param {number} expLevel - Base experience needed to level up (per level).
   */
  constructor(giveExp, expLevel) {
    this.giveExp = giveExp;
    this.expLevel = expLevel;
  }

  /**
   * Validates and adjusts the user's level based on their current experience.
   * @param {{ exp: number, level: number, totalExp: any }} user - The user object containing experience and level properties.
   * @returns {Object} The updated user object.
   */
  expValidator(user) {
    let extraValue = 0;
    const nextLevelExp = this.expLevel * user.level;

    // Level Up
    if (user.exp >= nextLevelExp) {
      user.level++;
      extraValue = user.exp - nextLevelExp;
      user.exp = 0;

      if (extraValue > 0) return this.give(user, extraValue, 'extra');
    }

    // Level Down
    if (user.exp < 1 && user.level > 1) {
      user.level--;
      extraValue = Math.abs(user.exp);
      user.exp = this.expLevel * user.level;

      if (extraValue > 0) return this.remove(user, extraValue, 'extra');
    }

    return user;
  }

  /**
   * Calculates the total experience based on the user's level.
   * @param {{ exp: number, level: number }} user - The user object containing experience and level properties.
   * @returns {number} The total experience of the user.
   */
  getTotalExp(user) {
    let totalExp = 0;
    for (let p = 1; p <= user.level; p++) totalExp += this.expLevel * p;
    totalExp += user.exp;
    return totalExp;
  }

  /**
   * Generates random experience points based on the configured multiplier.
   * @param {number} multi - A multiplier for the generated experience.
   * @returns {number} The generated experience points.
   */
  expGenerator(multi = 1) {
    return Math.floor(Math.random() * this.giveExp) + 1 * multi;
  }

  /**
   * Gets the experience points required to reach the next level.
   * @param {{ level: number }} user - The user object containing the level.
   * @returns {number} The experience required for the next level.
   */
  progress(user) {
    return this.expLevel * user.level;
  }

  /**
   * Gets the experience points required to reach the next level.
   * @param {{ level: number }} user - The user object containing the level.
   * @returns {number} The experience required for the next level.
   */
  getProgress(user) {
    return this.expLevel * user.level;
  }

  /**
   * Sets the experience value for the user, adjusting their level if necessary.
   * @param {{ exp: number, level: number, totalExp: any }} user - The user object.
   * @param {number} value - The new experience value to set.
   * @returns {Object} The updated user object.
   */
  set(user, value) {
    user.exp = value;
    this.expValidator(user);
    user.totalExp = this.getTotalExp(user);
    return user;
  }

  /**
   * Adds experience to the user, adjusting their level if necessary.
   * @param {{ exp: number, level: number, totalExp: any }} user - The user object.
   * @param {number} extraExp - Additional experience to be added.
   * @param {'add' | 'extra'} type - Type of addition ('add' or 'extra').
   * @param {number} multi - Multiplier for experience generation.
   * @returns {Object} The updated user object.
   */
  give(user, extraExp = 0, type = 'add', multi = 1) {
    if (type === 'add') user.exp += this.expGenerator(multi) + extraExp;
    else if (type === 'extra') user.exp += extraExp;

    this.expValidator(user);
    user.totalExp = this.getTotalExp(user);
    return user;
  }

  /**
   * Removes experience from the user, adjusting their level if necessary.
   * @param {{ exp: number, level: number, totalExp: any }} user - The user object.
   * @param {number} extraExp - Experience to remove.
   * @param {'add' | 'extra'} type - Type of removal ('add' or 'extra').
   * @param {number} multi - Multiplier for experience generation.
   * @returns {Object} The updated user object.
   */
  remove(user, extraExp = 0, type = 'add', multi = 1) {
    if (type === 'add') user.exp -= this.expGenerator(multi) + extraExp;
    else if (type === 'extra') user.exp -= extraExp;

    this.expValidator(user);
    user.totalExp = this.getTotalExp(user);
    return user;
  }
}

export default TinyLevelUp;
