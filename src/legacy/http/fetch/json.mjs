import fetch from 'node-fetch';

/**
 * Performs a `fetch` request using any provided arguments and returns a Promise
 * that resolves with the parsed JSON response.
 *
 * This function acts as a wrapper around `fetch`, automatically parsing the
 * response body as JSON and handling errors both at the network level and
 * during JSON parsing.
 *
 * @function getJsonFetch
 * @param {...any} arguments - All arguments are forwarded directly to the `fetch` function.
 *                            Common usage is `getJsonFetch(url, options)`.
 *
 * @returns {Promise<any>} A Promise that resolves with the parsed JSON data
 *                         if the request succeeds and the response is valid JSON,
 *                         or rejects with an error if the request or parsing fails.
 * @deprecated
 *
 * @example
 * getJsonFetch('https://api.example.com/data')
 *   .then(data => console.log(data))
 *   .catch(err => console.error('Fetch error:', err));
 */
export default function getJsonFetch() {
  const tinyArgs = arguments;
  return new Promise((resolve, reject) =>
    fetch
      // @ts-ignore
      .apply(fetch, tinyArgs)
      .then((response) => {
        // Get Response
        response
          .json()
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      }),
  );
}
