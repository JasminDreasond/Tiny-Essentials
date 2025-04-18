const tinyDice = {
  vanilla: function (obj) {
    return Number(Math.floor(Math.random() * (obj - 1 + 1) + 1));
  },

  getClientVanilla: function (obj) {
    return tinyDice.vanilla.toString();
  },
};

export default tinyDice;
