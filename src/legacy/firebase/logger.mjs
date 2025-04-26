// @ts-nocheck

import clone from 'clone';
import logger from 'firebase-functions/logger';

import objType from '../get/objType.mjs';
import isEmulator from './isEmulator.mjs';

/**
 * Recursively handles nested objects and arrays, converting any `BigInt` values
 * into an object with the type `_type_object: 'BIGINT'` and the `value` as a string.
 * This ensures that `BigInt` values are properly serialized and handled.
 *
 * @param {Object|Array} data - The data to process, which can be an object or an array.
 * @returns {Object|Array} The processed data with `BigInt` values converted into objects.
 */
const loopInteraction = function (data) {
  // Check Data
  const interaction = {};
  const checkData = function (item) {
    // Checking
    if (objType(data[item], 'object') || Array.isArray(data[item])) {
      interaction[item] = {};
      interaction[item] = loopInteraction(data[item]);
    }

    // BigInt
    else if (objType(data[item], 'bigint'))
      data[item] = { _type_object: 'BIGINT', value: data[item].toString() };
  };

  // Data
  if (objType(data, 'object') || Array.isArray(data)) for (const item in data) checkData(item);
  else {
    // Get BigInt
    if (objType(data, 'bigint')) data = { _type_object: 'BIGINT', value: data.toString() };
  }

  // Complete
  return data;
};

/**
 * A utility function that handles logging messages based on the environment.
 * If the environment is production and the `firebase-functions/logger` is available,
 * it will use Firebase's logger. Otherwise, it falls back to using the native JavaScript console.
 * The function also handles special cases like `BigInt` serialization and nested objects/arrays.
 *
 * @param {string} type - The type of log message (e.g., `log`, `info`, `warn`, `error`).
 * @param {Arguments} args - The arguments to be logged.
 * @returns {Promise<Record<string, any>>} A promise resolving with the result of the logging operation,
 * or the result of logging to the native console if Firebase logger is not available.
 */
const logBase = async function (type, args) {
  // Production
  if (!isEmulator()) {
    // Exist Log
    if (logger) {
      let consoleData;
      if (objType(args, 'error'))
        consoleData = JSON.parse(JSON.stringify(args, Object.getOwnPropertyNames(args)));
      else consoleData = args;

      for (const item in consoleData) {
        let argData = clone(consoleData[item]);
        loopInteraction(argData);

        if (objType(argData, 'object') || Array.isArray(argData))
          argData = JSON.stringify(argData, null, 2);

        consoleData[item] = argData;
      }

      const result = await logger[type].apply(logger, consoleData);

      return {
        result: result,
        type: 'firebase-functions/logger',
      };
    }

    // Nope
    else
      return {
        result: console[type].apply(console, args),
        type: 'console/javascript-vanilla',
      };
  }

  // Nope
  else
    return {
      result: console[type].apply(console, args),
      type: 'console/javascript-vanilla',
    };
};

// Module
const fbLogger = {
  /**
   * Logs a message with the `log` level. If not in emulator mode, it uses Firebase's logger.
   *
   * @param {...*} args - The arguments to log.
   * @returns {Promise<Record<string, any>>} A promise resolving with the logging result.
   */
  log: function () {
    return logBase('log', arguments);
  },

  /**
   * Logs a message with the `info` level. If not in emulator mode, it uses Firebase's logger.
   *
   * @param {...*} args - The arguments to log.
   * @returns {Promise<Record<string, any>>} A promise resolving with the logging result.
   */
  info: function () {
    return logBase('info', arguments);
  },

  /**
   * Logs a message with the `warn` level. If not in emulator mode, it uses Firebase's logger.
   *
   * @param {...*} args - The arguments to log.
   * @returns {Promise<Record<string, any>>} A promise resolving with the logging result.
   */
  warn: function () {
    return logBase('warn', arguments);
  },

  /**
   * Logs a message with the `error` level. If not in emulator mode, it uses Firebase's logger.
   *
   * @param {...*} args - The arguments to log.
   * @returns {Promise<Record<string, any>>} A promise resolving with the logging result.
   */
  error: function () {
    return logBase('error', arguments);
  },
};

export default fbLogger;
