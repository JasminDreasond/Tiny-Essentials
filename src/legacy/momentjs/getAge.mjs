import moment from 'moment';

/**
 * Calculates the age based on the given date.
 *
 * @param {number|string} timeData - The birth date in a format accepted by moment.js (e.g., Unix timestamp, ISO 8601 string, etc.).
 * @param {moment.Moment|null} [now=null] - The moment object representing the current date. Defaults to the current date and time if not provided.
 * @returns {number|null} The age in years, or null if `timeData` is not provided.
 * @deprecated
 */
export default function getAge(timeData = 0, now = null) {
  // Number
  if (typeof timeData !== 'undefined') {
    if (!now) now = moment();

    const birthday = moment(timeData);
    const age = Math.abs(birthday.diff(now, 'years'));
    return age;
  }

  // Nope
  else {
    return null;
  }
}
