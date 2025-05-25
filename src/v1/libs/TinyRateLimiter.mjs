/**
 * Class representing a flexible rate limiter per user or group.
 *
 * This rate limiter supports limiting per user or per group by mapping
 * userIds to a common groupId. All users within the same group share
 * rate limits.
 */
class TinyRateLimiter {
  /**
   * @param {Object} options
   * @param {number} [options.maxHits] - Max interactions allowed
   * @param {number} [options.interval] - Time window in milliseconds
   * @param {number} [options.cleanupInterval] - Interval for automatic cleanup (ms)
   * @param {number} [options.maxIdle=300000] - Max idle time for a user before being cleaned (ms)
   */
  constructor({ maxHits, interval, cleanupInterval, maxIdle = 300000 }) {
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
    if (cleanupInterval !== undefined && !isCleanupValid)
      throw new Error("'cleanupInterval' must be a positive integer in milliseconds if defined.");
    if (!isMaxIdleValid) throw new Error("'maxIdle' must be a positive integer in milliseconds.");

    this.maxHits = isMaxHitsValid ? maxHits : null;
    this.interval = isIntervalValid ? interval : null;
    this.cleanupInterval = isCleanupValid ? cleanupInterval : null;
    this.maxIdle = maxIdle;

    /** @type {Map<string, number[]>} */
    this.groupData = new Map(); // groupId -> timestamps[]

    /** @type {Map<string, number>} */
    this.lastSeen = new Map(); // groupId -> timestamp

    /** @type {Map<string, string>} */
    this.userToGroup = new Map(); // userId -> groupId

    // Start automatic cleanup only if cleanupInterval is valid
    if (this.cleanupInterval !== null)
      this._cleanupTimer = setInterval(() => this._cleanup(), this.cleanupInterval);
  }

  /**
   * Assign a userId to a groupId
   * @param {string} userId
   * @param {string} groupId
   */
  assignToGroup(userId, groupId) {
    this.userToGroup.set(userId, groupId);
  }

  /**
   * Get the groupId for a given userId
   * @param {string} userId
   * @returns {string}
   */
  getGroupId(userId) {
    return this.userToGroup.get(userId) || userId; // fallback: use userId as own group
  }

  /**
   * Register a hit for a specific user
   * @param {string} userId
   */
  hit(userId) {
    const groupId = this.getGroupId(userId);
    const now = Date.now();

    if (!this.groupData.has(groupId)) {
      this.groupData.set(groupId, []);
    }

    const history = this.groupData.get(groupId);
    if (!history) throw new Error(`No data found for groupId: ${groupId}`);

    history.push(now);
    this.lastSeen.set(groupId, now);

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
      const maxHits = this.getMaxHits() + 1;
      if (history.length > maxHits) {
        history.splice(0, history.length - maxHits);
      }
    }
  }

  /**
   * Check if the user (via their group) is currently rate limited
   * @param {string} userId
   * @returns {boolean}
   */
  isRateLimited(userId) {
    const groupId = this.getGroupId(userId);
    const now = Date.now();

    if (!this.groupData.has(groupId)) return false;

    const history = this.groupData.get(groupId);
    if (!history) throw new Error(`No data found for groupId: ${groupId}`);

    if (this.interval !== null) {
      const recent = history.filter((t) => t > now - this.getInterval());
      if (this.maxHits !== null) {
        return recent.length > this.getMaxHits();
      }
      return recent.length > 0;
    }

    if (this.maxHits !== null) {
      return history.length > this.getMaxHits();
    }

    return false;
  }

  /**
   * Manually reset group data
   * @param {string} groupId
   */
  resetGroup(groupId) {
    this.groupData.delete(groupId);
    this.lastSeen.delete(groupId);
  }

  /**
   * Manually reset user data.
   *
   * @deprecated Use `resetUser(userId)` instead. This method will be removed in future versions.
   * @param {string} userId
   * @returns {void}
   */
  reset(userId) {
    return this.resetUser(userId);
  }

  /**
   * Manually reset a user mapping (and optionally clear their group data)
   * @param {string} userId
   * @param {boolean} [clearGroup=false]
   */
  resetUser(userId, clearGroup = false) {
    const groupId = this.userToGroup.get(userId);
    this.userToGroup.delete(userId);
    if (clearGroup && groupId) {
      this.resetGroup(groupId);
    }
  }

  /**
   * Set custom timestamps to a group
   * @param {string} groupId
   * @param {number[]} timestamps
   */
  setData(groupId, timestamps) {
    this.groupData.set(groupId, timestamps);
    this.lastSeen.set(groupId, Date.now());
  }

  /**
   * Check if a group has data
   * @param {string} groupId
   * @returns {boolean}
   */
  hasData(groupId) {
    return this.groupData.has(groupId);
  }

  /**
   * Get timestamps from a group
   * @param {string} groupId
   * @returns {number[]}
   */
  getData(groupId) {
    return this.groupData.get(groupId) || [];
  }

  /**
   * Cleanup old/inactive groups
   * @private
   */
  _cleanup() {
    const now = Date.now();
    for (const [groupId, last] of this.lastSeen.entries()) {
      if (now - last > this.maxIdle) {
        this.groupData.delete(groupId);
        this.lastSeen.delete(groupId);
      }
    }
  }

  /**
   * Get the interval window in milliseconds.
   * @returns {number}
   */
  getInterval() {
    if (typeof this.interval !== 'number' || !Number.isFinite(this.interval)) {
      throw new Error("'interval' is not a valid finite number.");
    }
    return this.interval;
  }

  /**
   * Get the maximum number of allowed hits.
   * @returns {number}
   */
  getMaxHits() {
    if (typeof this.maxHits !== 'number' || !Number.isFinite(this.maxHits)) {
      throw new Error("'maxHits' is not a valid finite number.");
    }
    return this.maxHits;
  }

  /**
   * Destroy the rate limiter, stopping cleanup and clearing data
   */
  destroy() {
    if (this._cleanupTimer) clearInterval(this._cleanupTimer);
    this.groupData.clear();
    this.lastSeen.clear();
    this.userToGroup.clear();
  }
}

export default TinyRateLimiter;
