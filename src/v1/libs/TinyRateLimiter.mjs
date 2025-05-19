/**
 * Class representing a flexible rate limiter per user.
 *
 * This rate limiter can be configured by maximum number of hits,
 * time interval, or a combination of both. It supports automatic
 * cleanup of inactive users to optimize memory usage.
 *
 * @class
 */
class TinyRateLimiter {
  /**
   * @param {Object} options
   * @param {number} [options.maxHits] - Max interactions allowed
   * @param {number} [options.interval] - Time window in milliseconds
   * @param {number} [options.cleanupInterval=60000] - Interval for automatic cleanup (ms)
   * @param {number} [options.maxIdle=300000] - Max idle time for a user before being cleaned (ms)
   */
  constructor({ maxHits, interval, cleanupInterval = 60000, maxIdle = 300000 }) {
    /** @param {number|undefined} val */
    const isPositiveInteger = (val) =>
      typeof val === 'number' && Number.isFinite(val) && val >= 1 && Number.isInteger(val);

    const isMaxHitsValid = isPositiveInteger(maxHits);
    const isIntervalValid = isPositiveInteger(interval);
    const isCleanupValid = isPositiveInteger(cleanupInterval);
    const isMaxIdleValid = isPositiveInteger(maxIdle);

    if (!isMaxHitsValid && !isIntervalValid)
      throw new Error("RateLimiter requires at least one valid option: 'maxHits' or 'interval'.");
    if (maxHits !== undefined && !isMaxHitsValid)
      throw new Error("'maxHits' must be a positive integer if defined.");
    if (interval !== undefined && !isIntervalValid)
      throw new Error("'interval' must be a positive integer in milliseconds if defined.");
    if (!isCleanupValid)
      throw new Error("'cleanupInterval' must be a positive integer in milliseconds.");
    if (!isMaxIdleValid) throw new Error("'maxIdle' must be a positive integer in milliseconds.");

    this.maxHits = isMaxHitsValid ? maxHits : null;
    this.interval = isIntervalValid ? interval : null;
    this.cleanupInterval = cleanupInterval;
    this.maxIdle = maxIdle;

    /** @type {Map<string, number[]>} */
    this.userData = new Map();

    /** @type {Map<string, number>} */
    this.lastSeen = new Map();

    // Start automatic cleanup
    this._cleanupTimer = setInterval(() => this._cleanup(), this.cleanupInterval);
  }

  /**
   * Get the interval window in milliseconds.
   *
   * @returns {number} The interval value.
   * @throws {Error} If interval is not a valid finite number.
   */
  getInterval() {
    if (typeof this.interval !== 'number' || !Number.isFinite(this.interval))
      throw new Error("'interval' is not a valid finite number.");
    return this.interval;
  }

  /**
   * Get the maximum number of allowed hits.
   *
   * @returns {number} The maxHits value.
   * @throws {Error} If maxHits is not a valid finite number.
   */
  getMaxHits() {
    if (typeof this.maxHits !== 'number' || !Number.isFinite(this.maxHits)) {
      throw new Error("'maxHits' is not a valid finite number.");
    }
    return this.maxHits;
  }

  /**
   * Register a hit for a specific user
   * @param {string} userId
   */
  hit(userId) {
    const now = Date.now();

    if (!this.userData.has(userId)) {
      this.userData.set(userId, []);
    }

    const history = this.userData.get(userId);
    if (!history) throw new Error(`No data found for userId: ${userId}`);

    history.push(now);
    this.lastSeen.set(userId, now);

    // Clean up old entries
    if (this.interval !== null) {
      const interval = this.getInterval();
      const cutoff = now - interval;
      while (history.length && history[0] < cutoff) {
        history.shift();
      }
    }

    // Optional: keep only the last N entries for memory optimization
    if (this.maxHits !== null) {
      const maxHits = this.getMaxHits();
      if (history.length > maxHits) {
        history.splice(0, history.length - maxHits);
      }
    }
  }

  /**
   * Check if the user is currently rate limited
   * @param {string} userId
   * @returns {boolean}
   */
  isRateLimited(userId) {
    const now = Date.now();

    if (!this.userData.has(userId)) return false;

    const history = this.userData.get(userId);
    if (!history) throw new Error(`No data found for userId: ${userId}`);

    if (this.interval !== null) {
      const interval = this.getInterval();
      const recent = history.filter((t) => t > now - interval);
      if (this.maxHits !== null) {
        return recent.length >= this.getMaxHits();
      }
      return recent.length > 0;
    }

    if (this.maxHits !== null) {
      return history.length >= this.getMaxHits();
    }

    return false;
  }

  /**
   * Manually reset user data
   * @param {string} userId
   */
  reset(userId) {
    this.userData.delete(userId);
    this.lastSeen.delete(userId);
  }

  /**
   * Set hit timestamps for a user
   * @param {string} userId
   * @param {number[]} timestamps
   */
  setData(userId, timestamps) {
    this.userData.set(userId, timestamps);
    this.lastSeen.set(userId, Date.now());
  }

  /**
   * Get timestamps from user
   * @param {string} userId
   * @returns {number[]}
   */
  getData(userId) {
    return this.userData.get(userId) || [];
  }

  /**
   * Cleanup old/inactive users
   * @private
   */
  _cleanup() {
    const now = Date.now();
    for (const [userId, last] of this.lastSeen.entries()) {
      if (now - last > this.maxIdle) {
        this.userData.delete(userId);
        this.lastSeen.delete(userId);
      }
    }
  }

  /**
   * Destroy the rate limiter, stopping all intervals
   */
  destroy() {
    clearInterval(this._cleanupTimer);
    this.userData.clear();
    this.lastSeen.clear();
  }
}

export default TinyRateLimiter;
