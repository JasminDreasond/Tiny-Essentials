// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

/**
 * Randomly shuffles the elements of an array in place using the Fisher–Yates algorithm.
 *
 * This implementation ensures a uniform distribution of permutations.
 * Original algorithm source: StackOverflow (link above).
 *
 * @param {any[]} items - The array to shuffle.
 * @returns {any[]} The same array instance, now shuffled in place.
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

/**
 * Generates an array with repeated phases according to counts.
 *
 * @param {string[]} phases - Array of phase names, e.g., ['Full', 'Half1', 'Half2', 'New'].
 * @param {number[]} counts - Array of integers specifying how many times to repeat each phase, e.g., [4,5,5,4].
 * @returns {string[]} - Flattened array containing phases repeated according to counts, concatenated in order.
 */
export function multiplyArrayBlocks(phases, counts) {
  // phases: array de strings, cada fase (ex: ['Full', 'Half1', 'Half2', 'New'])
  // counts: array de inteiros, quantas vezes repetir cada fase (ex: [4,5,5,4])

  const result = [];
  for (let i = 0; i < phases.length; i++) {
    for (let j = 0; j < counts[i]; j++) {
      result.push(phases[i]);
    }
  }
  return result;
}

/**
 * Diff two class lists.
 * @param {any[]} oldClasses
 * @param {any[]} newClasses
 */
export function diffArrayList(oldClasses, newClasses) {
  const removed = oldClasses.filter((c) => !newClasses.includes(c));
  const added = newClasses.filter((c) => !oldClasses.includes(c));
  return { added, removed };
}
