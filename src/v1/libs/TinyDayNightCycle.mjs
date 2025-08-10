class TinyDayNightCycle {
  /** @type {number} */
  dayStart;
  /** @type {number} */
  nightStart;

  /** @type {string|null} */
  weather = null;

  currentMinutes = 0; // 0-1439
  currentSeason = 'summer';
  currentDay = 1;
  currentMonth = 1;
  currentYear = 1;

  /** @type {Object<number, number>} */
  monthDays = {
    1: 31, 2: 31, 3: 31, 4: 31, 5: 31, 6: 31,
    7: 31, 8: 31, 9: 31, 10: 31, 11: 31, 12: 31
  };

  /** Weather configs */
  weatherConfig = {
    default: {}, // General fallback probabilities
    day: {}, // Daytime probabilities
    night: {}, // Nighttime probabilities
    hours: {}, // Specific hours { "06:00-09:00": {...} }
    seasons: {} // Seasonal configs { summer: {...}, winter: {...} }
  };

  /** Dynamic weather system */
  weatherDuration = { min: 60, max: 180 }; // in minutes
  weatherTimeLeft = 0;

  /**
   * @param {number} dayStart - Hour of the day start (0-23)
   * @param {number} nightStart - Hour of the night start (0-23)
   */
  constructor(dayStart = 6, nightStart = 18) {
    this.dayStart = dayStart;
    this.nightStart = nightStart;
  }

  /** --------------------- TIME SYSTEM --------------------- */

  /**
   * Sets the internal time directly.
   * @param {number} hour - 0 to 23
   * @param {number} minute - 0 to 59
   */
  setTime(hour, minute = 0) {
    this.currentMinutes = (hour * 60 + minute) % 1440;
  }

  /**
   * Adds minutes/hours to the current time.
   * @param {number} hours
   * @param {number} minutes
   */
  addTime(hours = 0, minutes = 0) {
    let total = this.currentMinutes + hours * 60 + minutes;
    while (total >= 1440) {
      total -= 1440;
      this.nextDay();
    }
    while (total < 0) {
      total += 1440;
      this.prevDay();
    }
    this.currentMinutes = total;
    this.updateWeatherTimer(minutes + hours * 60);
  }

  /**
   * Returns current time as object and string.
   */
  getTime() {
    const hour = Math.floor(this.currentMinutes / 60);
    const minute = this.currentMinutes % 60;
    return {
      hour,
      minute,
      formatted: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    };
  }

  /**
   * Checks if it's currently day.
   */
  isDay() {
    if (this.dayStart < this.nightStart) {
      return (
        this.currentMinutes >= this.dayStart * 60 &&
        this.currentMinutes < this.nightStart * 60
      );
    } else {
      return (
        this.currentMinutes >= this.dayStart * 60 ||
        this.currentMinutes < this.nightStart * 60
      );
    }
  }

  /**
   * Returns minutes until day starts.
   */
  timeUntilDay() {
    return this.minutesUntil(this.dayStart);
  }

  /**
   * Returns minutes until night starts.
   */
  timeUntilNight() {
    return this.minutesUntil(this.nightStart);
  }

  /**
   * Internal helper to calculate minutes until given hour.
   * @param {number} targetHour
   */
  minutesUntil(targetHour) {
    const targetMinutes = targetHour * 60;
    let diff = targetMinutes - this.currentMinutes;
    if (diff <= 0) diff += 1440; // next day
    return diff;
  }

  /**
   * Sets time to start of day or night instantly.
   * @param {"day"|"night"} phase
   */
  setTo(phase) {
    if (phase === 'day') this.setTime(this.dayStart, 0);
    else if (phase === 'night') this.setTime(this.nightStart, 0);
  }

  /** --------------------- DAY/MONTH/YEAR SYSTEM --------------------- */
  
  /**
   * @param {Object} config
   */
  setMonthDaysConfig(config) {
    this.monthDays = { ...config };
  }

  nextDay() {
    this.currentDay++;
    if (this.currentDay > (this.monthDays[this.currentMonth] || 30)) {
      this.currentDay = 1;
      this.currentMonth++;
      if (this.currentMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      }
    }
    this.updateSeason();
  }

  prevDay() {
    this.currentDay--;
    if (this.currentDay < 1) {
      this.currentMonth--;
      if (this.currentMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      }
      this.currentDay = this.monthDays[this.currentMonth] || 30;
    }
    this.updateSeason();
  }

  updateSeason() {
    if ([12, 1, 2].includes(this.currentMonth)) this.currentSeason = 'winter';
    else if ([3, 4, 5].includes(this.currentMonth)) this.currentSeason = 'spring';
    else if ([6, 7, 8].includes(this.currentMonth)) this.currentSeason = 'summer';
    else this.currentSeason = 'autumn';
  }

  /** --------------------- WEATHER SYSTEM --------------------- */

  /**
   * Sets complex weather configuration.
   * @param {Object} config
   */
  setWeatherConfig(config) {
    this.weatherConfig = { ...this.weatherConfig, ...config };
  }

  /**
   * @param {number} minMinutes
   * @param {number} maxMinutes
   */
  setWeatherDuration(minMinutes, maxMinutes) {
    this.weatherDuration.min = minMinutes;
    this.weatherDuration.max = maxMinutes;
  }

  /** 
   * Call this whenever time passes 
   * @param {number} minutesPassed
   */
  updateWeatherTimer(minutesPassed) {
    this.weatherTimeLeft -= minutesPassed;
    if (this.weatherTimeLeft <= 0) {
      this.chooseNewWeather();
    }
  }

  /**
   * @param {string} type
   * @param {number|null} [duration=null]
   */
  forceWeather(type, duration = null) {
    this.weather = type;
    this.weatherTimeLeft =
      duration ?? this.randomInRange(this.weatherDuration.min, this.weatherDuration.max);
  }

  chooseNewWeather() {
    const { hour } = this.getTime();
    let probabilities = {};

    // Seasonal
    // @ts-ignore
    if (this.weatherConfig.seasons[this.currentSeason]) {
      // @ts-ignore
      probabilities = { ...probabilities, ...this.weatherConfig.seasons[this.currentSeason] };
    }

    // Day/Night
    if (this.isDay() && this.weatherConfig.day) {
      probabilities = { ...probabilities, ...this.weatherConfig.day };
    } else if (!this.isDay() && this.weatherConfig.night) {
      probabilities = { ...probabilities, ...this.weatherConfig.night };
    }

    // Specific hours
    for (const range in this.weatherConfig.hours) {
      const [start, end] = range.split('-').map(t => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + (m || 0);
      });
      const current = this.currentMinutes;
      const inRange = start <= end
        ? current >= start && current <= end
        : current >= start || current <= end;

      if (inRange) {
        // @ts-ignore
        probabilities = { ...probabilities, ...this.weatherConfig.hours[range] };
      }
    }

    // Default fallback
    probabilities = { ...this.weatherConfig.default, ...probabilities };

    // Pick random
    const entries = Object.entries(probabilities);
    if (!entries.length) {
      this.weather = null;
      return null;
    }
    const total = entries.reduce((sum, [, prob]) => sum + prob, 0);
    let rand = Math.random() * total;

    for (const [type, prob] of entries) {
      if (rand < prob) {
        this.weather = type;
        this.weatherTimeLeft = this.randomInRange(
          this.weatherDuration.min,
          this.weatherDuration.max
        );
        return type;
      }
      rand -= prob;
    }

    this.weather = null;
    return null;
  }

  /**
   * @param {number} min
   * @param {number} max
   */
  randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default TinyDayNightCycle;
