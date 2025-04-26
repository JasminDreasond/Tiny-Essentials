// @ts-nocheck

import objType from '../get/objType.mjs';
import moment from 'moment-timezone';
import getDBData from './getDBData.mjs';

// DB
const tinyCache = {};
let lastUpdate = { number: null, moment: null };
let cacheLimit = 2000;

// Action
// Error To JSON
if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
      let alt = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true,
  });
}

/**
 * Handles various logging actions (log, error, info, warn) and stores them in the database.
 * Logs data are stored with a timestamp and are counted by type (log, error, info, warn).
 * When the log count exceeds the specified cache limit, the database is cleared and reset.
 *
 * @param {string} where - The location or context where the log is coming from.
 * @param {string} type - The type of log (log, error, info, or warn).
 * @param {Array<*>} args - The arguments to log (can include strings, numbers, objects, arrays, or errors).
 * @returns {Promise<void>} Resolves once the log is stored in the database.
 */
const tinyAction = async function (where, type, args) {
  // Try
  try {
    // Production
    if (!isDebug) {
      // Date Now
      const now = moment();

      // Update Counter
      let count = tinyCache[where].count[type];
      tinyCache[where].count[type]++;

      // New Date
      if (
        (lastUpdate.moment && lastUpdate.moment.date() !== now.date()) ||
        tinyCache[where].count[type] > cacheLimit
      ) {
        await tinyCache[where].db.remove();
        for (const item in tinyCache[where].count) {
          tinyCache[where].count[item] = 0;
        }
      }

      // Update Time
      lastUpdate.moment = now;
      lastUpdate.number = lastUpdate.moment.valueOf();

      // Check Args
      const insertArgs = [];
      for (const item in args) {
        // Is Error
        if (args[item] instanceof Error) {
          try {
            args[item] = JSON.parse(JSON.stringify(args[item]));
          } catch (err) {
            console.error(err);
          }
        }

        // Object Type
        const type = objType(args[item]);

        // Insert Args
        if (type === 'string' || type === 'number' || type === 'object' || type === 'array')
          insertArgs.push(args[item]);
      }

      // Add Log
      if (insertArgs.length > 0) {
        await tinyCache[where].db.child(type).child(count).set({
          time: lastUpdate.number,
          args: insertArgs,
        });
      }

      // Nope
      else {
        tinyCache[where].count[type]--;
        if (tinyCache[where].count[type] < 0) tinyCache[where].count[type] = 0;
      }
    }
  } catch (err) {
    // Error
    console.error(`ERROR IN ${where} (${type})!`);
    console.error(err);
  }
};

// Is Debug
let isDebug = false;

/**
 * Updates the last update time with the provided value, if it's newer than the current one.
 *
 * @param {number} value - The timestamp of the update to check against the last update.
 * @returns {void}
 */
const checkLastTime = function (value) {
  // Update
  if (!lastUpdate.number || value > lastUpdate.number) {
    lastUpdate.moment = moment(value);
    lastUpdate.number = lastUpdate.moment.valueOf();
  }
};

/**
 * Generates a logger object with methods for different types of logging (log, error, info, warn).
 * Each log type is stored in the database with a timestamp and arguments.
 *
 * @param {string} where - The location or context where the log is coming from.
 * @returns {Record<string, any>} The logger object with methods for logging (log, error, info, warn).
 */
const loggerGenerator = function (where) {
  // Done
  return {
    // Log
    log: async function () {
      console.log.apply(console, arguments);
      tinyAction(where, 'log', arguments);
    },

    // Error
    error: async function () {
      console.error.apply(console, arguments);
      tinyAction(where, 'error', arguments);
    },

    // Info
    info: async function () {
      console.info.apply(console, arguments);
      tinyAction(where, 'info', arguments);
    },

    // Warning
    warn: async function () {
      console.warn.apply(console, arguments);
      tinyAction(where, 'warn', arguments);
    },
  };
};

/**
 * Database logger module that manages logging actions and stores logs in a database.
 * It provides functionality to start the logger with a new database instance,
 * retrieve the logger instance, change the cache limit, and set debug mode.
 *
 * @module databaseLogger
 */
const databaseLogger = {
  /**
   * Starts the logger with a new database instance and initializes cache values.
   *
   * @param {Record<string, any>} newDB - The new database instance to use for storing logs.
   * @param {string} where - The context or location where the logger will be used.
   * @returns {Promise<Record<string, any>>} The logger instance with methods for logging.
   */
  start: async function (newDB, where) {
    // Prepare
    tinyCache[where] = { db: newDB, count: { log: 0, error: 0, info: 0, warn: 0 } };
    let loggerCache = null;
    if (!isDebug) {
      loggerCache = await getDBData(tinyCache[where].db);
      if (loggerCache) {
        try {
          if (loggerCache.log) {
            tinyCache[where].count.log = loggerCache.log.length;
            for (const item in loggerCache.log) {
              if (typeof loggerCache.log[item].time === 'number') {
                checkLastTime(loggerCache.log[item].time);
              }
            }
          }
          if (loggerCache.error) {
            tinyCache[where].count.error = loggerCache.error.length;
            for (const item in loggerCache.error) {
              if (typeof loggerCache.error[item].time === 'number') {
                checkLastTime(loggerCache.error[item].time);
              }
            }
          }
          if (loggerCache.info) {
            tinyCache[where].count.info = loggerCache.info.length;
            for (const item in loggerCache.info) {
              if (typeof loggerCache.info[item].time === 'number') {
                checkLastTime(loggerCache.info[item].time);
              }
            }
          }
          if (loggerCache.warn) {
            tinyCache[where].count.warn = loggerCache.warn.length;
            for (const item in loggerCache.warn) {
              if (typeof loggerCache.warn[item].time === 'number') {
                checkLastTime(loggerCache.warn[item].time);
              }
            }
          }
        } catch (err) {
          console.error(err);
          isDebug = true;
        }
      }
    }

    // Complete
    return loggerGenerator(where);
  },

  /**
   * Retrieves the logger instance for a given context.
   *
   * @param {string} where - The context or location where the logger will be used.
   * @returns {Record<string, any>} The logger instance with methods for logging.
   */
  get: function (where) {
    return loggerGenerator(where);
  },

  /**
   * Changes the cache limit for the logger.
   *
   * @param {number} value - The new cache limit to set.
   * @returns {void}
   */
  changeCacheLimit: function (value) {
    if (typeof value === 'number') cacheLimit = value;
  },

  /**
   * Enables or disables debug mode.
   *
   * @param {boolean} value - `true` to enable debug mode, `false` to disable it.
   * @returns {void}
   */
  setDebugMode: function (value) {
    isDebug = value;
  },
};

export default databaseLogger;
