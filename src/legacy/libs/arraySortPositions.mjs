export default function arraySortPositions(item, isReverse = false) {
  if (!isReverse) {
    return function (a, b) {
      return a[item] < b[item] ? -1 : a[item] > b[item] ? 1 : 0;
    };
  } else {
    return function (a, b) {
      return a[item] > b[item] ? -1 : a[item] < b[item] ? 1 : 0;
    };
  }
}
