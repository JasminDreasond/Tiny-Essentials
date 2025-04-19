// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

/**
 * Randomly shuffles the elements of an array in place using the Fisher–Yates algorithm.
 *
 * This implementation ensures a uniform distribution of permutations.
 * Original algorithm source: StackOverflow (link above).
 *
 * @param {string[]} items - The array to shuffle.
 * @returns {string[]} The same array instance, now shuffled in place.
 */
export function shuffleArray(items) {
  let currentIndex = items.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [items[currentIndex], items[randomIndex]] = [items[randomIndex], items[currentIndex]];
  }

  return items;
}
