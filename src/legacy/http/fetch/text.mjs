import fetch from 'node-fetch';

/**
 * Performs a `fetch` request using any provided arguments and returns a Promise
 * that resolves with the raw text response.
 *
 * This function is a wrapper around `fetch`, automatically extracting the response body
 * as plain text. It handles both network errors and issues during text parsing.
 *
 * @function getTextFetch
 * @param {...any} arguments - All arguments are forwarded directly to the `fetch` function.
 *                             Typically used as `getTextFetch(url, options)`.
 *
 * @returns {Promise<string>} A Promise that resolves with the response text
 *                            if the request is successful and parsing succeeds,
 *                            or rejects with an error if the request or text conversion fails.
 * @deprecated
 *
 * @example
 * getTextFetch('https://example.com/page')
 *   .then(text => console.log(text))
 *   .catch(err => console.error('Fetch error:', err));
 */
export default function getTextFetch() {
  const tinyArgs = arguments;
  return new Promise((resolve, reject) =>
    fetch
      // @ts-ignore
      .apply(fetch, tinyArgs)
      .then((response) => {
        // Get Response
        response
          .text()
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
