// @ts-nocheck

import getDBAsync from './getDBAsync.mjs';
import getDBValue from './getDBValue.mjs';

export default function getDBData(data, type) {
  return new Promise(function (resolve, reject) {
    // Try
    try {
      // Get Data
      getDBAsync(data, type)
        .then((final_data) => resolve(getDBValue(final_data)))
        .catch(reject);
    } catch (err) {
      // Error
      reject(err);
    }
  });
}
