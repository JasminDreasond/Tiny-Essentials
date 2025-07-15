import moment from 'moment';

/**
 * Calculates the time duration between the current time and a given time offset.
 *
 * @param {number} timeData - The time offset in milliseconds. Can be positive or negative.
 * @param {string} [durationType='asSeconds'] - The type of duration to return. Default is `'asSeconds'`. Can be any valid moment.js duration type (e.g., `'asMilliseconds'`, `'asMinutes'`, `'asHours'`, etc.).
 * @param {moment.Moment|null} [now=null] - The moment object representing the current date and time. Defaults to the current date and time if not provided.
 * @returns {number|null} The calculated duration in the specified unit (default: seconds), or `null` if `timeData` is not provided.
 * @deprecated
 */
export default function timeDuration(timeData = 0, durationType = 'asSeconds', now = null) {
  // Number
  if (typeof timeData !== 'undefined') {
    if (!now) now = moment();

    var duration = moment.duration(now.clone().add(timeData, 'milliseconds').diff(now.clone()));
    // @ts-ignore
    const result = duration[durationType]();

    // Complete
    return result;
  }

  // Nope
  else return null;
}
