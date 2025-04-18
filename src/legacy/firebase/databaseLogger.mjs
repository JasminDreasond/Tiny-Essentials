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
      var alt = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true,
  });
}

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
        if (type === 'string' || type === 'number' || type === 'object' || type === 'array') {
          insertArgs.push(args[item]);
        }
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
        if (tinyCache[where].count[type] < 0) {
          tinyCache[where].count[type] = 0;
        }
      }
    }
  } catch (err) {
    // Error
    console.error(`ERROR IN ${where} (${type})!`);
    console.error(err);
  }

  // Complete
  return;
};

// Is Debug
let isDebug = false;

// Modules
const checkLastTime = function (value) {
  // Update
  if (!lastUpdate.number || value > lastUpdate.number) {
    lastUpdate.moment = moment(value);
    lastUpdate.number = lastUpdate.moment.valueOf();
  }

  // Complete
  return;
};

// Functions Generator
const loggerGenerator = function (where) {
  // Done
  return {
    // Log
    log: async function () {
      console.log.apply(console, arguments);
      tinyAction(where, 'log', arguments);
      return;
    },

    // Error
    error: async function () {
      console.error.apply(console, arguments);
      tinyAction(where, 'error', arguments);
      return;
    },

    // Info
    info: async function () {
      console.info.apply(console, arguments);
      tinyAction(where, 'info', arguments);
      return;
    },

    // Warning
    warn: async function () {
      console.warn.apply(console, arguments);
      tinyAction(where, 'warn', arguments);
      return;
    },
  };
};

// Module
const databaseLogger = {
  // Start
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
    delete loggerCache;
    return loggerGenerator(where);
  },

  // Get
  get: function (where) {
    return loggerGenerator(where);
  },

  // Cache Limit
  changeCacheLimit: function (value) {
    if (typeof value === 'number') {
      cacheLimit = value;
    }
    return;
  },

  // Set Is Debug
  setDebugMode: function (value) {
    isDebug = value;
    return;
  },
};

export default databaseLogger;
