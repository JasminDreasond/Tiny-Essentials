/** @typedef {(groupId: string) => void} OnMemoryExceeded */

/**
 * Class representing a flexible rate limiter per user or group.
 *
 * This rate limiter supports limiting per user or per group by mapping
 * userIds to a common groupId. All users within the same group share
 * rate limits.
 */
class TinyRateLimiter {
  /** @type {number|null} */
  #maxMemory = null;

  /**
   * @type {null|OnMemoryExceeded}
   */
  #onMemoryExceeded = null;

  /**
   * Set the callback to be triggered when a group exceeds its limit
   * @param {OnMemoryExceeded} callback
   */
  setOnMemoryExceeded(callback) {
    if (typeof callback !== 'function') throw new Error('onMemoryExceeded must be a function');
    this.#onMemoryExceeded = callback;
  }

  /**
   * Clear the onMemoryExceeded callback
   */
  clearOnMemoryExceeded() {
    this.#onMemoryExceeded = null;
  }

  /**
   * @param {Object} options
   * @param {number|null} [options.maxMemory] - Max memory allowed
   * @param {number} [options.maxHits] - Max interactions allowed
   * @param {number} [options.interval] - Time window in milliseconds
   * @param {number} [options.cleanupInterval] - Interval for automatic cleanup (ms)
   * @param {number} [options.maxIdle=300000] - Max idle time for a user before being cleaned (ms)
   */
  constructor({ maxHits, interval, cleanupInterval, maxIdle = 300000, maxMemory = 100000 }) {
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

    if (typeof maxMemory === 'number' && Number.isFinite(maxMemory) && maxMemory > 0) {
      this.#maxMemory = Math.floor(maxMemory);
    } else if (maxMemory === null || maxMemory === undefined) {
      this.#maxMemory = null;
    } else {
      throw new Error('maxMemory must be a positive number or null');
    }

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
   * @type {Map<string, number>}
   * Stores TTL (in ms) for each groupId individually
   */
  groupTTL = new Map();

  /**
   * Set TTL (in milliseconds) for a specific group
   * @param {string} groupId
   * @param {number} ttl
   */
  setGroupTTL(groupId, ttl) {
    if (typeof ttl !== 'number' || !Number.isFinite(ttl) || ttl <= 0)
      throw new Error('TTL must be a positive number in milliseconds');
    this.groupTTL.set(groupId, ttl);
  }

  /**
   * Get TTL (in ms) for a specific group.
   * @param {string} groupId
   * @returns {number|null}
   */
  getGroupTTL(groupId) {
    return this.groupTTL.get(groupId) ?? null;
  }

  /**
   * Delete the TTL setting for a specific group
   * @param {string} groupId
   */
  deleteGroupTTL(groupId) {
    this.groupTTL.delete(groupId);
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
    if (this.#maxMemory !== null && typeof this.#maxMemory === 'number') {
      if (history.length > this.#maxMemory) {
        history.splice(0, history.length - this.#maxMemory);
        if (typeof this.#onMemoryExceeded === 'function') this.#onMemoryExceeded(groupId);
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
    if (process?.env?.NODE_ENV !== 'production')
      console.warn(`[TinyRateLimiter] 'reset()' is deprecated. Use 'resetUser()' instead.`);
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
    if (!Array.isArray(timestamps)) throw new Error('timestamps must be an array of numbers.');
    for (const t of timestamps) {
      if (typeof t !== 'number' || !Number.isFinite(t)) {
        throw new Error('All timestamps must be finite numbers.');
      }
    }
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
   * Cleanup old/inactive groups with individual TTLs
   * @private
   */
  _cleanup() {
    const now = Date.now();
    for (const [groupId, last] of this.lastSeen.entries()) {
      const ttl = this.getGroupTTL(groupId) ?? this.maxIdle;
      if (now - last > ttl) {
        this.groupData.delete(groupId);
        this.lastSeen.delete(groupId);
        this.groupTTL.delete(groupId);
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
   * Get the total number of hits recorded for a group.
   * @param {string} groupId
   * @returns {number}
   */
  getTotalHits(groupId) {
    const history = this.groupData.get(groupId);
    return Array.isArray(history) ? history.length : 0;
  }

  /**
   * Get total hits recorded for a user (via their group).
   * @param {string} userId
   * @returns {number}
   */
  getUserHits(userId) {
    const groupId = this.getGroupId(userId);
    return this.getTotalHits(groupId);
  }

  /**
   * Get the timestamp of the last hit for a group.
   * @param {string} groupId
   * @returns {number|null}
   */
  getLastHit(groupId) {
    const history = this.groupData.get(groupId);
    return history?.length ? history[history.length - 1] : null;
  }

  /**
   * Get milliseconds since the last hit for a group.
   * @param {string} groupId
   * @returns {number|null}
   */
  getTimeSinceLastHit(groupId) {
    const last = this.getLastHit(groupId);
    return last !== null ? Date.now() - last : null;
  }

  /**
   * Internal utility to compute average spacing
   * @private
   * @param {number[]|undefined} history
   * @returns {number|null}
   */
  _calculateAverageSpacing(history) {
    if (!Array.isArray(history) || history.length < 2) return null;
    let total = 0;
    for (let i = 1; i < history.length; i++) {
      total += history[i] - history[i - 1];
    }
    return total / (history.length - 1);
  }

  /**
   * Get average time between hits for a group (ms).
   * @param {string} groupId
   * @returns {number|null}
   */
  getAverageHitSpacing(groupId) {
    return this._calculateAverageSpacing(this.groupData.get(groupId));
  }

  /**
   * Get metrics about a group's activity.
   * @param {string} groupId
   * @returns {{
   *   totalHits: number,
   *   lastHit: number|null,
   *   timeSinceLastHit: number|null,
   *   averageHitSpacing: number|null
   * }}
   */
  getMetrics(groupId) {
    const history = this.groupData.get(groupId);

    if (!Array.isArray(history) || history.length === 0) {
      return {
        totalHits: 0,
        lastHit: null,
        timeSinceLastHit: null,
        averageHitSpacing: null,
      };
    }

    const totalHits = history.length;
    const lastHit = history[totalHits - 1];
    const timeSinceLastHit = Date.now() - lastHit;
    const averageHitSpacing = this._calculateAverageSpacing(history);

    return {
      totalHits,
      lastHit,
      timeSinceLastHit,
      averageHitSpacing,
    };
  }

  /**
   * Destroy the rate limiter, stopping cleanup and clearing data
   */
  destroy() {
    if (this._cleanupTimer) clearInterval(this._cleanupTimer);
    this.groupData.clear();
    this.lastSeen.clear();
    this.userToGroup.clear();
    this.groupTTL.clear();
  }
}

export default TinyRateLimiter;
