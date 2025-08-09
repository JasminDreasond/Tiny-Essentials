/** @typedef {(groupId: string) => void} OnMemoryExceeded */

/** @typedef {(groupId: string) => void} OnGroupExpired */

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

  /** @type {NodeJS.Timeout|null} */
  #cleanupTimer = null;

  /** @type {number|null|undefined} */
  #maxHits = null;

  /** @type {number|null|undefined} */
  #interval = null;

  /** @type {number|null|undefined} */
  #cleanupInterval = null;

  /** @type {number|null|undefined} */
  #maxIdle = null;

  /** @type {Map<string, number[]>} */
  groupData = new Map(); // groupId -> timestamps[]

  /** @type {Map<string, number>} */
  lastSeen = new Map(); // groupId -> timestamp

  /** @type {Map<string, string>} */
  userToGroup = new Map(); // userId -> groupId

  /** @type {Map<string, boolean>} */
  groupFlags = new Map(); // groupId -> boolean

  /**
   * @type {Map<string, number>}
   * Stores TTL (in ms) for each groupId individually
   */
  groupTTL = new Map();

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
   * @type {null|OnGroupExpired}
   */
  #onGroupExpired = null;

  /**
   * Set the callback to be triggered when a group expires and is removed.
   *
   * This callback is called automatically during cleanup when a group
   * becomes inactive for longer than its TTL.
   *
   * @param {OnGroupExpired} callback - A function that receives the expired groupId.
   */
  setOnGroupExpired(callback) {
    if (typeof callback !== 'function') throw new Error('onGroupExpired must be a function');
    this.#onGroupExpired = callback;
  }

  /**
   * Clear the onGroupExpired callback
   */
  clearOnGroupExpired() {
    this.#onGroupExpired = null;
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

    this.#maxHits = isMaxHitsValid ? maxHits : null;
    this.#interval = isIntervalValid ? interval : null;
    this.#cleanupInterval = isCleanupValid ? cleanupInterval : null;
    this.#maxIdle = maxIdle;

    // Start automatic cleanup only if cleanupInterval is valid
    if (this.#cleanupInterval !== null)
      this.#cleanupTimer = setInterval(() => this._cleanup(), this.#cleanupInterval);
  }

  /**
   * Check if a given ID is a groupId (not a userId)
   * @param {string} id
   * @returns {boolean}
   */
  isGroupId(id) {
    const result = this.groupFlags.get(id);
    return typeof result === 'boolean' ? result : false;
  }

  /**
   * Get all user IDs that belong to a given group.
   * @param {string} groupId
   * @returns {string[]}
   */
  getUsersInGroup(groupId) {
    const users = [];
    for (const [userId, assignedGroup] of this.userToGroup.entries()) {
      if (assignedGroup === groupId) {
        users.push(userId);
      }
    }

    return users;
  }

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
   * Assign a userId to a groupId, with merge if user has existing data.
   * @param {string} userId
   * @param {string} groupId
   * @throws {Error} If userId is already assigned to a different group
   */
  assignToGroup(userId, groupId) {
    const existingGroup = this.userToGroup.get(userId);
    if (existingGroup && existingGroup !== groupId)
      throw new Error(`User ${userId} is already assigned to group ${existingGroup}`);

    // If the user is already in the group, nothing needs to be done
    if (existingGroup === groupId) return;
    const userData = this.groupData.get(userId);

    // Associates the user to the group
    if (this.isGroupId(userId)) {
      for (const [uid, gId] of this.userToGroup.entries())
        if (gId === userId) this.userToGroup.set(uid, groupId);
      this.userToGroup.delete(userId);
    } else this.userToGroup.set(userId, groupId);

    // If the user has no data, nothing needs to be done
    if (!userData) return;

    const groupData = this.groupData.get(groupId);
    if (groupData) {
      for (const item of userData) groupData.push(item);
    } else {
      const newData = [];
      for (const item of userData) newData.push(item);
      this.groupData.set(groupId, newData);
    }

    this.lastSeen.set(groupId, Date.now());

    // Removes individual data as they are now in the group
    this.groupFlags.delete(userId);
    this.groupData.delete(userId);
    this.lastSeen.delete(userId);
    this.groupTTL.delete(userId);
    this.groupFlags.set(groupId, true);
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
      this.groupFlags.set(groupId, false);
    }

    const history = this.groupData.get(groupId);
    if (!history) throw new Error(`No data found for groupId: ${groupId}`);

    history.push(now);
    this.lastSeen.set(groupId, now);

    // Clean up old entries
    if (this.#interval !== null) {
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
    if (!this.groupData.has(groupId)) return false;

    const history = this.groupData.get(groupId);
    if (!history) throw new Error(`No data found for groupId: ${groupId}`);

    if (this.#interval !== null) {
      const now = Date.now();
      const interval = this.getInterval();
      const cutoff = now - interval;
      let count = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i] > cutoff) count++;
        else break;
      }
      if (this.#maxHits !== null) return count > this.getMaxHits();
      return count > 0;
    }

    if (this.#maxHits !== null) {
      return history.length > this.getMaxHits();
    }

    return false;
  }

  /**
   * Manually reset group data
   * @param {string} groupId
   */
  resetGroup(groupId) {
    this.groupFlags.delete(groupId);
    this.groupData.delete(groupId);
    this.lastSeen.delete(groupId);
    this.groupTTL.delete(groupId);
  }

  /**
   * Manually reset a user mapping
   * @param {string} userId
   */
  resetUserGroup(userId) {
    this.userToGroup.delete(userId);
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
    if (!this.groupData.has(groupId)) this.groupFlags.set(groupId, false);
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
   * Get the maximum idle time (in milliseconds) before a group is considered expired.
   * @returns {number}
   */
  getMaxIdle() {
    if (typeof this.#maxIdle !== 'number' || !Number.isFinite(this.#maxIdle) || this.#maxIdle < 0) {
      throw new Error("'maxIdle' must be a non-negative finite number.");
    }
    return this.#maxIdle;
  }

  /**
   * Set the maximum idle time (in milliseconds) before a group is considered expired.
   * @param {number} ms
   */
  setMaxIdle(ms) {
    if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) {
      throw new Error("'maxIdle' must be a non-negative finite number.");
    }
    this.#maxIdle = ms;
  }

  /**
   * Cleanup old/inactive groups with individual TTLs
   * @private
   */
  _cleanup() {
    const now = Date.now();
    for (const [groupId, last] of this.lastSeen.entries()) {
      const ttl = this.getGroupTTL(groupId) ?? this.getMaxIdle();
      if (now - last > ttl) {
        this.groupFlags.delete(groupId);
        this.groupData.delete(groupId);
        this.lastSeen.delete(groupId);
        this.groupTTL.delete(groupId);

        // Notify subclass or external binding
        if (typeof this.#onGroupExpired === 'function') {
          this.#onGroupExpired(groupId);
        }
      }
    }
  }

  /**
   * Get list of active group IDs
   * @returns {string[]}
   */
  getActiveGroups() {
    return Array.from(this.groupData.keys());
  }

  /**
   * Get a shallow copy of all user-to-group mappings as a plain object
   * @returns {Record<string, string>}
   */
  getAllUserMappings() {
    return Object.fromEntries(this.userToGroup);
  }

  /**
   * Get the interval window in milliseconds.
   * @returns {number}
   */
  getInterval() {
    if (typeof this.#interval !== 'number' || !Number.isFinite(this.#interval)) {
      throw new Error("'interval' is not a valid finite number.");
    }
    return this.#interval;
  }

  /**
   * Get the maximum number of allowed hits.
   * @returns {number}
   */
  getMaxHits() {
    if (typeof this.#maxHits !== 'number' || !Number.isFinite(this.#maxHits)) {
      throw new Error("'maxHits' is not a valid finite number.");
    }
    return this.#maxHits;
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
    if (this.#cleanupTimer) clearInterval(this.#cleanupTimer);
    this._cleanup();
    this.groupData.clear();
    this.lastSeen.clear();
    this.userToGroup.clear();
    this.groupTTL.clear();
    this.groupFlags.clear();
  }
}

export default TinyRateLimiter;
