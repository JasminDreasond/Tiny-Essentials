class LevelUp {
  // Constructor
  constructor(giveExp, expLevel) {
    this.giveExp = giveExp;
    this.expLevel = expLevel;
  }

  // Exp Validator
  expValidator(user) {
    // Prepare Extra Value
    let extraValue = 0;

    // Exp Next Level
    const nextLevelExp = this.expLevel * user.level;

    // Add Level
    if (user.exp > nextLevelExp) {
      // Add Level
      user.level++;

      // Set Extra Value
      extraValue += user.exp - nextLevelExp;

      // Set the new total exp
      user.exp = 0;

      // Add More Level
      if (extraValue > 0) return this.give(user, extraValue, 'extra');
    }

    // Remove Level
    else if (user.exp < 1) {
      // Remove Level
      user.level--;

      // Remove more level
      if (user.exp < 0) extraValue = Math.abs(user.exp);

      // Set the new total exp
      user.exp = this.expLevel * user.level;

      // Remove More Level
      if (extraValue > 0) return this.remove(user, extraValue, 'extra');
    }

    // Complete
    return user;
  }

  // Get Total Exp
  getTotalExp(user) {
    // Base
    let totalexp = 0;

    // For
    for (let p = 0; p < user.level; p++) {
      if (p !== 0) {
        const numberinset = this.expLevel * p;
        totalexp = totalexp + numberinset;
      }
    }

    // Insert Result
    totalexp = totalexp + user.exp;

    // Complete
    return totalexp;
  }

  // Exp Generator
  expGenerator(multi = 1) {
    return Number(Math.floor(Math.random() * (this.giveExp - 1 + 1) + 1)) * multi;
  }

  // Progress
  progress(user) {
    return this.expLevel * user.level;
  }

  // Set Exp Value
  set(user, value) {
    // Set the new value
    user.exp = value;

    // Validator
    this.expValidator(user);

    // Get Total Exp
    user.totalExp = this.getTotalExp(user);

    // Complete
    return user;
  }

  // Give
  give(user, extraExp = 0, type = 'add', multi = 1) {
    // Get the new user exp
    if (type === 'add') user.exp += this.expGenerator(multi) + extraExp;
    // Extra
    else if (type === 'extra') user.exp += extraExp;

    this.expValidator(user);

    // Get Total Exp
    user.totalExp = this.getTotalExp(user);

    // Complete
    return user;
  }

  // Remove
  remove(user, extraExp = 0, type = 'add', multi = 1) {
    // Get the new user exp
    if (type === 'add') user.exp -= this.expGenerator(multi) + extraExp;
    // Extra
    else if (type === 'extra') user.exp -= extraExp;

    this.expValidator(user);

    // Get Total Exp
    user.totalExp = this.getTotalExp(user);

    // Complete
    return user;
  }
}

export default LevelUp;
