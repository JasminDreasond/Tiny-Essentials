/**
 * Callback used to dynamically calculate weather probabilities.
 *
 * @callback WeatherCallback
 * @param {Object} configs - Contextual information about the current time and weather state.
 * @param {number} configs.hour - Current in-game hour (0–23).
 * @param {number} configs.minute - Current in-game minute (0–59).
 * @param {number} configs.currentMinutes - Minutes since midnight (0–1439).
 * @param {boolean} configs.isDay - Whether it's currently daytime.
 * @param {Season} configs.season - Current season.
 * @param {string|null} configs.weather - Current active weather type or null if none.
 * @returns {number} Probability weight for the weather type.
 */

/**
 * A weather configuration object mapping weather types to probability weights
 * or dynamic WeatherCallback functions.
 *
 * @typedef {Record<string, number | WeatherCallback>} WeatherCfg
 */

/**
 * Weather data with resolved numeric probability values.
 *
 * @typedef {Record<string, number>} WeatherData
 */

/**
 * Supported season values.
 * @typedef {'winter'|'spring'|'summer'|'autumn'} Season
 */

/**
 * Represents the data for a moon's current phase.
 *
 * @typedef {Object} MoonData
 * @property {string} name - The name of the moon.
 * @property {number} phaseIndex - The current phase index (zero-based) within the moon's cycle.
 * @property {string} phaseName - The descriptive name of the current phase.
 * @property {number} cycleLength - The total number of phases/days in the moon's full cycle.
 */

/**
 * TinyDayNightCycle — A time, date, moon-phase, and weather simulation system.
 *
 * This class provides:
 * - Customizable day/night cycle with variable sunrise/sunset.
 * - Calendar system with adjustable month lengths.
 * - Dynamic weather with multiple configurable probability layers.
 * - Multi-moon phase tracking.
 *
 * Time and date calculations are independent from the real world and can run at any speed.
 */
class TinyDayNightCycle {
  /**
   * @type {number} Hour of the day start (0–23).
   */
  #dayStart;
  /**
   * @type {number} Hour of the night start (0–23).
   */
  #nightStart;

  /**
   * @type {string|null} Currently active weather type.
   */
  #weather = null;

  /**
   * @type {number} Current time in seconds since midnight (0–86399).
   */
  #currentSeconds = 0;

  /**
   * @type {number} Current time in minutes since midnight (0–1439).
   */
  #currentMinutes = 0; // 0-1439

  /**
   * @type {Season} Current season.
   */
  #currentSeason = 'summer';

  /**
   * Current day of the month.
   * @type {number}
   */
  #currentDay = 1;

  /**
   * Current month number (1–12).
   * @type {number}
   */
  #currentMonth = 1;

  /**
   * Current year count.
   * @type {number}
   */
  #currentYear = 1;

