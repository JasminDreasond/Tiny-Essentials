const rule3 = {
  getClient: function () {
    return rule3.execute.toString();
  },

  execute: function (val1, val2, val3, inverse) {
    if (inverse == true) {
      return Number(val1 * val2) / val3;
    } else {
      return Number(val3 * val2) / val1;
    }
  },
};

export default rule3;
