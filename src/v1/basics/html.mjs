/**
 * Checks if two DOM elements are colliding on the screen.
 *
 * @param {Element} elem1 - First DOM element.
 * @param {Element} elem2 - Second DOM element.
 * @returns {boolean} - Returns true if the elements are colliding.
 */
export function areElementsColliding(elem1, elem2) {
  const rect1 = elem1.getBoundingClientRect();
  const rect2 = elem2.getBoundingClientRect();

  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}
