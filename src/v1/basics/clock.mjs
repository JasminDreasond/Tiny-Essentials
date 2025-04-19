/**
 * Calculates the time duration between the current time and a given time offset.
 *
 * @param {Date} timeData - The target time as a Date object.
 * @param {string} [durationType='asSeconds'] - The type of duration to return. Can be 'asMilliseconds', 'asSeconds', 'asMinutes', 'asHours', 'asDays'.
 * @param {Date|null} [now=null] - The current time as a Date object. Defaults to the current date and time if not provided.
 * @returns {number|null} The calculated duration in the specified unit, or `null` if `timeData` is not provided.
 */
export function getTimeDuration(timeData = new Date(), durationType = 'asSeconds', now = null) {
  if (timeData instanceof Date) {
    const currentTime = now instanceof Date ? now : new Date();
    const diffMs = timeData - currentTime;

    switch (durationType) {
      case 'asMilliseconds':
        return diffMs;
      case 'asSeconds':
        return diffMs / 1000;
      case 'asMinutes':
        return diffMs / (1000 * 60);
      case 'asHours':
        return diffMs / (1000 * 60 * 60);
      case 'asDays':
        return diffMs / (1000 * 60 * 60 * 24);
      default:
        return diffMs / 1000; // default to seconds
    }
  }

  return null;
}

/**
 * Formats a custom timer string based on total seconds and a detail level.
 * Includes proper reallocation of lower units into higher ones, ensuring consistent hierarchy.
 *
 * @param {number} totalSeconds - The total amount of seconds to convert.
 * @param {'seconds'|'minutes'|'hours'|'days'|'months'|'years'} level - The highest level to calculate and display.
 * @param {string} [format='{time}'] - Output template with placeholders like {years}, {months}, {days}, {hours}, {minutes}, {seconds}, {time}, {total}.
 * @returns {string} The formatted timer string.
 */
export function formatCustomTimer(totalSeconds, level = 'seconds', format = '{time}') {
  totalSeconds = Math.max(0, Math.floor(totalSeconds));

  const levels = ['seconds', 'minutes', 'hours', 'days', 'months', 'years'];
  const index = levels.indexOf(level);

  const include = {
    years: index >= 5,
    months: index >= 4,
    days: index >= 3,
    hours: index >= 2,
    minutes: index >= 1,
    seconds: index >= 0,
  };

  const parts = {
    years: include.years ? 0 : NaN,
    months: include.months ? 0 : NaN,
    days: include.days ? 0 : NaN,
    hours: include.hours ? 0 : NaN,
    minutes: include.minutes ? 0 : NaN,
    seconds: include.seconds ? 0 : NaN,
    total: NaN,
  };

  let remaining = totalSeconds;

  if (include.years || include.months || include.days) {
    const baseDate = new Date(1980, 0, 1);
    const targetDate = new Date(baseDate.getTime() + remaining * 1000);
    const workingDate = new Date(baseDate);

    // Years
    if (include.years) {
      while (
        new Date(workingDate.getFullYear() + 1, workingDate.getMonth(), workingDate.getDate()) <=
        targetDate
      ) {
        workingDate.setFullYear(workingDate.getFullYear() + 1);
        parts.years++;
      }
    }

    // Months
    if (include.months) {
      while (
        new Date(workingDate.getFullYear(), workingDate.getMonth() + 1, workingDate.getDate()) <=
        targetDate
      ) {
        workingDate.setMonth(workingDate.getMonth() + 1);
        parts.months++;
      }
    }

    // Days
    if (include.days) {
      while (
        new Date(workingDate.getFullYear(), workingDate.getMonth(), workingDate.getDate() + 1) <=
        targetDate
      ) {
        workingDate.setDate(workingDate.getDate() + 1);
        parts.days++;
      }
    }

    remaining = Math.floor((targetDate - workingDate) / 1000);
  }

  if (include.hours) {
    parts.hours = Math.floor(remaining / 3600);
    remaining %= 3600;
  }

  if (include.minutes) {
    parts.minutes = Math.floor(remaining / 60);
    remaining %= 60;
  }

  if (include.seconds) {
    parts.seconds = remaining;
  }

  // Calculate total
  const totalMap = {
    seconds: include.seconds ? totalSeconds : NaN,
    minutes: include.minutes ? totalSeconds / 60 : NaN,
    hours: include.hours ? totalSeconds / 3600 : NaN,
    days: include.days ? totalSeconds / 86400 : NaN,
    months: include.months ? parts.years * 12 + parts.months + (parts.days || 0) / 30 : NaN,
    years: include.years ? parts.years + (parts.months || 0) / 12 + (parts.days || 0) / 365 : NaN,
  };

  parts.total = +(totalMap[level] || 0).toFixed(2).replace(/\.00$/, '');

  const pad = (n) => (isNaN(n) ? 'NaN' : String(n).padStart(2, '0'));

  const timeString = [
    include.hours ? pad(parts.hours) : null,
    include.minutes ? pad(parts.minutes) : null,
    include.seconds ? pad(parts.seconds) : null,
  ]
    .filter((v) => v !== null)
    .join(':');

  return format
    .replace(/\{years\}/g, parts.years)
    .replace(/\{months\}/g, parts.months)
    .replace(/\{days\}/g, parts.days)
    .replace(/\{hours\}/g, pad(parts.hours))
    .replace(/\{minutes\}/g, pad(parts.minutes))
    .replace(/\{seconds\}/g, pad(parts.seconds))
    .replace(/\{time\}/g, timeString)
    .replace(/\{total\}/g, parts.total)
    .trim();
}

/**
 * Formats a duration (in seconds) into a timer string showing only hours, minutes, and seconds.
 *
 * Example output: "05:32:10"
 *
 * @param {number} seconds - The total number of seconds to format.
 * @returns {string} The formatted timer string in "HH:MM:SS" format.
 */
export function formatTimer(seconds) {
  return formatCustomTimer(seconds, 'hours', '{hours}:{minutes}:{seconds}');
}

/**
 * Formats a duration (in seconds) into a timer string including days, hours, minutes, and seconds.
 *
 * Example output: "2d 05:32:10"
 *
 * @param {number} seconds - The total number of seconds to format.
 * @returns {string} The formatted timer string in "Xd HH:MM:SS" format.
 */
export function formatDayTimer(seconds) {
  return formatCustomTimer(seconds, 'days', '{days}d {hours}:{minutes}:{seconds}');
}