  /**
   * Number of days in each month. Keys are month numbers (1–12).
   * Can be customized to any structure.
   * @type {Object<number, number>}
   */
  #monthDays = {
    1: 31,
    2: 31,
    3: 31,
    4: 31,
    5: 31,
    6: 31,
    7: 31,
    8: 31,
    9: 31,
    10: 31,
    11: 31,
    12: 31,
  };

  /**
   * Weather configuration layers:
   * - `default`: Global fallback probabilities.
   * - `day` / `night`: Applied depending on time of day.
   * - `hours`: Specific time ranges (e.g. "06:00-09:00").
   * - `seasons`: Seasonal weather overrides.
   */
  #weatherConfig = {
    /**
     * General fallback probabilities
     * @type {WeatherCfg}
     */
    default: {},
    /**
     * Daytime probabilities
     * @type {WeatherCfg}
     */
    day: {},
    /**
     * Nighttime probabilities
     * @type {WeatherCfg}
     */
    night: {},
    /**
     * Specific hours { "06:00-09:00": {...} }
     * @type {Record<string, WeatherCfg>}
     */
    hours: {},
    /**
     * Seasonal configs { summer: {...}, winter: {...} }
     * @type {Record<string, WeatherCfg>}
     */
    seasons: {},
  };

  /**
   * Duration range for each weather type in minutes.
   * @type {{min: number, max: number}}
   */
  #weatherDuration = { min: 60, max: 180 }; // in minutes

  /**
   * Minutes remaining until the current weather changes.
   * @type {number}
   */
  #weatherTimeLeft = 0;

  /**
   * @param {number} dayStart - Hour of the day start (0-23)
   * @param {number} nightStart - Hour of the night start (0-23)
   */
  constructor(dayStart = 6, nightStart = 18) {
    this.#dayStart = dayStart;
    this.#nightStart = nightStart;
  }

  /** --------------------- TIME SYSTEM --------------------- */

  /**
   * Sets the internal time directly.
   * @param {number} hour - 0 to 23
   * @param {number} minute - 0 to 59
   * @param {number} second - 0 to 59
   */
  setTime(hour, minute = 0, second = 0) {
    this.currentSeconds = (hour * 3600 + minute * 60 + second) % 86400;
  }

  /**
   * Adds time to the current clock.
   * @param {number} hours
   * @param {number} minutes
   * @param {number} seconds
   */
  addTime(hours = 0, minutes = 0, seconds = 0) {
    let total = this.currentSeconds + hours * 3600 + minutes * 60 + seconds;

    while (total >= 86400) {
      total -= 86400;
      this.nextDay();
    }
    while (total < 0) {
      total += 86400;
      this.prevDay();
    }

    this.currentSeconds = total;
    this.updateWeatherTimer((hours * 3600 + minutes * 60 + seconds) / 60); // ainda em minutos para compatibilidade
  }

  /**
   * Returns current time as object and string.
   * @param {boolean} [withSeconds=true] - Whether to include seconds in the formatted string.
   * @returns {{
   *   hour: number,
   *   minute: number,
   *   second: number,
   *   formatted: string
   * }} An object containing the hour, minute, second, and a formatted time string.
   */
  getTime(withSeconds = true) {
    const hour = Math.floor(this.currentSeconds / 3600);
    const minute = Math.floor((this.currentSeconds % 3600) / 60);
    const second = this.currentSeconds % 60;

    return {
      hour,
      minute,
      second,
      formatted:
        `${hour.toString().padStart(2, '0')}:` +
        `${minute.toString().padStart(2, '0')}` +
        `${withSeconds ? `:${second.toString().padStart(2, '0')}` : ''}`,
    };
  }

  /**
   * Determines whether the current time is considered day.
   * Day is defined as the period between `dayStart` and `nightStart`.
   * @returns {boolean} True if current time is day, false otherwise.
   */
  isDay() {
    if (this.#dayStart < this.#nightStart) {
      return (
        this.#currentMinutes >= this.#dayStart * 60 && this.#currentMinutes < this.#nightStart * 60
      );
    } else {
      return (
        this.#currentMinutes >= this.#dayStart * 60 || this.#currentMinutes < this.#nightStart * 60
      );
    }
  }

  /**
   * Calculates the number of minutes until the next day period starts.
   * @returns {number} Minutes until day start.
   */
  minutesUntilDay() {
    return this.timeUntil(this.#dayStart, 'minutes');
  }

  /**
   * Calculates the number of seconds until the next day period starts.
   * @returns {number} Seconds until day start.
   */
  secondsUntilDay() {
    return this.timeUntil(this.#dayStart, 'seconds');
  }

  /**
   * Calculates the number of hours until the next day period starts.
   * @returns {number} Hours until day start.
   */
  hoursUntilDay() {
    return this.timeUntil(this.#dayStart, 'hours');
  }

  /**
   * Calculates the number of minutes until the next night period starts.
   * @returns {number} Minutes until night start.
   */
  minutesUntilNight() {
    return this.timeUntil(this.#nightStart, 'minutes');
  }

  /**
   * Calculates the number of seconds until the next night period starts.
   * @returns {number} Seconds until night start.
   */
  secondsUntilNight() {
    return this.timeUntil(this.#nightStart, 'seconds');
  }

  /**
   * Calculates the number of hours until the next night period starts.
   * @returns {number} Hours until night start.
   */
  hoursUntilNight() {
    return this.timeUntil(this.#nightStart, 'hours');
  }

  /**
   * Helper method to calculate time until a specified hour.
   * Works in seconds internally for higher precision.
   * Wraps around if target hour is earlier than current time.
   * Supports returning time in minutes, seconds, or hours.
   *
   * @param {number} targetHour - The target hour (0–23).
   * @param {'minutes'|'seconds'|'hours'} unit - The unit to return.
   * @returns {number} Time until target hour, in the specified unit.
   */
  timeUntil(targetHour, unit) {
    const targetSeconds = targetHour * 3600; // 1 hour = 3600 seconds
    let diffSeconds = targetSeconds - this.#currentSeconds;
    if (diffSeconds <= 0) diffSeconds += 86400; // 24h = 86400 seconds (wrap to next day)

    switch (unit) {
      case 'minutes':
        return diffSeconds / 60;
      case 'hours':
        return diffSeconds / 3600;
      case 'seconds':
      default:
        return diffSeconds;
    }
  }

  /**
   * Instantly sets the current time to the start of the specified phase.
   * @param {"day"|"night"} phase - The phase to set the time to.
   */
  setTo(phase) {
    if (phase === 'day') this.setTime(this.#dayStart, 0);
    else if (phase === 'night') this.setTime(this.#nightStart, 0);
  }

  /** --------------------- DAY/MONTH/YEAR SYSTEM --------------------- */

  /**
   * Sets a custom configuration for the number of days in each month.
   * This allows for non-standard calendar systems.
   * @param {Object<number, number>} config - An object where keys are month numbers (1-12) and values are the number of days.
   */
  setMonthDaysConfig(config) {
    this.#monthDays = { ...config };
  }

  /**
   * Advances the current date by one day.
   * Automatically wraps months and years based on the configured month days.
   * Also updates the season and advances moon phases by 1.
   * @param {number} [amount=1] - Number of days to move forward.
   */
  nextDay(amount = 1) {
    for (let i = 0; i < amount; i++) {
      this.#currentDay++;
      if (this.#currentDay > (this.#monthDays[this.#currentMonth] || 30)) {
        this.#currentDay = 1;
        this.#currentMonth++;
        if (this.#currentMonth > 12) {
          this.#currentMonth = 1;
          this.#currentYear++;
        }
      }
      this.updateSeason();
      this.advanceMoons(1);
    }
  }

  /**
   * Moves the current date backward by one day.
   * Automatically wraps months and years based on the configured month days.
   * Also updates the season and rewinds moon phases by 1.
   * @param {number} [amount=1] - Number of days to move forward.
   */
  prevDay(amount = 1) {
    for (let i = 0; i < amount; i++) {
      this.#currentDay--;
      if (this.#currentDay < 1) {
        this.#currentMonth--;
        if (this.#currentMonth < 1) {
          this.#currentMonth = 12;
          this.#currentYear--;
        }
        this.#currentDay = this.#monthDays[this.#currentMonth] || 30;
      }
      this.updateSeason();
      this.rewindMoons(1);
    }
  }

  /**
   * Updates the current season based on the month.
   * Default mapping:
   * - Winter: Dec, Jan, Feb
   * - Spring: Mar, Apr, May
   * - Summer: Jun, Jul, Aug
   * - Autumn: Sep, Oct, Nov
   */
  updateSeason() {
    if ([12, 1, 2].includes(this.#currentMonth)) this.#currentSeason = 'winter';
    else if ([3, 4, 5].includes(this.#currentMonth)) this.#currentSeason = 'spring';
    else if ([6, 7, 8].includes(this.#currentMonth)) this.#currentSeason = 'summer';
    else this.#currentSeason = 'autumn';
  }

  /** --------------------- WEATHER SYSTEM --------------------- */

  /**
   * Sets the weather configuration.
   * @param {{ default: WeatherCfg; day: WeatherCfg; night: WeatherCfg; hours: Record<string, WeatherCfg>; seasons: Record<string, WeatherCfg>; }} config
   * An object defining default probabilities, time-based probabilities, day/night differences, and seasonal probabilities.
   */
  setWeatherConfig(config) {
    this.#weatherConfig = { ...this.#weatherConfig, ...config };
  }

  /**
   * Sets the minimum and maximum duration for any weather type.
   * @param {number} minMinutes - Minimum duration in minutes.
   * @param {number} maxMinutes - Maximum duration in minutes.
   */
  setWeatherDuration(minMinutes, maxMinutes) {
    this.#weatherDuration.min = minMinutes;
    this.#weatherDuration.max = maxMinutes;
  }

  /**
   * Updates the remaining time for the current weather.
   * Automatically selects a new weather type if time runs out.
   * @param {number} minutesPassed - Number of in-game minutes passed since last update.
   */
  updateWeatherTimer(minutesPassed) {
    this.#weatherTimeLeft -= minutesPassed;
    if (this.#weatherTimeLeft <= 0) {
      this.chooseNewWeather();
    }
  }

  /**
   * Forces the weather to a specific type, optionally for a given duration.
   * @param {string} type - The weather type (e.g., "sunny", "rain", "storm").
   * @param {number|null} [duration=null] - Duration in minutes. If null, a random duration is used.
   */
  forceWeather(type, duration = null) {
    this.#weather = type;
    this.#weatherTimeLeft =
      duration ?? this._randomInRange(this.#weatherDuration.min, this.#weatherDuration.max);
  }

  /**
   * Chooses a new weather type based on configured probabilities.
   * Probabilities can come from:
   * - Default settings
   * - Hour-based ranges
   * - Day/night differences
   * - Seasonal settings
   * - Custom overrides passed as parameter
   * If a value is a function, it will be executed with contextual data and must return a number.
   * @param {WeatherCfg} [customWeather] - Optional weather probability overrides.
   * @returns {string|null} - The selected weather type, or null if none selected.
   */
  chooseNewWeather(customWeather) {
    /** @type {WeatherData} */
    let probabilities = {};

    /**
     * Helper: Add probability or initialize
     * @param {WeatherCfg} source
     */
    const addProbabilities = (source) => {
      for (const [key, value] of Object.entries(source)) {
        let resolvedValue = value;

        // If it's a function, call it
        if (typeof resolvedValue === 'function') {
          resolvedValue = resolvedValue({
            hour: Math.floor(this.#currentMinutes / 60),
            minute: this.#currentMinutes % 60,
            currentMinutes: this.#currentMinutes,
            isDay: this.isDay(),
            season: this.#currentSeason,
            weather: this.#weather,
          });
        }

        // Only add if it's a number
        if (typeof resolvedValue === 'number' && !isNaN(resolvedValue)) {
          probabilities[key] = (probabilities[key] || 0) + resolvedValue;
        }
      }
    };

    // 1. Default fallback
    addProbabilities(this.#weatherConfig.default || {});

    // 2. Specific hours
    for (const range in this.#weatherConfig.hours) {
      const [start, end] = range.split('-').map((t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + (m || 0);
      });
      const current = this.#currentMinutes;
      const inRange =
        start <= end ? current >= start && current <= end : current >= start || current <= end;

      if (inRange) {
        addProbabilities(this.#weatherConfig.hours[range]);
      }
    }

    // 3. Day/Night
    if (this.isDay() && this.#weatherConfig.day) {
      addProbabilities(this.#weatherConfig.day);
    } else if (!this.isDay() && this.#weatherConfig.night) {
      addProbabilities(this.#weatherConfig.night);
    }

    // 4. Seasonal
    if (this.#weatherConfig.seasons?.[this.#currentSeason]) {
      addProbabilities(this.#weatherConfig.seasons[this.#currentSeason]);
    }

    // 5. Custom weather passed directly
    if (customWeather && typeof customWeather === 'object') {
      addProbabilities(customWeather);
    }

    // Pick random based on final probabilities
    const entries = Object.entries(probabilities).filter(([, prob]) => prob > 0);
    if (!entries.length) {
      this.#weather = null;
      return null;
    }

    const total = entries.reduce((sum, [, prob]) => sum + prob, 0);
    let rand = Math.random() * total;

    for (const [type, prob] of entries) {
      if (rand < prob) {
        this.#weather = type;
        this.#weatherTimeLeft = this._randomInRange(
          this.#weatherDuration.min,
          this.#weatherDuration.max,
        );
        return type;
      }
      rand -= prob;
    }

    this.#weather = null;
    return null;
  }

  /**
   * Returns a random integer between min and max, inclusive.
   * @param {number} min - Minimum value.
   * @param {number} max - Maximum value.
   * @returns {number} - A random integer between min and max.
   */
  _randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** --------------------- MOON SYSTEM --------------------- */

  /**
   * Array of tracked moons with independent phases.
   * @type {Array<{name: string, cycleLength: number, currentPhase: number, phaseNames?: string[]}>}
   */
  moons = [];

  /**
   * Add a new moon to the system.
   * @param {string} name - Name of the moon.
   * @param {number} cycleLength - Number of days in cycle.
   * @param {string[]} phaseNames - Optional list of phase names.
   * @param {number} [startingPhase=0] - Initial phase.
   */
  addMoon(name, cycleLength, phaseNames, startingPhase = 0) {
    const length = Math.max(1, cycleLength);
    this.moons.push({
      name,
      cycleLength: length,
      currentPhase: ((startingPhase % length) + length) % length,
      phaseNames,
    });
  }

  /**
   * Remove a moon by name.
   * @param {string} name
   */
  removeMoon(name) {
    this.moons = this.moons.filter((m) => m.name !== name);
  }

  /**
   * Advance all moons in a number of days.
   * @param {number} days
   */
  advanceMoons(days = 1) {
    for (const moon of this.moons) {
      moon.currentPhase = (moon.currentPhase + days) % moon.cycleLength;
    }
  }

  /**
   * Retrocede all moons in a number of days.
   * @param {number} days
   */
  rewindMoons(days = 1) {
    for (const moon of this.moons) {
      moon.currentPhase = (moon.currentPhase - days + moon.cycleLength) % moon.cycleLength;
    }
  }

  /**
   * Returns all moons with their current phase details.
   * @returns {MoonData[]} Array of moons including their name, current phase index, phase name, and cycle length.
   */
  getMoons() {
    return this.moons.map((moon) => ({
      name: moon.name,
      phaseIndex: moon.currentPhase,
      phaseName: moon.phaseNames
        ? (moon.phaseNames[moon.currentPhase] ?? String(moon.currentPhase))
        : String(moon.currentPhase),
      cycleLength: moon.cycleLength,
    }));
  }

  /**
   * Gets the current time in seconds since midnight.
   * @returns {number} Current seconds (0 to 86399).
   */
  get currentSeconds() {
    return this.#currentSeconds;
  }

  /**
   * Sets the current time in seconds since midnight.
   * Also updates the currentMinutes property accordingly.
   * @param {number} value - Current seconds since midnight (0 to 86399).
   */
  set currentSeconds(value) {
    this.#currentSeconds = value;

    // Update currentMinutes rounding down
    this.#currentMinutes = Math.floor(value / 60);
  }

  /**
   * Gets the current time in minutes since midnight.
   * @returns {number} Current minutes (0 to 1439).
   */
  get currentMinutes() {
    return this.#currentMinutes;
  }

  /**
   * Sets the current time in minutes since midnight.
   * Also updates the currentSeconds property accordingly (seconds set to zero).
   * @param {number} value - Current minutes since midnight (0 to 1439).
   */
  set currentMinutes(value) {
    this.#currentMinutes = value;
    this.#currentSeconds = value * 60; // assumes zero seconds in the minute
  }
}

export default TinyDayNightCycle;
