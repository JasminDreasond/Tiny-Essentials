import getDBAsync from './getDBAsync.mjs';
import getDBValue from './getDBValue.mjs';

export default function getDBData(data, type) {
  return new Promise(function (resolve, reject) {
    // Try
    try {
      // Get Data
      getDBAsync(data, type)
        .then((final_data) => {
          // Convert Data
          resolve(getDBValue(final_data));
          return;
        })
        .catch((err) => {
          reject(err);
          return;
        });
    } catch (err) {
      // Error
      reject(err);
    }
  });
}
