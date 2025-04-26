// @ts-nocheck

/**
 * Executes a Firebase Realtime Database transaction asynchronously.
 * This function uses the `transaction` method of Firebase to apply changes to the database.
 * The provided callback is executed with the current value in the database, and the transaction
 * is committed based on the result returned from the callback.
 *
 * @param {Record<string, any>} data - The Firebase database reference object on which the transaction will be performed.
 * @param {Function} callback - A function that accepts the current value of the data and returns the updated value.
 * @returns {Promise} Resolves with the result of the transaction or rejects with an error if the transaction fails.
 */
export default async function transactionDBAsync(data, callback) {
  return new Promise(async function (resolve, reject) {
    // Try
    try {
      // The Transaction
      const result = await data.transaction(
        function (current_value) {
          return callback(current_value);
        },
        function (errorObject) {
          reject(errorObject);
        },
      );
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}
