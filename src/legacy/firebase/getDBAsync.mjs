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
