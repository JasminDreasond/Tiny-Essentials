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
