// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

/**
 * Randomly shuffles the elements of an array in place using the Fisher–Yates algorithm.
 *
 * This implementation ensures a uniform distribution of permutations.
 * Original algorithm source: StackOverflow (link above).
 *
 * @template T
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]} The same array instance, now shuffled in place.
 */
export const shuffleArray = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};
