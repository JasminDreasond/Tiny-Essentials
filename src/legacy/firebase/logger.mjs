import clone from 'clone';
import logger from 'firebase-functions/logger';

import objType from '../get/objType.mjs';
import isEmulator from './isEmulator.mjs';

// Fix BigInt
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

// Module Base
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
module.exports = {
  // Log
  log: function () {
    return logBase('log', arguments);
  },

  // Info
  info: function () {
    return logBase('info', arguments);
  },

  // Warn
  warn: function () {
    return logBase('warn', arguments);
  },

  // Error
  error: function () {
    return logBase('error', arguments);
  },
};
