// @ts-nocheck

/**
 * Fetches data from a Firebase database asynchronously using the specified event type.
 * This function wraps the Firebase database `once` method in a Promise, allowing asynchronous handling of database responses.
 *
 * @param {firebase.database.Reference} data - The Firebase database reference from which to retrieve data.
 * @param {string} [type='value'] - The event type to listen for (e.g., 'value', 'child_added', 'child_changed', etc.).
 * @returns {Promise<firebase.database.DataSnapshot>} A promise that resolves with the snapshot data when the request is successful.
 * @throws {Error} If an error occurs during the database operation, the promise will be rejected with the error.
 */
export default function getDBAsync(data, type = 'value') {
  return new Promise(function (resolve, reject) {
    // Try
    try {
      // Run Data
      data.once(
        type,
        function (snapshot) {
          resolve(snapshot);
        },
        function (errorObject) {
          reject(errorObject);
        },
      );
    } catch (err) {
      // Error
      reject(err);
    }
  });
}
